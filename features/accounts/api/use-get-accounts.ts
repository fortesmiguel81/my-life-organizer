import { useQuery } from "@tanstack/react-query";

import { client } from "@/lib/hono";

export const useGetCategories = (orgId?: string) => {
  const query = useQuery({
    queryKey: ["accounts", { orgId }],
    queryFn: async () => {
      const response = await client.api.accounts.$get({
        query: {
          orgId,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch categories");
      }

      const { data } = await response.json();

      return data;
    },
  });

  return query;
};
