import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { toast } from "sonner";

import { client } from "@/lib/hono";

type ResponseType = InferResponseType<
  (typeof client.api)["vendor-quotes"][":id"]["$patch"]
>;
type RequestType = InferRequestType<
  (typeof client.api)["vendor-quotes"][":id"]["$patch"]
>["json"];

export const useEditVendorQuote = (id: string, vendorId: string) => {
  const queryClient = useQueryClient();
  return useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      const res = await client.api["vendor-quotes"][":id"].$patch({
        param: { id },
        json,
      });
      if (!res.ok) throw new Error("Failed to update quote");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Quote updated");
      queryClient.invalidateQueries({ queryKey: ["vendor", vendorId] });
    },
    onError: () => toast.error("Failed to update quote"),
  });
};
