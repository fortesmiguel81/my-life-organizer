import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferResponseType } from "hono";
import { toast } from "sonner";

import { client } from "@/lib/hono";

type ResponseType = InferResponseType<
  (typeof client.api)["maintenance-tasks"][":id"]["$delete"]
>;

export const useDeleteMaintenanceTask = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation<ResponseType, Error>({
    mutationFn: async () => {
      const res = await client.api["maintenance-tasks"][":id"].$delete({
        param: { id },
      });
      if (!res.ok) throw new Error("Failed to delete maintenance task");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Maintenance task deleted");
      queryClient.invalidateQueries({ queryKey: ["maintenance-tasks"] });
    },
    onError: () => toast.error("Failed to delete maintenance task"),
  });
};
