import { useQuery } from "@tanstack/react-query";

import { client } from "@/lib/hono";

export const useGetVendor = (id?: string) =>
  useQuery({
    enabled: !!id,
    queryKey: ["vendor", id],
    queryFn: async () => {
      const res = await client.api.vendors[":id"].$get({ param: { id: id! } });
      if (!res.ok) throw new Error("Failed to fetch vendor");
      const { data } = await res.json();
      return data;
    },
  });
