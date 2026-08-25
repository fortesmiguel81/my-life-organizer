import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType } from "hono";

import { client } from "@/lib/hono";

type RequestType = InferRequestType<
  (typeof client.api.profiles)[":id"]["$patch"]
>["json"];

export const useEditProfile = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<unknown, Error, { id: string; values: RequestType }>({
    mutationFn: async ({ id, values }) => {
      const response = await client.api.profiles[":id"].$patch({
        param: { id },
        json: values,
      });

      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profiles"] });
    },
  });

  return mutation;
};
