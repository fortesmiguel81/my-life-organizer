import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { toast } from "sonner";

import { client } from "@/lib/hono";

type ResponseType = InferResponseType<
  (typeof client.api)["utility-readings"][":id"]["$patch"]
>;
type RequestType = InferRequestType<
  (typeof client.api)["utility-readings"][":id"]["$patch"]
>["json"];

export const useEditUtilityReading = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      const res = await client.api["utility-readings"][":id"].$patch({
        param: { id },
        json,
      });
      if (!res.ok) throw new Error("Failed to update reading");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Reading updated");
      queryClient.invalidateQueries({ queryKey: ["utility-readings"] });
    },
    onError: () => toast.error("Failed to update reading"),
  });
};
