import { useQuery } from "@tanstack/react-query";

import { client } from "@/lib/hono";

export const useGetHabitLogs = (id: string, from?: string, to?: string) =>
  useQuery({
    queryKey: ["habit-logs", id, from, to],
    queryFn: async () => {
      const res = await client.api.habits[":id"].logs.$get({
        param: { id },
        query: { from, to },
      });
      if (!res.ok) throw new Error("Failed to fetch habit logs");
      const { data } = await res.json();
      return data;
    },
  });
