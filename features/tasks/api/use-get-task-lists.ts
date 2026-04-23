import { useQuery } from "@tanstack/react-query";

import { client } from "@/lib/hono";

export const useGetTaskLists = () =>
  useQuery({
    queryKey: ["task-lists"],
    queryFn: async () => {
      const res = await client.api["task-lists"].$get();
      if (!res.ok) throw new Error("Failed to fetch task lists");
      const { data } = await res.json();
      return data;
    },
  });
