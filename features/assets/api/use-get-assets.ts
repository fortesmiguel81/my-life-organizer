import { useQuery } from "@tanstack/react-query";

import { client } from "@/lib/hono";

export const useGetAssets = () =>
  useQuery({
    queryKey: ["assets"],
    queryFn: async () => {
      const res = await client.api.assets.$get();
      if (!res.ok) throw new Error("Failed to fetch assets");
      const { data } = await res.json();
      return data;
    },
  });
