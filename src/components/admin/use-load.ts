"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Run an async loader on mount, whenever `loader` identity changes, and
 * optionally on an interval. Exposes the result, an error flag and a manual
 * `reload`. All `setState` happens inside promise callbacks.
 *
 * Callers MUST pass a stable `loader` (module-level function or `useCallback`)
 * so the effect doesn't refetch on every render.
 */
export function useLoad<T>(
  loader: () => Promise<T>,
  { pollMs }: { pollMs?: number } = {},
) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState(false);

  const reload = useCallback((): Promise<T | null> => {
    return loader().then(
      (result) => {
        setData(result);
        setError(false);
        return result;
      },
      () => {
        setError(true);
        return null;
      },
    );
  }, [loader]);

  useEffect(() => {
    let alive = true;
    loader().then(
      (r) => {
        if (alive) {
          setData(r);
          setError(false);
        }
      },
      () => {
        if (alive) setError(true);
      },
    );

    if (!pollMs) return () => void (alive = false);

    // Skip polling while the tab is in the background — it just piles load on a
    // slow DB and the data is refreshed on focus anyway.
    const tick = () => {
      if (typeof document !== "undefined" && document.hidden) return;
      loader().then(
        (r) => {
          if (alive) setData(r);
        },
        () => {},
      );
    };
    const timer = setInterval(tick, pollMs);
    const onVisible = () => {
      if (typeof document !== "undefined" && !document.hidden) tick();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      alive = false;
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [loader, pollMs]);

  return { data, error, reload, setData };
}
