import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferResponseType } from "hono";
import { toast } from "sonner";

import { client } from "@/lib/hono";

type ResponseType = InferResponseType<
  (typeof client.api)["maintenance-logs"][":id"]["$delete"]
>;

export const useDeleteMaintenanceLog = (id: string, taskId: string) => {
  const queryClient = useQueryClient();
  return useMutation<ResponseType, Error>({
    mutationFn: async () => {
      const res = await client.api["maintenance-logs"][":id"].$delete({
        param: { id },
      });
      if (!res.ok) throw new Error("Failed to delete log entry");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Log entry deleted");
      queryClient.invalidateQueries({ queryKey: ["maintenance-task", taskId] });
    },
    onError: () => toast.error("Failed to delete log entry"),
  });
};
