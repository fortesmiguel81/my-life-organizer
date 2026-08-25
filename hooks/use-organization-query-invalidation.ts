import { useEffect, useRef } from "react";

import { useQueryClient } from "@tanstack/react-query";

import { useGetCurrentProfile } from "@/features/profiles/api/use-get-current-profile";

import { useLoading } from "./use-loading";

export const useOrganizationQueryInvalidation = () => {
  const queryClient = useQueryClient();
  const { data: profile, isLoading } = useGetCurrentProfile();
  const setLoading = useLoading((state) => state.setLoading);

  const hasLoadedBefore = useRef(false);
  const lastProfileId = useRef<string | null>(null);

  useEffect(() => {
    if (isLoading) return;

    if (!hasLoadedBefore.current) {
      hasLoadedBefore.current = true;
      lastProfileId.current = profile?.id ?? null;
      return;
    }

    if (profile?.id !== lastProfileId.current) {
      lastProfileId.current = profile?.id ?? null;
      setLoading(true);

      queryClient
        .invalidateQueries()
        .then(() => {
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
        });
    }
  }, [profile?.id, isLoading, queryClient, setLoading]);
};
