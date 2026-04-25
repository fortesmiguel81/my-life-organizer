import { InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { client } from "@/lib/hono";

type ResponseType = InferResponseType<(typeof client.api["shopping-lists"])[":id"]["$delete"]>;

export const useDeleteShoppingList = (id?: string) => {
  const queryClient = useQueryClient();
  return useMutation<ResponseType, Error>({
    mutationFn: async () => {
      const res = await client.api["shopping-lists"][":id"].$delete({ param: { id: id! } });
      if (!res.ok) throw new Error("Failed to delete shopping list");
      return res.json();
    },
    onSuccess: () => {
      toast.success("List deleted");
      queryClient.invalidateQueries({ queryKey: ["shopping-lists"] });
    },
    onError: () => toast.error("Failed to delete list"),
  });
};
