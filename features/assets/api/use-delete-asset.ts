import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferResponseType } from "hono";
import { toast } from "sonner";

import { client } from "@/lib/hono";

type ResponseType = InferResponseType<
  (typeof client.api.assets)[":id"]["$delete"]
>;

export const useDeleteAsset = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation<ResponseType, Error>({
    mutationFn: async () => {
      const res = await client.api.assets[":id"].$delete({ param: { id } });
      if (!res.ok) throw new Error("Failed to delete asset");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Asset deleted");
      queryClient.invalidateQueries({ queryKey: ["assets"] });
    },
    onError: () => toast.error("Failed to delete asset"),
  });
};
