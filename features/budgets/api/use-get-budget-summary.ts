import { useQuery } from "@tanstack/react-query";

import { client } from "@/lib/hono";
import { convertAmountFromMiliunits } from "@/lib/utils";

export const useGetBudgetSummary = (
  id: string,
  categoryId: string,
  period: string
) => {
  const query = useQuery({
    queryKey: ["budgets-summary", categoryId, period],
    queryFn: async () => {
      const response = await client.api.budgets[":id"]["summary"].$get({
        param: {
          id,
        },
        query: {
          categoryId,
          period,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch budget summary");
      }

      const { data } = await response.json();

      return {
        ...data!,
        amount: convertAmountFromMiliunits(data!.amount),
        budgetAmount: convertAmountFromMiliunits(data!.budgetAmount),
      };
    },
  });

  return query;
};
