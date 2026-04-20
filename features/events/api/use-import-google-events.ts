import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { client } from "@/lib/hono";

export const useGoogleCalendarStatus = () => {
  return useQuery({
    queryKey: ["google-calendar-status"],
    queryFn: async () => {
      const response = await client.api["google-calendar"].status.$get();
      if (!response.ok) throw new Error("Failed to check status");
      const { connected } = await response.json();
      return connected;
    },
  });
};

export const useImportGoogleEvents = () => {
  const queryClient = useQueryClient();

  return useMutation<{ imported: number; updated: number; total: number }, Error>({
    mutationFn: async () => {
      const response = await client.api["google-calendar"].import.$post();
      const body = await response.json();
      if (!response.ok) {
        throw new Error(
          "error" in body ? (body.error ?? "Import failed") : "Import failed"
        );
      }
      return body as { imported: number; updated: number; total: number };
    },
    onSuccess: ({ imported, updated }) => {
      toast.success(`Imported ${imported} new, updated ${updated} events`);
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
    onError: (err) => toast.error(err.message),
  });
};
