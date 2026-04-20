import { useQuery } from "@tanstack/react-query";

import { client } from "@/lib/hono";

export const useGetEvents = (from?: string, to?: string) => {
  return useQuery({
    queryKey: ["events", from, to],
    queryFn: async () => {
      const response = await client.api.events.$get({
        query: { from: from ?? "", to: to ?? "" },
      });

      if (!response.ok) throw new Error("Failed to fetch events");

      const { data } = await response.json();
      return data;
    },
  });
};
