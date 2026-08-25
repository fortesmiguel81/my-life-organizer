"use client";

import type { DraggableProvidedDragHandleProps } from "@hello-pangea/dnd";
import { TrendingDown, TrendingUp, Wallet } from "lucide-react";

import { convertAmountFromMiliunits, formatCurrency } from "@/lib/utils";

import Sparkline from "../sparkline";
import WidgetCard from "../widget-card";

type Props = {
  totalBalance: number;
  monthNet: number;
  budgetTotal: number;
  budgetSpent: number;
  sparkline: number[];
  dragHandleProps?: DraggableProvidedDragHandleProps | null;
};

export default function FinanceWidget({
  totalBalance,
  monthNet,
  budgetTotal,
  budgetSpent,
  sparkline,
  dragHandleProps,
}: Props) {
  const budgetPct =
    budgetTotal > 0 ? Math.round((budgetSpent / budgetTotal) * 100) : null;
  const netPositive = monthNet >= 0;

  return (
    <WidgetCard
      dragHandleProps={dragHandleProps}
      icon={Wallet}
      title="Finance"
      href="/finance"
      linkLabel="View finance"
      chip={
        budgetPct === null
          ? undefined
          : {
              label: `${budgetPct}% of budget`,
              tone:
                budgetPct >= 100 ? "bad" : budgetPct >= 80 ? "warn" : "good",
            }
      }
    >
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="text-2xl font-bold tabular-nums">
          {formatCurrency(convertAmountFromMiliunits(totalBalance))}
          <span className="ml-1 text-sm font-medium text-muted-foreground">
            total balance
          </span>
        </div>
        <div
          className={
            netPositive
              ? "flex items-center gap-1 text-xs font-semibold tabular-nums text-emerald-600 dark:text-emerald-400"
              : "flex items-center gap-1 text-xs font-semibold tabular-nums text-destructive"
          }
        >
          {netPositive ? (
            <TrendingUp className="size-3" />
          ) : (
            <TrendingDown className="size-3" />
          )}
          {netPositive ? "+" : ""}
          {formatCurrency(convertAmountFromMiliunits(monthNet))} this month
        </div>
      </div>
      <Sparkline values={sparkline} className="mt-2" />
      {budgetTotal > 0 && (
        <div className="mt-2 space-y-1.5">
          <p className="text-xs text-muted-foreground">
            {formatCurrency(convertAmountFromMiliunits(budgetSpent))} spent of{" "}
            {formatCurrency(convertAmountFromMiliunits(budgetTotal))} budget
          </p>
          <div className="h-1.5 overflow-hidden rounded-full bg-muted">
            <div
              className={
                (budgetPct ?? 0) >= 100
                  ? "h-full rounded-full bg-destructive"
                  : (budgetPct ?? 0) >= 80
                    ? "h-full rounded-full bg-amber-500"
                    : "h-full rounded-full bg-emerald-500"
              }
              style={{ width: `${Math.min(budgetPct ?? 0, 100)}%` }}
            />
          </div>
        </div>
      )}
    </WidgetCard>
  );
}
