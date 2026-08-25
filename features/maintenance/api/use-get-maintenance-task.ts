import { useQuery } from "@tanstack/react-query";

import { client } from "@/lib/hono";

export const useGetMaintenanceTask = (id?: string) =>
  useQuery({
    enabled: !!id,
    queryKey: ["maintenance-task", id],
    queryFn: async () => {
      const res = await client.api["maintenance-tasks"][":id"].$get({
        param: { id: id! },
      });
      if (!res.ok) throw new Error("Failed to fetch maintenance task");
      const { data } = await res.json();
      return data;
    },
  });
