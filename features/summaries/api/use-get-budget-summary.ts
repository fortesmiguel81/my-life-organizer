import { useQuery } from "@tanstack/react-query";

import { client } from "@/lib/hono";

export const useGetBudgetSummary = (
  categoryId: string,
  period: "monthly" | "yearly"
) => {
  const query = useQuery({
    queryKey: ["budget", categoryId, period],
    queryFn: async () => {
      const response = await client.api.summaries["budget"]["$get"]({
        query: {
          categoryId,
          period,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch accounts");
      }

      const { data } = await response.json();

      return data;
    },
  });

  return query;
};
