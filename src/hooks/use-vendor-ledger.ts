import { useEffect, useState } from "react";
import { getLedger, type VendorLedger } from "@/lib/vendor-store";

export function useVendorLedger(vendorId: string | undefined): VendorLedger {
  const [ledger, setLedger] = useState<VendorLedger>(() =>
    vendorId ? getLedger(vendorId) : { float: 0, commission: 0, transactions: [], notifications: [] },
  );
  useEffect(() => {
    if (!vendorId) return;
    const sync = () => setLedger(getLedger(vendorId));
    sync();
    window.addEventListener("studentpay:vendor", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("studentpay:vendor", sync);
      window.removeEventListener("storage", sync);
    };
  }, [vendorId]);
  return ledger;
}
