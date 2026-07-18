"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import { WelcomeCard } from "./welcome-card";
import { BalanceCards } from "./balance-cards";
import { AiInsightsStrip } from "./ai-insights";
import { RecentTransactions } from "./recent-transactions";
import { SpendingOverview } from "./spending-overview";
import { FinancialHealth } from "./financial-health";
import { AnalyticsPanel } from "./analytics-panel";
import { AiFinancialFeed } from "./ai-feed";
import { AiAgentPage } from "./ai-agent-page";
import { AnalyticsPage } from "./analytics-page";
import { HistoryPage } from "./history-page";
import { PortfolioPage } from "./portfolio-page";
import { SettingsPage } from "./settings-page";
import { SmartWalletPanel } from "@/components/wallet/smart-wallet-panel";
import { TransactionModal } from "@/components/wallet/transaction-modal";
import { useApp } from "@/components/providers/app-provider";
import { ArcLogo } from "@/components/logo";
import { totalSent as computeTotalSent } from "@/lib/analytics";
import type { TxModalType } from "@/lib/types";

const sectionTitle: Record<string, string> = {
  dashboard: "Dashboard",
  "ai-agent": "AI Agent",
  analytics: "Analytics",
  history: "History",
  portfolio: "Portfolio",
  settings: "Settings",
};

export function DashboardShell() {
  const { username, transactions, historyLoading, balance, balanceLoading } = useApp();
  const [modal, setModal] = React.useState<TxModalType>(null);
  const [mobileNavOpen, setMobileNavOpen] = React.useState(false);
  const [section, setSection] = React.useState("dashboard");

  const totalSent = computeTotalSent(transactions);

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar active={section} onNavigate={setSection} />

      {/* Mobile top nav */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-30 glass flex items-center justify-between px-4 py-3">
        <ArcLogo size={28} />
        <button
          onClick={() => setMobileNavOpen(true)}
          className="focus-ring h-9 w-9 rounded-full bg-surface border border-border-soft flex items-center justify-center"
        >
          <Menu className="h-4 w-4" />
        </button>
      </div>
      {mobileNavOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/40" onClick={() => setMobileNavOpen(false)}>
          <div className="absolute left-0 top-0 bottom-0 w-72 bg-surface p-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <ArcLogo size={28} />
              <button onClick={() => setMobileNavOpen(false)} className="focus-ring h-8 w-8 flex items-center justify-center">
                <X className="h-4 w-4" />
              </button>
            </div>
            <Sidebar
              active={section}
              onNavigate={(k) => {
                setSection(k);
                setMobileNavOpen(false);
              }}
            />
          </div>
        </div>
      )}

      <main className="flex-1 min-w-0 px-5 sm:px-8 py-6 lg:py-8 pt-20 lg:pt-8">
        <Topbar username={username} onOpenSettings={() => setSection("settings")} />

        {section === "dashboard" ? (
          <div className="flex flex-col xl:flex-row gap-6 items-start">
            <div className="flex-1 min-w-0 w-full">
              <WelcomeCard onOpenAgent={() => setSection("ai-agent")} transactions={transactions} balance={balance} />
              <BalanceCards balance={balance} balanceLoading={balanceLoading} totalSent={totalSent} transactions={transactions} />
              <AiInsightsStrip transactions={transactions} balance={balance} />

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
                <RecentTransactions transactions={transactions} loading={historyLoading} onViewAll={() => setModal("history")} />
                <SpendingOverview transactions={transactions} />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
                <div className="lg:col-span-2">
                  <AnalyticsPanel transactions={transactions} />
                </div>
                <FinancialHealth transactions={transactions} balance={balance} />
              </div>

              <AiFinancialFeed transactions={transactions} balance={balance} />
            </div>

            <SmartWalletPanel onAction={(type) => setModal(type)} />
          </div>
        ) : (
          <SectionBody section={section}>
            {section === "ai-agent" && <AiAgentPage />}
            {section === "analytics" && <AnalyticsPage transactions={transactions} balance={balance} />}
            {section === "history" && <HistoryPage />}
            {section === "portfolio" && <PortfolioPage balance={balance} transactions={transactions} />}
            {section === "settings" && <SettingsPage />}
          </SectionBody>
        )}
      </main>

      <TransactionModal type={modal} onClose={() => setModal(null)} />
    </div>
  );
}

function SectionBody({ section, children }: { section: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-ink-900 mb-4">{sectionTitle[section]}</h2>
      <AnimatePresence mode="wait">
        <motion.div key={section} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
