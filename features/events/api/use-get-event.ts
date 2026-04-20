import { useQuery } from "@tanstack/react-query";

import { client } from "@/lib/hono";

export const useGetEvent = (id?: string) => {
  return useQuery({
    queryKey: ["event", id],
    enabled: !!id,
    queryFn: async () => {
      const response = await client.api.events[":id"].$get({
        param: { id: id! },
      });

      if (!response.ok) throw new Error("Failed to fetch event");

      const { data } = await response.json();
      return data;
    },
  });
};
