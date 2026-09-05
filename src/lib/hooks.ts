import { useSyncExternalStore } from "react";

const MOBILE_BREAKPOINT = 768

function useHasPointer() {
  return useSyncExternalStore(
    (callback) => {
      const media = window.matchMedia("(pointer: coarse)");
      media.addEventListener("change", callback);
      return () => media.removeEventListener("change", callback);
    },
    () => {
      if (typeof window === "undefined") return false;
      return window.matchMedia("(pointer: coarse)").matches;
    },
    () => false // SSR Fallback
  );
}

function useIsMobile() {
  return useSyncExternalStore(
    (callback) => {
      const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
      mql.addEventListener("change", callback)
      return () => mql.removeEventListener("change", callback)
    },
    () => window.innerWidth < MOBILE_BREAKPOINT,
    () => false
  )
}

export {
  useHasPointer,
  useIsMobile
}