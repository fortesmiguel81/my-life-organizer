import { InferRequestType, InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { client } from "@/lib/hono";

type ResponseType = InferResponseType<
  (typeof client.api.habits)[":id"]["log"]["$post"]
>;
type RequestType = InferRequestType<
  (typeof client.api.habits)[":id"]["log"]["$post"]
>["json"];

export const useLogHabit = () => {
  const queryClient = useQueryClient();
  return useMutation<ResponseType, Error, { id: string; json: RequestType }>({
    mutationFn: async ({ id, json }) => {
      const res = await client.api.habits[":id"].log.$post({
        param: { id },
        json,
      });
      if (!res.ok) throw new Error("Failed to log habit");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["habits"] });
      queryClient.invalidateQueries({ queryKey: ["habit-logs"] });
      queryClient.invalidateQueries({ queryKey: ["habit-stats"] });
    },
  });
};
