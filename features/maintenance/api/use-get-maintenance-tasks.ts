import { useQuery } from "@tanstack/react-query";

import { client } from "@/lib/hono";

export const useGetMaintenanceTasks = () =>
  useQuery({
    queryKey: ["maintenance-tasks"],
    queryFn: async () => {
      const res = await client.api["maintenance-tasks"].$get();
      if (!res.ok) throw new Error("Failed to fetch maintenance tasks");
      const { data } = await res.json();
      return data;
    },
  });
