import { InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { client } from "@/lib/hono";

type ResponseType = InferResponseType<
  (typeof client.api.habits)[":id"]["$delete"]
>;

export const useDeleteHabit = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation<ResponseType, Error>({
    mutationFn: async () => {
      const res = await client.api.habits[":id"].$delete({ param: { id } });
      if (!res.ok) throw new Error("Failed to delete habit");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Habit deleted");
      queryClient.invalidateQueries({ queryKey: ["habits"] });
    },
    onError: () => toast.error("Failed to delete habit"),
  });
};
