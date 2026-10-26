import { useCallback, useEffect, useMemo, useRef, useState } from "react";

/**
 * Minimal data-loading hook for the read-only screens: one loader, loading/error/data states,
 * a pull-to-refresh path that keeps the previous data visible, and a retry path that clears it.
 *
 * No caching library: every screen loads once, and the API is read-only and cheap.
 */

export type AsyncState<T> = {
  data: T | null;
  error: unknown;
  /** True during the first load, when there is nothing to show yet. */
  loading: boolean;
  /** True during a pull-to-refresh with data already on screen. */
  refreshing: boolean;
  /** Clears the data and loads again (used by error states). */
  reload: () => void;
  /** Keeps the current data on screen while loading again (pull-to-refresh). */
  refresh: () => void;
};

type InternalState<T> = { data: T | null; error: unknown; inFlight: boolean };

export function useAsyncData<T>(loader: () => Promise<T>, key: string): AsyncState<T> {
  const [state, setState] = useState<InternalState<T>>({ data: null, error: null, inFlight: true });
  const [nonce, setNonce] = useState(0);
  const loaderRef = useRef(loader);

  // Keep the latest loader without writing the ref during render.
  useEffect(() => {
    loaderRef.current = loader;
  }, [loader]);

  useEffect(() => {
    let active = true;

    async function load(): Promise<void> {
      setState((previous) => ({ ...previous, error: null, inFlight: true }));
      try {
        const data = await loaderRef.current();
        if (active) setState({ data, error: null, inFlight: false });
      } catch (error: unknown) {
        if (active) setState((previous) => ({ data: previous.data, error, inFlight: false }));
      }
    }

    void load();
    return () => {
      active = false;
    };
    // `key` identifies the resource (route param, collection name); `nonce` forces a reload.
  }, [key, nonce]);

  const reload = useCallback(() => {
    setState({ data: null, error: null, inFlight: true });
    setNonce((value) => value + 1);
  }, []);
  const refresh = useCallback(() => setNonce((value) => value + 1), []);

  return useMemo(
    () => ({
      data: state.data,
      error: state.error,
      loading: state.inFlight && state.data === null,
      refreshing: state.inFlight && state.data !== null,
      reload,
      refresh,
    }),
    [state.data, state.error, state.inFlight, reload, refresh],
  );
}
