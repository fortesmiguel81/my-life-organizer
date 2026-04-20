import { useQuery } from "@tanstack/react-query";

import { client } from "@/lib/hono";

type Filters = {
  listId?: string;
  status?: "todo" | "in_progress" | "done";
  priority?: "low" | "medium" | "high" | "urgent";
  assignedTo?: string;
};

export const useGetTasks = (filters: Filters = {}) => {
  return useQuery({
    queryKey: ["tasks", filters],
    queryFn: async () => {
      const query: Record<string, string> = {};
      if (filters.listId) query.listId = filters.listId;
      if (filters.status) query.status = filters.status;
      if (filters.priority) query.priority = filters.priority;
      if (filters.assignedTo) query.assignedTo = filters.assignedTo;

      const response = await client.api.tasks.$get({ query });
      if (!response.ok) throw new Error("Failed to fetch tasks");
      const { data } = await response.json();
      return data;
    },
  });
};
