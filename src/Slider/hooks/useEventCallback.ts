import { useCallback, useLayoutEffect, useRef } from "react";

export function useEventCallback<Args extends unknown[], Return>(
  fn: (...args: Args) => Return
) {
  const fnRef = useRef(fn);
  useLayoutEffect(() => {
    fnRef.current = fn;
  });
  return useCallback((...args: Args) => fnRef.current!(...args), []);
}
