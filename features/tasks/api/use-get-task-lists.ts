import { useQuery } from "@tanstack/react-query";

import { client } from "@/lib/hono";

export const useGetTaskLists = () => {
  return useQuery({
    queryKey: ["task-lists"],
    queryFn: async () => {
      const response = await client.api["task-lists"].$get();
      if (!response.ok) throw new Error("Failed to fetch task lists");
      const { data } = await response.json();
      return data;
    },
  });
};
