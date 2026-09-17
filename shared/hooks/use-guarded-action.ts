"use client";

import { useAction } from "next-safe-action/hooks";
import { useCallback, useRef, useState } from "react";

// next-safe-action's useAction does not stop a second call while the first
// is still running: every execute() sends its own request and only the last
// result is kept. `isExecuting` is React state, so it turns true one render
// late — a double tap, a double Enter, or a second tap on a slow connection
// all land in that gap. The first registration succeeds, the second hits a
// unique constraint, and the user only sees the second one's error.
//
// These hooks are drop-in replacements for useAction with the same
// signature. A ref closes the gap synchronously: while a request is in
// flight, further calls are ignored, and `isExecuting` / `isPending` stay
// true for the whole request.

type GuardableAction = {
  executeAsync: (input: never) => Promise<unknown>;
  isExecuting: boolean;
  isPending: boolean;
  reset: () => void;
};

function isSuccessfulResult(result: unknown): boolean {
  if (typeof result !== "object" || result === null) {
    return false;
  }

  if ("serverError" in result && result.serverError !== undefined) {
    return false;
  }

  if ("validationErrors" in result && result.validationErrors !== undefined) {
    return false;
  }

  const data = "data" in result ? result.data : undefined;

  if (typeof data === "object" && data !== null && "ok" in data) {
    return data.ok === true;
  }

  return data !== undefined;
}

// A duplicate call gets a promise that never settles, not the first call's
// promise: callers that `await executeAsync()` and then toast or reset a
// form would otherwise do it twice for one request. A fresh promise per call
// is garbage-collected with its handlers; a shared one would keep them all.
function ignoredCall(): Promise<never> {
  return new Promise<never>(() => undefined);
}

function useSingleFlight<A extends GuardableAction>(
  action: A,
  holdOnSuccess: boolean,
): A {
  const runAsync = action.executeAsync as (input: unknown) => Promise<unknown>;
  const resetAction = action.reset;
  const inFlightRef = useRef(false);
  const heldRef = useRef(false);
  const [isLocked, setIsLocked] = useState(false);

  const executeAsync = useCallback(
    (input: unknown): Promise<unknown> => {
      if (inFlightRef.current || heldRef.current) {
        return ignoredCall();
      }

      inFlightRef.current = true;
      setIsLocked(true);

      return runAsync(input)
        .then((result) => {
          if (holdOnSuccess && isSuccessfulResult(result)) {
            heldRef.current = true;
          }

          return result;
        })
        .finally(() => {
          inFlightRef.current = false;

          if (!heldRef.current) {
            setIsLocked(false);
          }
        });
    },
    [holdOnSuccess, runAsync],
  );

  const execute = useCallback(
    (input: unknown) => {
      executeAsync(input).catch(() => undefined);
    },
    [executeAsync],
  );

  const reset = useCallback(() => {
    heldRef.current = false;

    if (!inFlightRef.current) {
      setIsLocked(false);
    }

    resetAction();
  }, [resetAction]);

  return {
    ...action,
    execute,
    executeAsync,
    reset,
    isExecuting: action.isExecuting || isLocked,
    isPending: action.isPending || isLocked,
  } as A;
}

// For actions the user may run again from the same screen: saving a form
// twice, commencing one flight and then another. The lock lifts when the
// request finishes.
export const useGuardedAction: typeof useAction = (safeActionFn, opts) => {
  const action = useAction(safeActionFn, opts);

  return useSingleFlight(action, false);
};

// For actions that leave the screen once they succeed: sign in, register,
// approve, submit. The lock stays on after a successful result, so the
// button cannot be pressed again while the next page is still loading.
export const useOneShotAction: typeof useAction = (safeActionFn, opts) => {
  const action = useAction(safeActionFn, opts);

  return useSingleFlight(action, true);
};
