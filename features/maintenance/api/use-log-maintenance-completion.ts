import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { toast } from "sonner";

import { client } from "@/lib/hono";

type ResponseType = InferResponseType<
  (typeof client.api)["maintenance-logs"]["$post"],
  201
>;
type RequestType = InferRequestType<
  (typeof client.api)["maintenance-logs"]["$post"]
>["json"];

export const useLogMaintenanceCompletion = (taskId: string) => {
  const queryClient = useQueryClient();
  return useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      const res = await client.api["maintenance-logs"].$post({ json });
      if (!res.ok) throw new Error("Failed to log completion");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Marked as completed");
      queryClient.invalidateQueries({ queryKey: ["maintenance-tasks"] });
      queryClient.invalidateQueries({ queryKey: ["maintenance-task", taskId] });
    },
    onError: () => toast.error("Failed to log completion"),
  });
};
