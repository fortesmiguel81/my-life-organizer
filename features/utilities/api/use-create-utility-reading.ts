import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { toast } from "sonner";

import { client } from "@/lib/hono";

type ResponseType = InferResponseType<
  (typeof client.api)["utility-readings"]["$post"],
  201
>;
type RequestType = InferRequestType<
  (typeof client.api)["utility-readings"]["$post"]
>["json"];

export const useCreateUtilityReading = () => {
  const queryClient = useQueryClient();
  return useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      const res = await client.api["utility-readings"].$post({ json });
      if (!res.ok) throw new Error("Failed to add reading");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Reading added");
      queryClient.invalidateQueries({ queryKey: ["utility-readings"] });
    },
    onError: () => toast.error("Failed to add reading"),
  });
};
