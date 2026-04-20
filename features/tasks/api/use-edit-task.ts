import { InferRequestType, InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { client } from "@/lib/hono";

type ResponseType = InferResponseType<(typeof client.api.tasks)[":id"]["$patch"]>;
type RequestType = InferRequestType<(typeof client.api.tasks)[":id"]["$patch"]>["json"];

export const useEditTask = (id?: string) => {
  const queryClient = useQueryClient();

  return useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      const response = await client.api.tasks[":id"].$patch({
        param: { id: id! },
        json,
      });
      if (!response.ok) throw new Error("Failed to update task");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["task", id] });
    },
    onError: () => toast.error("Failed to update task"),
  });
};
