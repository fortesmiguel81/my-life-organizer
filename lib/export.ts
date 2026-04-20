import { format } from "date-fns";

import { formatCurrency } from "./utils";

function downloadCSV(rows: string[][], filename: string) {
  const csv = rows
    .map((row) =>
      row
        .map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`)
        .join(",")
    )
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportTransactionsToCSV(
  transactions: {
    date: string | Date;
    payee: string;
    description: string;
    account: string;
    category?: string | null;
    type?: string | null;
    amount: number;
    recurrence?: string | null;
  }[]
) {
  const header = ["Date", "Payee", "Description", "Account", "Category", "Type", "Amount", "Repeat"];
  const rows = transactions.map((t) => [
    format(new Date(t.date), "yyyy-MM-dd"),
    t.payee,
    t.description ?? "",
    t.account,
    t.category ?? "Uncategorized",
    t.type ?? "expense",
    formatCurrency(t.amount),
    t.recurrence ?? "none",
  ]);

  downloadCSV([header, ...rows], `transactions-${format(new Date(), "yyyy-MM-dd")}.csv`);
}

export function exportAccountsToCSV(
  accounts: {
    name: string;
    holder: string;
    number: string;
    balance: number;
  }[]
) {
  const header = ["Name", "Holder", "IBAN", "Balance"];
  const rows = accounts.map((a) => [
    a.name,
    a.holder,
    a.number,
    formatCurrency(a.balance),
  ]);

  downloadCSV([header, ...rows], `accounts-${format(new Date(), "yyyy-MM-dd")}.csv`);
}

export function exportBudgetsToCSV(
  budgets: {
    category: string;
    amount: number;
    amountSpent: number;
    type: string;
    numberOfTransactions: number;
  }[]
) {
  const header = ["Category", "Budget", "Spent", "Remaining", "Period", "Transactions"];
  const rows = budgets.map((b) => [
    b.category,
    formatCurrency(b.amount),
    formatCurrency(b.amountSpent),
    formatCurrency(b.amount - b.amountSpent),
    b.type,
    String(b.numberOfTransactions),
  ]);

  downloadCSV([header, ...rows], `budgets-${format(new Date(), "yyyy-MM-dd")}.csv`);
}
