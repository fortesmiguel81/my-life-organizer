import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { toast } from "sonner";

import { client } from "@/lib/hono";

type ResponseType = InferResponseType<
  (typeof client.api)["vendor-quotes"]["$post"],
  201
>;
type RequestType = InferRequestType<
  (typeof client.api)["vendor-quotes"]["$post"]
>["json"];

export const useCreateVendorQuote = (vendorId: string) => {
  const queryClient = useQueryClient();
  return useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      const res = await client.api["vendor-quotes"].$post({ json });
      if (!res.ok) throw new Error("Failed to add quote");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Quote added");
      queryClient.invalidateQueries({ queryKey: ["vendor", vendorId] });
    },
    onError: () => toast.error("Failed to add quote"),
  });
};
