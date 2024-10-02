import { InferResponseType } from "hono";
import { TriangleAlert } from "lucide-react";

import Icon from "@/components/icon";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useOpenBudget } from "@/features/budgets/hooks/use-open-budget";
import { client } from "@/lib/hono";
import { formatCurrency } from "@/lib/utils";

import { BudgetChart } from "./budget-chart";

type BudgetsResponseType = InferResponseType<
  typeof client.api.budgets.$get,
  200
>["data"][0];

type Props = {
  budget: BudgetsResponseType;
};

export default function BudgetCard({ budget }: Props) {
  const { onOpen } = useOpenBudget();

  const chartData = {
    amount: budget.amount,
    amountSpent: budget.amountSpent,
    category: budget.category,
  };

  return (
    <Card
      className="hover:cursor-pointer hover:bg-muted/50"
      onClick={() => onOpen(budget.id)}
    >
      <CardHeader className="relative pb-2">
        <CardTitle className="flex items-center text-2xl">
          <Icon name={budget.categoryIcon || ""} className="mr-2 h-6 w-6" />
          {budget.category}
        </CardTitle>
        <CardDescription>{budget.categoryDescription}</CardDescription>
      </CardHeader>
      <CardContent className="p-3">
        <BudgetChart data={chartData} />
      </CardContent>
      <CardFooter className="flex flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 text-center font-medium leading-none">
          {formatCurrency(budget.amountSpent)} spent out of{" "}
          {formatCurrency(budget.amount)} in {budget.numberOfTransactions}{" "}
          transactions
        </div>

        {budget.amountSpent > budget.amount && (
          <div className="mt-2 flex items-center rounded-sm bg-[#fca5a524] px-2 py-3 text-sm font-medium text-red-500">
            <TriangleAlert className="mr-2 size-4 shrink-0" />
            <span className="text-center">
              You have exceeded your budget by{" "}
              {formatCurrency(budget.amountSpent - budget.amount)}!
            </span>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
