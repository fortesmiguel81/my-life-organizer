import { useQuery } from "@tanstack/react-query";

import { client } from "@/lib/hono";

export const useGetHabits = () =>
  useQuery({
    queryKey: ["habits"],
    queryFn: async () => {
      const res = await client.api.habits.$get();
      if (!res.ok) throw new Error("Failed to fetch habits");
      const { data } = await res.json();
      return data;
    },
  });
