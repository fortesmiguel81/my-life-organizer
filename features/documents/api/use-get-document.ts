import { useQuery } from "@tanstack/react-query";

import { client } from "@/lib/hono";

export const useGetDocument = (id?: string) =>
  useQuery({
    queryKey: ["document", id],
    queryFn: async () => {
      const res = await client.api.documents[":id"].$get({ param: { id: id! } });
      if (!res.ok) throw new Error("Failed to fetch document");
      const { data } = await res.json();
      return data;
    },
    enabled: !!id,
  });
