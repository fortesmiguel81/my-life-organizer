import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferResponseType } from "hono";
import { toast } from "sonner";

import { client } from "@/lib/hono";

type ResponseType = InferResponseType<
  (typeof client.api)["utility-readings"][":id"]["$delete"]
>;

export const useDeleteUtilityReading = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation<ResponseType, Error>({
    mutationFn: async () => {
      const res = await client.api["utility-readings"][":id"].$delete({
        param: { id },
      });
      if (!res.ok) throw new Error("Failed to delete reading");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Reading deleted");
      queryClient.invalidateQueries({ queryKey: ["utility-readings"] });
    },
    onError: () => toast.error("Failed to delete reading"),
  });
};
