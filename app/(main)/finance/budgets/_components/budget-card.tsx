import { InferResponseType } from "hono";
import { TrendingUp } from "lucide-react";

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
import { useGetBudgetSummary } from "@/features/summaries/api/use-get-budget-summary";
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

  const budgetSummaryQuery = useGetBudgetSummary(
    budget.categoryId,
    budget.type
  );

  console.log("budgetSummaryQuery:", budgetSummaryQuery.data);

  return (
    <Card
      className="hover:cursor-pointer hover:bg-muted/50"
      onClick={() => onOpen(budget.id)}
    >
      <CardHeader className="relative pb-2">
        <CardTitle className="items center flex text-xl">
          <Icon name={budget.categoryIcon || ""} className="mr-2 h-6 w-6" />
          {budget.category}
        </CardTitle>
        <CardDescription>{budget.categoryDescription}</CardDescription>
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
