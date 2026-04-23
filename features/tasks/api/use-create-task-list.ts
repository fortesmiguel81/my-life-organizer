import { InferRequestType, InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { client } from "@/lib/hono";

type ResponseType = InferResponseType<typeof client.api["task-lists"]["$post"], 201>;
type RequestType = InferRequestType<typeof client.api["task-lists"]["$post"]>["json"];

export const useCreateTaskList = () => {
  const queryClient = useQueryClient();
  return useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      const res = await client.api["task-lists"].$post({ json });
      if (!res.ok) throw new Error("Failed to create list");
      return res.json();
    },
    onSuccess: () => {
      toast.success("List created");
      queryClient.invalidateQueries({ queryKey: ["task-lists"] });
    },
    onError: () => toast.error("Failed to create list"),
  });
};
