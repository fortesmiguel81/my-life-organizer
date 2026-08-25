import { useQuery } from "@tanstack/react-query";

import { client } from "@/lib/hono";

export const useGetDashboard = () =>
  useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const res = await client.api.dashboard.$get();
      if (!res.ok) throw new Error("Failed to fetch dashboard");
      const { data } = await res.json();
      return data;
    },
  });
