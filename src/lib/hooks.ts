"use client";

import { useApp } from "@/components/providers/AppProvider";
import { api, ApiError, OnChainRoles, UserProfile } from "./api";
import { useApi } from "./useApi";

/** The roles the contracts recognise for the active account. */
export function useRoles(): { roles: OnChainRoles | undefined; loading: boolean } {
  const { account } = useApp();
  const address = account?.address ?? null;
  const { data, loading } = useApi(address && `roles:${address}`, () => api.roles(address!));
  return { roles: data, loading };
}

/** The active account's KYC profile; `null` when it has none yet. */
export function useProfile(): { profile: UserProfile | null | undefined; loading: boolean } {
  const { account } = useApp();
  const address = account?.address ?? null;
  const { data, error, loading } = useApi(address && `user:${address}`, () =>
    api.user(address!).catch((err) => {
      if (err instanceof ApiError && err.status === 404) return null;
      throw err;
    }),
  );
  return { profile: error ? undefined : data, loading };
}
