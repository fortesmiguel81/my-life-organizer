import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { client } from "@/lib/hono";
import { InferRequestType, InferResponseType } from "hono";

type ResponseType = InferResponseType<typeof client.api.events.$post, 201>;
type RequestType = InferRequestType<typeof client.api.events.$post>["json"];

export const useCreateEvent = () => {
  const queryClient = useQueryClient();

  return useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      const response = await client.api.events.$post({ json });
      if (!response.ok) throw new Error("Failed to create event");
      return response.json();
    },
    onSuccess: () => {
      toast.success("Event created");
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
    onError: () => toast.error("Failed to create event"),
  });
};
