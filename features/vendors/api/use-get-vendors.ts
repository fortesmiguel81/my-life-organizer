import { useQuery } from "@tanstack/react-query";

import { client } from "@/lib/hono";

export const useGetVendors = () =>
  useQuery({
    queryKey: ["vendors"],
    queryFn: async () => {
      const res = await client.api.vendors.$get();
      if (!res.ok) throw new Error("Failed to fetch vendors");
      const { data } = await res.json();
      return data;
    },
  });
