import { useSyncExternalStore } from "react";

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

export default useHasPointer;