import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { toast } from "sonner";

import { client } from "@/lib/hono";

type ResponseType = InferResponseType<
  (typeof client.api)["maintenance-tasks"]["$post"],
  201
>;
type RequestType = InferRequestType<
  (typeof client.api)["maintenance-tasks"]["$post"]
>["json"];

export const useCreateMaintenanceTask = () => {
  const queryClient = useQueryClient();
  return useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      const res = await client.api["maintenance-tasks"].$post({ json });
      if (!res.ok) throw new Error("Failed to create maintenance task");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Maintenance task added");
      queryClient.invalidateQueries({ queryKey: ["maintenance-tasks"] });
    },
    onError: () => toast.error("Failed to create maintenance task"),
  });
};
