import { useMutation, useQueryClient } from "@tanstack/react-query";

import { client } from "@/lib/hono";

export const useSwitchProfile = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<unknown, Error, string>({
    mutationFn: async (id) => {
      const response = await client.api.profiles[":id"].switch.$post({ param: { id } });

      if (!response.ok) {
        throw new Error("Failed to switch profile");
      }

      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
    },
  });

  return mutation;
};
