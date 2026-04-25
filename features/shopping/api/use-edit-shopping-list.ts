import { InferRequestType, InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { client } from "@/lib/hono";

type ResponseType = InferResponseType<(typeof client.api["shopping-lists"])[":id"]["$patch"]>;
type RequestType = InferRequestType<(typeof client.api["shopping-lists"])[":id"]["$patch"]>["json"];

export const useEditShoppingList = (id?: string) => {
  const queryClient = useQueryClient();
  return useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      const res = await client.api["shopping-lists"][":id"].$patch({ param: { id: id! }, json });
      if (!res.ok) throw new Error("Failed to update shopping list");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shopping-lists"] });
    },
    onError: () => toast.error("Failed to update list"),
  });
};
