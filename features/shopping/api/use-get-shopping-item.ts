import { useQuery } from "@tanstack/react-query";

import { client } from "@/lib/hono";

export const useGetShoppingItem = (id?: string) =>
  useQuery({
    queryKey: ["shopping-item", id],
    queryFn: async () => {
      const res = await client.api["shopping-items"][":id"].$get({ param: { id: id! } });
      if (!res.ok) throw new Error("Failed to fetch item");
      const { data } = await res.json();
      return data;
    },
    enabled: !!id,
  });
