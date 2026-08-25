import { InferRequestType, InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { client } from "@/lib/hono";

type ResponseType = InferResponseType<typeof client.api.habits.$post, 201>;
type RequestType = InferRequestType<typeof client.api.habits.$post>["json"];

export const useCreateHabit = () => {
  const queryClient = useQueryClient();
  return useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      const res = await client.api.habits.$post({ json });
      if (!res.ok) throw new Error("Failed to create habit");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Habit created");
      queryClient.invalidateQueries({ queryKey: ["habits"] });
    },
    onError: () => toast.error("Failed to create habit"),
  });
};
