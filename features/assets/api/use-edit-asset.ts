import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { toast } from "sonner";

import { client } from "@/lib/hono";

type ResponseType = InferResponseType<
  (typeof client.api.assets)[":id"]["$patch"]
>;
type RequestType = InferRequestType<
  (typeof client.api.assets)[":id"]["$patch"]
>["json"];

export const useEditAsset = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      const res = await client.api.assets[":id"].$patch({
        param: { id },
        json,
      });
      if (!res.ok) throw new Error("Failed to update asset");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Asset updated");
      queryClient.invalidateQueries({ queryKey: ["assets"] });
    },
    onError: () => toast.error("Failed to update asset"),
  });
};
