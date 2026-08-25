import { useQuery } from "@tanstack/react-query";

import { client } from "@/lib/hono";

export const useGetUtilityReadings = () =>
  useQuery({
    queryKey: ["utility-readings"],
    queryFn: async () => {
      const res = await client.api["utility-readings"].$get();
      if (!res.ok) throw new Error("Failed to fetch utility readings");
      const { data } = await res.json();
      return data;
    },
  });
