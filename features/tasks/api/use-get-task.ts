import { useQuery } from "@tanstack/react-query";

import { client } from "@/lib/hono";

export const useGetTask = (id?: string) =>
  useQuery({
    queryKey: ["task", id],
    enabled: !!id,
    queryFn: async () => {
      const res = await client.api.tasks[":id"].$get({ param: { id: id! } });
      if (!res.ok) throw new Error("Failed to fetch task");
      const { data } = await res.json();
      return data;
    },
  });
