// Per-vendor mock ledger for float, commission, notifications and history.
// Keyed by vendor id (Guardian.id). Stored in localStorage.

const LS_KEY = "studentpay_vendor_ledger_v1";
export const COMMISSION_RATE = 0.015; // 1.5% per transaction

export type VendorTxKind = "charge" | "withdrawal" | "float_topup" | "commission_payout";

export interface VendorTx {
  id: string;
  kind: VendorTxKind;
  amount: number; // GHS
  fee: number; // commission earned by vendor (0 for float top-ups / payouts)
  studentId?: string;
  studentName?: string;
  note?: string;
  createdAt: number;
  status: "completed" | "pending" | "failed";
}

export interface VendorNotification {
  id: string;
  title: string;
  body: string;
  createdAt: number;
  read: boolean;
}

export interface VendorLedger {
  float: number;
  commission: number;
  transactions: VendorTx[];
  notifications: VendorNotification[];
}

type AllLedgers = Record<string, VendorLedger>;

function loadAll(): AllLedgers {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) || "{}");
  } catch {
    return {};
  }
}

function saveAll(a: AllLedgers) {
  localStorage.setItem(LS_KEY, JSON.stringify(a));
  window.dispatchEvent(new Event("studentpay:vendor"));
}

export function getLedger(vendorId: string): VendorLedger {
  const all = loadAll();
  return (
    all[vendorId] || {
      float: 0,
      commission: 0,
      transactions: [],
      notifications: [],
    }
  );
}

function mutate(vendorId: string, fn: (l: VendorLedger) => void) {
  const all = loadAll();
  const l = all[vendorId] || { float: 0, commission: 0, transactions: [], notifications: [] };
  fn(l);
  all[vendorId] = l;
  saveAll(all);
  return l;
}

export function addNotification(vendorId: string, n: Omit<VendorNotification, "id" | "createdAt" | "read">) {
  mutate(vendorId, (l) => {
    l.notifications.unshift({
      id: crypto.randomUUID(),
      createdAt: Date.now(),
      read: false,
      ...n,
    });
    l.notifications = l.notifications.slice(0, 50);
  });
}

export function markAllNotificationsRead(vendorId: string) {
  mutate(vendorId, (l) => {
    l.notifications = l.notifications.map((n) => ({ ...n, read: true }));
  });
}

export function recordCharge(vendorId: string, input: {
  amount: number;
  studentId: string;
  studentName: string;
  note?: string;
}) {
  const fee = Math.round(input.amount * COMMISSION_RATE * 100) / 100;
  mutate(vendorId, (l) => {
    l.commission += fee;
    l.transactions.unshift({
      id: crypto.randomUUID(),
      kind: "charge",
      amount: input.amount,
      fee,
      studentId: input.studentId,
      studentName: input.studentName,
      note: input.note,
      createdAt: Date.now(),
      status: "completed",
    });
    l.notifications.unshift({
      id: crypto.randomUUID(),
      createdAt: Date.now(),
      read: false,
      title: `Payment received · GHS ${input.amount.toFixed(2)}`,
      body: `${input.studentName} (${input.studentId}) · fee GHS ${fee.toFixed(2)}`,
    });
  });
  return fee;
}

export function recordWithdrawal(vendorId: string, input: {
  amount: number;
  studentId: string;
  studentName: string;
  note?: string;
}) {
  const fee = Math.round(input.amount * COMMISSION_RATE * 100) / 100;
  const ledger = getLedger(vendorId);
  if (input.amount > ledger.float) throw new Error("Insufficient float. Top up to continue.");
  mutate(vendorId, (l) => {
    l.float -= input.amount;
    l.commission += fee;
    l.transactions.unshift({
      id: crypto.randomUUID(),
      kind: "withdrawal",
      amount: input.amount,
      fee,
      studentId: input.studentId,
      studentName: input.studentName,
      note: input.note,
      createdAt: Date.now(),
      status: "completed",
    });
    l.notifications.unshift({
      id: crypto.randomUUID(),
      createdAt: Date.now(),
      read: false,
      title: `Withdrawal paid · GHS ${input.amount.toFixed(2)}`,
      body: `${input.studentName} (${input.studentId}) collected cash.`,
    });
  });
  return fee;
}

export function topUpFloat(vendorId: string, amount: number, method: string) {
  mutate(vendorId, (l) => {
    l.float += amount;
    l.transactions.unshift({
      id: crypto.randomUUID(),
      kind: "float_topup",
      amount,
      fee: 0,
      note: method,
      createdAt: Date.now(),
      status: "completed",
    });
    l.notifications.unshift({
      id: crypto.randomUUID(),
      createdAt: Date.now(),
      read: false,
      title: `Float topped up · GHS ${amount.toFixed(2)}`,
      body: `via ${method}`,
    });
  });
}

export function payoutCommission(vendorId: string, method: string) {
  const l = getLedger(vendorId);
  if (l.commission <= 0) throw new Error("No commission available");
  const amount = l.commission;
  mutate(vendorId, (x) => {
    x.commission = 0;
    x.transactions.unshift({
      id: crypto.randomUUID(),
      kind: "commission_payout",
      amount,
      fee: 0,
      note: method,
      createdAt: Date.now(),
      status: "completed",
    });
    x.notifications.unshift({
      id: crypto.randomUUID(),
      createdAt: Date.now(),
      read: false,
      title: `Commission paid out · GHS ${amount.toFixed(2)}`,
      body: `to ${method}`,
    });
  });
  return amount;
}
