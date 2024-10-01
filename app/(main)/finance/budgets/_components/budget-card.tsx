import { InferResponseType } from "hono";
import { TrendingUp } from "lucide-react";

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
  return (
    <Card
      className="hover:cursor-pointer hover:bg-muted/50"
      onClick={() => onOpen(budget.id)}
    >
      <CardHeader className="relative pb-2">
        <CardTitle className="text-xl">{budget.category}</CardTitle>
        <CardDescription>{budget.category}</CardDescription>
      </CardHeader>
      <CardContent>
        <BudgetChart />
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 font-medium leading-none">
          Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
        </div>
        <div className="leading-none text-muted-foreground">
          Showing total visitors for the last 6 months
        </div>
      </CardFooter>
    </Card>
  );
}
