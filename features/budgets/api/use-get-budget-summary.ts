import { useQuery } from "@tanstack/react-query";

import { client } from "@/lib/hono";

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

      return data;
    },
  });

  return query;
};
