import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { toast } from "sonner";

import { client } from "@/lib/hono";

type ResponseType = InferResponseType<
  (typeof client.api.vendors)[":id"]["$patch"]
>;
type RequestType = InferRequestType<
  (typeof client.api.vendors)[":id"]["$patch"]
>["json"];

export const useEditVendor = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      const res = await client.api.vendors[":id"].$patch({
        param: { id },
        json,
      });
      if (!res.ok) throw new Error("Failed to update vendor");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Vendor updated");
      queryClient.invalidateQueries({ queryKey: ["vendors"] });
      queryClient.invalidateQueries({ queryKey: ["vendor", id] });
    },
    onError: () => toast.error("Failed to update vendor"),
  });
};
