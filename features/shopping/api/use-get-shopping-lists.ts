import { useQuery } from "@tanstack/react-query";

import { client } from "@/lib/hono";

export const useGetShoppingLists = () =>
  useQuery({
    queryKey: ["shopping-lists"],
    queryFn: async () => {
      const res = await client.api["shopping-lists"].$get();
      if (!res.ok) throw new Error("Failed to fetch shopping lists");
      const { data } = await res.json();
      return data;
    },
    refetchInterval: 30_000,
  });
