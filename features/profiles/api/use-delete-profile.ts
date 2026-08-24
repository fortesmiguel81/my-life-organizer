import { useMutation, useQueryClient } from "@tanstack/react-query";

import { client } from "@/lib/hono";

export const useDeleteProfile = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<unknown, Error, string>({
    mutationFn: async (id) => {
      const response = await client.api.profiles[":id"].$delete({ param: { id } });

      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profiles"] });
    },
  });

  return mutation;
};
