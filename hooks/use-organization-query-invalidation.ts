import { useEffect, useRef } from "react";

import { useOrganization, useUser } from "@clerk/nextjs";
import { useQueryClient } from "@tanstack/react-query";

import { useLoading } from "./use-loading";

export const useOrganizationQueryInvalidation = () => {
  const queryClient = useQueryClient();
  const { organization, isLoaded: isLoadedOrganization } = useOrganization();
  const { user, isLoaded: isLoadedUser } = useUser();
  const setLoading = useLoading((state) => state.setLoading);

  const hasLoadedBefore = useRef(false);

  useEffect(() => {
    if (!hasLoadedBefore.current && isLoadedOrganization && isLoadedUser) {
      hasLoadedBefore.current = true;
      return;
    }

    if (isLoadedOrganization && isLoadedUser) {
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
  }, [
    organization?.id,
    user?.id,
    isLoadedOrganization,
    isLoadedUser,
    queryClient,
    setLoading,
  ]);
};
