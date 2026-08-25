import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferResponseType } from "hono";
import { toast } from "sonner";

import { client } from "@/lib/hono";

type ResponseType = InferResponseType<
  (typeof client.api.vendors)[":id"]["$delete"]
>;

export const useDeleteVendor = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation<ResponseType, Error>({
    mutationFn: async () => {
      const res = await client.api.vendors[":id"].$delete({ param: { id } });
      if (!res.ok) throw new Error("Failed to delete vendor");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Vendor deleted");
      queryClient.invalidateQueries({ queryKey: ["vendors"] });
    },
    onError: () => toast.error("Failed to delete vendor"),
  });
};
