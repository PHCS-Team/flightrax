import { useEffect, useRef, useState } from "react";
import { useQueryState, type Parser } from "nuqs";

const DEFAULT_DELAY_MS = 450;

export function useDebouncedQueryState<T>(
  key: string,
  parser: Parser<T>,
  delay = DEFAULT_DELAY_MS,
): readonly [NonNullable<T>, (value: T) => void, NonNullable<T>] {
  const [committed, setCommitted] = useQueryState(key, parser);
  const [local, setLocal] = useState(committed);
  const [debounced, setDebounced] = useState(local);
  const isInternal = useRef(false);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(local), delay);
    return () => clearTimeout(timer);
  }, [local, delay]);

  useEffect(() => {
    if (debounced !== committed) {
      isInternal.current = true;
      (setCommitted as (value: unknown) => void)(debounced);
    }
  }, [debounced]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (isInternal.current) {
      isInternal.current = false;
      return;
    }
    setLocal(committed);
  }, [committed]);

  return [
    local as NonNullable<T>,
    setLocal as (value: T) => void,
    committed as NonNullable<T>,
  ];
}
