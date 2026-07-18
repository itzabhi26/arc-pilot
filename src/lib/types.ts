export type TxDirection = "in" | "out" | "swap";
export type TxStatus = "confirmed" | "pending" | "failed";

export interface Transaction {
  id: string;
  direction: TxDirection;
  label: string;
  counterparty: string;
  amount: number;
  status: TxStatus;
  timestamp: Date;
  hash: string;
  category?: SpendingCategory;
}

export type SpendingCategory =
  | "Food"
  | "Rent"
  | "Shopping"
  | "Bills"
  | "Entertainment"
  | "Transport"
  | "Healthcare"
  | "Investment"
  | "Salary"
  | "Other";

export interface CategorySlice {
  category: SpendingCategory;
  percent: number;
  amount: number;
  color: string;
}

export interface AiInsight {
  id: string;
  tone: "positive" | "neutral" | "warning";
  title: string;
  detail: string;
}

export interface ChartPoint {
  label: string;
  value: number;
}

export type TxModalType = "deposit" | "withdraw" | "send" | "receive" | "history" | null;
export type TxModalStage = "form" | "processing" | "success";
