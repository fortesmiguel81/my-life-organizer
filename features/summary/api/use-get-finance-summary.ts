import { useQuery } from "@tanstack/react-query";

import { client } from "@/lib/hono";
import { convertAmountFromMiliunits } from "@/lib/utils";
import { useSearchParams } from "next/navigation";

export const useGetFinanceSummary = () => {
  const params = useSearchParams();
  const accountId = params.get("accountId") || "";
  const from = params.get("from") || "";
  const to = params.get("to") || "";

  const query = useQuery({
    queryKey: ["finance-summary", accountId, from, to],
    queryFn: async () => {
      const response = await client.api.summary.finance.$get({
        query: {
          accountId,
          from,
          to,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch finance summary");
      }

      const { data } = await response.json();
      return {
        ...data,
        incomeAmount: convertAmountFromMiliunits(data.incomeAmount),
        expensesAmount: convertAmountFromMiliunits(data.expensesAmount),
        remainingAmount: convertAmountFromMiliunits(data.remainingAmount),
        categories: data.categories.map((category) => ({
          ...category,
          value: convertAmountFromMiliunits(category.value),
        })),
        days: data.days.map((day) => ({
          ...day,
          income: convertAmountFromMiliunits(day.income),
          expenses: convertAmountFromMiliunits(day.expenses),
        })),
      };
    },
  });

  return query;
};
