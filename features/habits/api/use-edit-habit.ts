import { InferRequestType, InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { client } from "@/lib/hono";

type ResponseType = InferResponseType<
  (typeof client.api.habits)[":id"]["$patch"]
>;
type RequestType = InferRequestType<
  (typeof client.api.habits)[":id"]["$patch"]
>["json"];

export const useEditHabit = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      const res = await client.api.habits[":id"].$patch({
        param: { id },
        json,
      });
      if (!res.ok) throw new Error("Failed to update habit");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Habit updated");
      queryClient.invalidateQueries({ queryKey: ["habits"] });
    },
    onError: () => toast.error("Failed to update habit"),
  });
};
