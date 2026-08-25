import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { toast } from "sonner";

import { client } from "@/lib/hono";

type ResponseType = InferResponseType<typeof client.api.assets.$post, 201>;
type RequestType = InferRequestType<typeof client.api.assets.$post>["json"];

export const useCreateAsset = () => {
  const queryClient = useQueryClient();
  return useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      const res = await client.api.assets.$post({ json });
      if (!res.ok) throw new Error("Failed to create asset");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Asset added");
      queryClient.invalidateQueries({ queryKey: ["assets"] });
    },
    onError: () => toast.error("Failed to create asset"),
  });
};
