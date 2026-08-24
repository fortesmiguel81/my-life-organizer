import { useQuery } from "@tanstack/react-query";

import { client } from "@/lib/hono";

export const useGetCurrentProfile = () => {
  const query = useQuery({
    queryKey: ["profiles", "me"],
    queryFn: async () => {
      const response = await client.api.profiles.me.$get();

      if (!response.ok) {
        throw new Error("Failed to fetch current profile");
      }

      const { data } = await response.json();

      return data;
    },
  });

  return query;
};
