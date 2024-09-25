import { useQuery } from "@tanstack/react-query";

import { client } from "@/lib/hono";

export const useGetTransactions = (
  orgId?: string,
  accountId?: string,
  from?: string,
  to?: string
) => {
  const query = useQuery({
    queryKey: ["transactions", { orgId, accountId, from, to }],
    queryFn: async () => {
      const response = await client.api.transactions.$get({
        query: {
          orgId,
          accountId,
          from,
          to,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch transactions");
      }

      const { data } = await response.json();

      return data;
    },
  });

  return query;
};
