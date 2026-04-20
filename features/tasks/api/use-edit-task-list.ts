import { InferRequestType, InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { client } from "@/lib/hono";

type ResponseType = InferResponseType<(typeof client.api)["task-lists"][":id"]["$patch"]>;
type RequestType = InferRequestType<(typeof client.api)["task-lists"][":id"]["$patch"]>["json"];

export const useEditTaskList = (id?: string) => {
  const queryClient = useQueryClient();

  return useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      const response = await client.api["task-lists"][":id"].$patch({
        param: { id: id! },
        json,
      });
      if (!response.ok) throw new Error("Failed to update list");
      return response.json();
    },
    onSuccess: () => {
      toast.success("List updated");
      queryClient.invalidateQueries({ queryKey: ["task-lists"] });
    },
    onError: () => toast.error("Failed to update list"),
  });
};
