import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferResponseType } from "hono";
import { toast } from "sonner";

import { client } from "@/lib/hono";

type ResponseType = InferResponseType<
  (typeof client.api.budgets)[":id"]["$delete"]
>;

export const useDeleteBudget = (id?: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error>({
    mutationFn: async () => {
      const response = await client.api.budgets[":id"]["$delete"]({
        param: {
          id,
        },
      });

      return await response.json();
    },
    onSuccess: () => {
      toast.success("Budget deleted successfully.");
      queryClient.invalidateQueries({ queryKey: ["budget", { id }] });
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
    },
    onError: () => {
      toast.error(`Failed to delete budget with the id: ${id}`);
    },
  });

  return mutation;
};
