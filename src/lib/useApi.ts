"use client";

import { useEffect, useState } from "react";
import { useApp } from "@/components/providers/AppProvider";

export interface ApiState<T> {
  data: T | undefined;
  error: unknown;
  loading: boolean;
}

/**
 * Fetch from the backend, refetching whenever `key` changes or a write
 * succeeds anywhere in the app. Pass `null` as the key to skip the request.
 *
 * The result is stored with the key it was fetched for, so `loading` is simply
 * "the stored result is for a different request", with no state set
 * synchronously inside the effect.
 */
export function useApi<T>(key: string | null, fetcher: () => Promise<T>): ApiState<T> {
  const { version } = useApp();
  const requestKey = key === null ? null : `${key}#${version}`;
  const [state, setState] = useState<{ key: string | null; data?: T; error?: unknown }>({ key: null });

  useEffect(() => {
    if (requestKey === null) return;
    let cancelled = false;
    fetcher().then(
      (data) => !cancelled && setState({ key: requestKey, data }),
      (error) => !cancelled && setState((prev) => ({ key: requestKey, data: prev.data, error })),
    );
    return () => {
      cancelled = true;
    };
    // `fetcher` is recreated every render; `requestKey` identifies the request.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestKey]);

  if (requestKey === null) return { data: undefined, error: undefined, loading: false };
  // Keep showing the previous data while a refetch for the same resource runs.
  const sameResource = state.key?.split("#")[0] === key;
  return {
    data: sameResource ? state.data : undefined,
    error: state.key === requestKey ? state.error : undefined,
    loading: state.key !== requestKey,
  };
}
