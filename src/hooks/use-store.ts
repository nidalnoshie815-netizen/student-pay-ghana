import { useEffect, useState } from "react";
import { getState } from "@/lib/mock-store";

export function useStore() {
  const [state, setState] = useState(getState);
  useEffect(() => {
    const handler = () => setState(getState());
    window.addEventListener("studentpay:update", handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener("studentpay:update", handler);
      window.removeEventListener("storage", handler);
    };
  }, []);
  return state;
}
