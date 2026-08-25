import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { toast } from "sonner";

import { client } from "@/lib/hono";

type ResponseType = InferResponseType<typeof client.api.vendors.$post, 201>;
type RequestType = InferRequestType<typeof client.api.vendors.$post>["json"];

export const useCreateVendor = () => {
  const queryClient = useQueryClient();
  return useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      const res = await client.api.vendors.$post({ json });
      if (!res.ok) throw new Error("Failed to create vendor");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Vendor added");
      queryClient.invalidateQueries({ queryKey: ["vendors"] });
    },
    onError: () => toast.error("Failed to create vendor"),
  });
};
