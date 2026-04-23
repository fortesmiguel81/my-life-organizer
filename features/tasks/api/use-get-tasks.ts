import { useQuery } from "@tanstack/react-query";

import { client } from "@/lib/hono";

type Filters = {
  listId?: string;
  status?: "todo" | "in_progress" | "done";
  priority?: "low" | "medium" | "high" | "urgent";
};

export const useGetTasks = (filters: Filters = {}) =>
  useQuery({
    queryKey: ["tasks", filters],
    queryFn: async () => {
      const res = await client.api.tasks.$get({
        query: {
          ...(filters.listId ? { listId: filters.listId } : {}),
          ...(filters.status ? { status: filters.status } : {}),
          ...(filters.priority ? { priority: filters.priority } : {}),
        },
      });
      if (!res.ok) throw new Error("Failed to fetch tasks");
      const { data } = await res.json();
      return data;
    },
  });
