import { useQuery } from "@tanstack/react-query";

import { client } from "@/lib/hono";

export const useGetTask = (id?: string) => {
  return useQuery({
    queryKey: ["task", id],
    enabled: !!id,
    queryFn: async () => {
      const response = await client.api.tasks[":id"].$get({ param: { id: id! } });
      if (!response.ok) throw new Error("Failed to fetch task");
      const { data } = await response.json();
      return data;
    },
  });
};
