import { useQuery } from "@tanstack/react-query";

import { client } from "@/lib/hono";
import { convertAmountFromMiliunits } from "@/lib/utils";

export const useGetAccounts = () => {
  const query = useQuery({
    queryKey: ["accounts"],
    queryFn: async () => {
      const response = await client.api.accounts.$get();

      if (!response.ok) {
        throw new Error("Failed to fetch categories");
      }

      const { data } = await response.json();

      return data.map((account) => ({
        ...account,
        balance: convertAmountFromMiliunits(account.balance),
      }));
    },
  });

  return query;
};
