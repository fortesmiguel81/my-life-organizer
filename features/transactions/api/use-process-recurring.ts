import { useMutation, useQueryClient } from "@tanstack/react-query";

import { client } from "@/lib/hono";

export const useProcessRecurring = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await client.api.recurring.process.$post();
      if (!response.ok) throw new Error("Failed to process recurring transactions");
      return response.json();
    },
    onSuccess: ({ processed }) => {
      if (processed > 0) {
        queryClient.invalidateQueries({ queryKey: ["transactions"] });
        queryClient.invalidateQueries({ queryKey: ["accounts"] });
        queryClient.invalidateQueries({ queryKey: ["finance-summary"] });
      }
    },
  });
};
