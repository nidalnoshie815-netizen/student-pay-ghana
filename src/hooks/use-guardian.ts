import { useEffect, useState } from "react";
import { getSession, type Guardian } from "@/lib/guardian-auth";

export function useGuardian() {
  const [guardian, setGuardian] = useState<Guardian | null>(() => getSession());
  useEffect(() => {
    const sync = () => setGuardian(getSession());
    window.addEventListener("studentpay:auth", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("studentpay:auth", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);
  return guardian;
}
