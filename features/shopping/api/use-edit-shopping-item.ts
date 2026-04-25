import { InferRequestType, InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { client } from "@/lib/hono";

type ResponseType = InferResponseType<(typeof client.api["shopping-items"])[":id"]["$patch"]>;
type RequestType = InferRequestType<(typeof client.api["shopping-items"])[":id"]["$patch"]>["json"];

export const useEditShoppingItem = (id?: string) => {
  const queryClient = useQueryClient();
  return useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      const res = await client.api["shopping-items"][":id"].$patch({ param: { id: id! }, json });
      if (!res.ok) throw new Error("Failed to update item");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shopping-items"] });
      queryClient.invalidateQueries({ queryKey: ["shopping-lists"] });
    },
    onError: () => toast.error("Failed to update item"),
  });
};
