import { useQuery } from "@tanstack/react-query";

import { client } from "@/lib/hono";

type Filters = {
  category?: "legal" | "insurance" | "medical" | "household" | "financial" | "other";
  tag?: string;
  expiring?: number;
};

export const useGetDocuments = (filters: Filters = {}) =>
  useQuery({
    queryKey: ["documents", filters],
    queryFn: async () => {
      const res = await client.api.documents.$get({
        query: {
          category: filters.category,
          tag: filters.tag,
          expiring: filters.expiring?.toString(),
        },
      });
      if (!res.ok) throw new Error("Failed to fetch documents");
      const { data } = await res.json();
      return data;
    },
  });
