import { InferRequestType, InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { client } from "@/lib/hono";

type ResponseType = InferResponseType<typeof client.api.documents["$post"], 201>;
type RequestType = InferRequestType<typeof client.api.documents["$post"]>["json"];

export const useCreateDocument = () => {
  const queryClient = useQueryClient();
  return useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      const res = await client.api.documents.$post({ json });
      if (!res.ok) throw new Error("Failed to save document");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Document saved");
      queryClient.invalidateQueries({ queryKey: ["documents"] });
    },
    onError: () => toast.error("Failed to save document"),
  });
};
