import { InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { client } from "@/lib/hono";

type ResponseType = InferResponseType<
  (typeof client.api.events)[":id"]["$delete"]
>;

export const useDeleteEvent = (id?: string) => {
  const queryClient = useQueryClient();

  return useMutation<ResponseType, Error>({
    mutationFn: async () => {
      const response = await client.api.events[":id"].$delete({
        param: { id: id! },
      });
      if (!response.ok) throw new Error("Failed to delete event");
      return response.json();
    },
    onSuccess: () => {
      toast.success("Event deleted");
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
    onError: () => toast.error("Failed to delete event"),
  });
};
