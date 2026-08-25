import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferResponseType } from "hono";
import { toast } from "sonner";

import { client } from "@/lib/hono";

type ResponseType = InferResponseType<
  (typeof client.api)["vendor-quotes"][":id"]["$delete"]
>;

export const useDeleteVendorQuote = (id: string, vendorId: string) => {
  const queryClient = useQueryClient();
  return useMutation<ResponseType, Error>({
    mutationFn: async () => {
      const res = await client.api["vendor-quotes"][":id"].$delete({
        param: { id },
      });
      if (!res.ok) throw new Error("Failed to delete quote");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Quote deleted");
      queryClient.invalidateQueries({ queryKey: ["vendor", vendorId] });
    },
    onError: () => toast.error("Failed to delete quote"),
  });
};
