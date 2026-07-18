import type { AiInsight, ChartPoint, SpendingCategory, Transaction } from "./types";
import { CATEGORY_COLOR } from "./categories";

/** Reconstructs a real balance trajectory by walking transactions backward
 * from the current known on-chain balance — an honest substitute for
 * fabricated historical snapshots, since Arc Testnet has no balance-history
 * indexer available client-side. Ignores gas fees for simplicity. */
export function reconstructBalanceHistory(
  transactions: Transaction[],
  currentBalance: number,
  windowDays: number
): ChartPoint[] {
  const now = Date.now();
  const cutoff = now - windowDays * 86400000;
  const inWindow = transactions
    .filter((t) => t.timestamp.getTime() >= cutoff && t.status !== "failed")
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  if (inWindow.length === 0) {
    return [
      { label: "start", value: currentBalance },
      { label: "now", value: currentBalance },
    ];
  }

  const points: ChartPoint[] = [{ label: "now", value: currentBalance }];
  let running = currentBalance;
  inWindow.forEach((t) => {
    running -= t.amount;
    points.push({
      label: t.timestamp.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      value: Math.max(0, running),
    });
  });
  return points.reverse();
}

export function totalSent(transactions: Transaction[]) {
  return Math.abs(
    transactions.filter((t) => t.amount < 0).reduce((s, t) => s + t.amount, 0)
  );
}

export function totalReceived(transactions: Transaction[]) {
  return transactions.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0);
}

export function successRate(transactions: Transaction[]) {
  if (transactions.length === 0) return null;
  const confirmed = transactions.filter((t) => t.status !== "failed").length;
  return Math.round((confirmed / transactions.length) * 100);
}

/** Outgoing / incoming / pending split by volume — a real substitute for
 * fabricated lifestyle categories, since raw on-chain transfers carry no
 * merchant metadata to categorize by. */
export function flowBreakdown(transactions: Transaction[]) {
  const out = totalSent(transactions);
  const inn = totalReceived(transactions);
  const pending = transactions
    .filter((t) => t.status === "pending")
    .reduce((s, t) => s + Math.abs(t.amount), 0);
  const total = out + inn || 1;
  return [
    { label: "Sent", amount: out, percent: Math.round((out / total) * 100), color: "#EF4577" },
    { label: "Received", amount: inn, percent: Math.round((inn / total) * 100), color: "#16A34A" },
    { label: "Pending", amount: pending, percent: Math.round((pending / total) * 100), color: "#F5A623" },
  ].filter((s) => s.amount > 0);
}

/** Last N days of net outgoing volume, bucketed by day — real timestamps. */
export function dailySeries(transactions: Transaction[], days: number): ChartPoint[] {
  const now = Date.now();
  const buckets = new Map<string, number>();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now - i * 86400000);
    buckets.set(d.toLocaleDateString("en-US", { weekday: "short" }), 0);
  }
  transactions.forEach((t) => {
    const ageDays = (now - t.timestamp.getTime()) / 86400000;
    if (ageDays > days || t.amount >= 0) return;
    const label = t.timestamp.toLocaleDateString("en-US", { weekday: "short" });
    if (buckets.has(label)) {
      buckets.set(label, (buckets.get(label) ?? 0) + Math.abs(t.amount));
    }
  });
  return Array.from(buckets.entries()).map(([label, value]) => ({ label, value }));
}

export interface FinancialHealthResult {
  hasEnoughData: boolean;
  overall: number;
  factors: { label: string; score: number }[];
}

export function computeFinancialHealth(
  transactions: Transaction[],
  balance: number
): FinancialHealthResult {
  if (transactions.length < 2) {
    return { hasEnoughData: false, overall: 0, factors: [] };
  }

  const rate = successRate(transactions) ?? 100;

  const last7 = dailySeries(transactions, 7).map((p) => p.value);
  const avgDaily = last7.reduce((a, b) => a + b, 0) / 7;
  const mean = avgDaily || 0.0001;
  const variance =
    last7.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / last7.length;
  const stdev = Math.sqrt(variance);
  const consistency = Math.max(0, Math.min(100, Math.round(100 - (stdev / mean) * 40)));

  const runwayDays = avgDaily > 0 ? balance / avgDaily : 30;
  const runwayScore = Math.max(0, Math.min(100, Math.round((runwayDays / 30) * 100)));

  const factors = [
    { label: "Spending consistency", score: consistency },
    { label: "Balance runway", score: runwayScore },
    { label: "Transaction success rate", score: rate },
  ];
  const overall = Math.round(factors.reduce((s, f) => s + f.score, 0) / factors.length);

  return { hasEnoughData: true, overall, factors };
}

export function generateInsights(transactions: Transaction[], balance: number): AiInsight[] {
  if (transactions.length === 0) {
    return [
      {
        id: "empty",
        tone: "neutral",
        title: "No activity yet",
        detail:
          "Once you send, receive, or deposit USDC, FinPilot will start surfacing real insights here.",
      },
    ];
  }

  const insights: AiInsight[] = [];
  const rate = successRate(transactions);
  const sent = totalSent(transactions);
  const received = totalReceived(transactions);
  const failed = transactions.filter((t) => t.status === "failed").length;

  if (rate !== null) {
    insights.push({
      id: "success-rate",
      tone: rate >= 90 ? "positive" : rate >= 70 ? "neutral" : "warning",
      title: `${rate}% of transactions confirmed successfully`,
      detail: `${transactions.length} transaction${transactions.length === 1 ? "" : "s"} tracked on Arc Testnet for this address.`,
    });
  }

  insights.push({
    id: "net-flow",
    tone: received >= sent ? "positive" : "neutral",
    title:
      received >= sent
        ? "Inflows are outpacing outflows"
        : "You're sending more than you're receiving",
    detail: `Received $${received.toFixed(2)} vs sent $${sent.toFixed(2)} USDC across tracked activity.`,
  });

  const topCategory = topSpendingCategory(transactions);
  if (topCategory && topCategory.category !== "Other") {
    insights.push({
      id: "top-category",
      tone: "neutral",
      title: `${topCategory.category} is your top spending category`,
      detail: `${topCategory.percent}% of tagged outgoing volume ($${topCategory.amount.toFixed(2)} USDC) across ${topCategory.count} transaction${topCategory.count === 1 ? "" : "s"}.`,
    });
  }

  if (failed > 0) {
    insights.push({
      id: "failed",
      tone: "warning",
      title: `${failed} failed transaction${failed === 1 ? "" : "s"}`,
      detail: "Check gas settings or recipient address before retrying.",
    });
  } else {
    insights.push({
      id: "balance",
      tone: "neutral",
      title: `Current balance: $${balance.toFixed(2)} USDC`,
      detail: "Balance is read live from Arc Testnet on every refresh.",
    });
  }

  return insights.slice(0, 3);
}

export function answerFromData(
  question: string,
  transactions: Transaction[],
  balance: number
) {
  const lower = question.toLowerCase();
  const sent = totalSent(transactions);
  const received = totalReceived(transactions);
  const rate = successRate(transactions);

  if (transactions.length === 0) {
    return "I don't see any on-chain activity for this address yet — once you send, receive, or deposit USDC on Arc Testnet, I'll be able to answer questions grounded in your real transaction history.";
  }
  if (lower.includes("biggest") || lower.includes("largest")) {
    const biggest = [...transactions].sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount))[0];
    return `Your largest transaction was ${Math.abs(biggest.amount).toFixed(2)} USDC (${biggest.direction === "in" ? "received" : "sent"}) on ${biggest.timestamp.toLocaleDateString()}.`;
  }
  if (lower.includes("fail")) {
    const failed = transactions.filter((t) => t.status === "failed").length;
    return failed > 0
      ? `You have ${failed} failed transaction${failed === 1 ? "" : "s"} out of ${transactions.length} tracked.`
      : "No failed transactions in your recent activity — everything has confirmed successfully.";
  }
  if (lower.includes("balance")) {
    return `Your current balance is $${balance.toFixed(2)} USDC, read live from Arc Testnet.`;
  }
  if (lower.includes("spend") || lower.includes("sent") || lower.includes("send")) {
    return `You've sent a total of $${sent.toFixed(2)} USDC across ${transactions.filter((t) => t.amount < 0).length} outgoing transaction(s).`;
  }
  if (lower.includes("receiv")) {
    return `You've received a total of $${received.toFixed(2)} USDC across ${transactions.filter((t) => t.amount > 0).length} incoming transaction(s).`;
  }
  if (lower.includes("categor")) {
    const slices = categoryBreakdown(transactions);
    if (slices.length === 0) {
      return "You don't have any categorized spending yet — pick a category next time you send funds and I'll break it down here.";
    }
    return `Your spending by category: ${slices
      .map((s) => `${s.category} $${s.amount.toFixed(2)} (${s.percent}%)`)
      .join(", ")}.`;
  }
  return `Across ${transactions.length} tracked transactions: $${received.toFixed(2)} received, $${sent.toFixed(2)} sent, ${rate ?? 100}% success rate, and a current balance of $${balance.toFixed(2)} USDC.`;
}

/** Category breakdown of outgoing spend, from user-tagged transactions —
 * powers the AI category analysis. Transactions without an explicit tag
 * (e.g. pulled from the explorer) fall under "Other". */
export interface CategoryBreakdownSlice {
  category: SpendingCategory;
  amount: number;
  percent: number;
  color: string;
  count: number;
}

export function categoryBreakdown(transactions: Transaction[]): CategoryBreakdownSlice[] {
  const outgoing = transactions.filter((t) => t.amount < 0 && t.status !== "failed");
  const totals = new Map<SpendingCategory, { amount: number; count: number }>();
  outgoing.forEach((t) => {
    const cat = t.category ?? "Other";
    const prev = totals.get(cat) ?? { amount: 0, count: 0 };
    totals.set(cat, { amount: prev.amount + Math.abs(t.amount), count: prev.count + 1 });
  });
  const total = Array.from(totals.values()).reduce((s, v) => s + v.amount, 0) || 1;
  return Array.from(totals.entries())
    .map(([category, v]) => ({
      category,
      amount: v.amount,
      count: v.count,
      percent: Math.round((v.amount / total) * 100),
      color: CATEGORY_COLOR[category],
    }))
    .sort((a, b) => b.amount - a.amount);
}

export function topSpendingCategory(transactions: Transaction[]): CategoryBreakdownSlice | null {
  const slices = categoryBreakdown(transactions);
  return slices.length > 0 ? slices[0] : null;
}
