import { useQuery } from "@tanstack/react-query";

import { client } from "@/lib/hono";

export const useGetShoppingItems = (listId?: string) =>
  useQuery({
    queryKey: ["shopping-items", listId],
    queryFn: async () => {
      const res = await client.api["shopping-items"].$get({
        query: listId ? { listId } : {},
      });
      if (!res.ok) throw new Error("Failed to fetch shopping items");
      const { data } = await res.json();
      return data;
    },
    enabled: !!listId,
    refetchInterval: 30_000,
  });
