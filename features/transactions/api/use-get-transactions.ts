import { useSearchParams } from "next/navigation";

import { useQuery } from "@tanstack/react-query";

import { client } from "@/lib/hono";

export const useGetTransactions = () => {
  const params = useSearchParams();
  const orgId = params.get("orgId") || "";
  const accountId = params.get("accountId") || "";

  const query = useQuery({
    queryKey: ["transactions"],
    queryFn: async () => {
      const response = await client.api.transactions.$get({
        query: {
          orgId,
          accountId,
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
