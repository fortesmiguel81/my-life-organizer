import { useQuery } from "@tanstack/react-query";

import { client } from "@/lib/hono";

export const useGetTransactions = (params?: Record<string, any>) => {
  const query = useQuery({
    queryKey: ["transactions"],
    queryFn: async () => {
      const response = await client.api.transactions.$get({
        query: params,
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
