import type { SpendingCategory } from "./types";

export const SPENDING_CATEGORIES: SpendingCategory[] = [
  "Food",
  "Rent",
  "Shopping",
  "Bills",
  "Entertainment",
  "Transport",
  "Healthcare",
  "Investment",
  "Salary",
  "Other",
];

/** Stable brand-matched color per category, used in charts and chips. */
export const CATEGORY_COLOR: Record<SpendingCategory, string> = {
  Food: "#F59E0B",
  Rent: "#8B5CF6",
  Shopping: "#EC4899",
  Bills: "#EF4444",
  Entertainment: "#3D5AFE",
  Transport: "#06B6D4",
  Healthcare: "#16A34A",
  Investment: "#A78BFA",
  Salary: "#22C55E",
  Other: "#9297AF",
};
