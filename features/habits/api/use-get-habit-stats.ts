import { useQuery } from "@tanstack/react-query";

import { client } from "@/lib/hono";

export const useGetHabitStats = (id: string) =>
  useQuery({
    queryKey: ["habit-stats", id],
    queryFn: async () => {
      const res = await client.api.habits[":id"].stats.$get({ param: { id } });
      if (!res.ok) throw new Error("Failed to fetch habit stats");
      const { data } = await res.json();
      return data;
    },
  });
