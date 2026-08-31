// Mock student data for the Student Pay student frontend.
// Frontend-only; a real backend/POS integration can replace this later.

export interface StudentTx {
  id: string;
  ref: string;
  type: "School Deposit" | "POS Withdrawal" | "Vendor Payment";
  direction: "in" | "out";
  amount: number;
  at: number;
  status: "Successful" | "Pending" | "Failed";
  detail?: string;
}

export const MOCK_STUDENT = {
  name: "Kwame Mensah",
  studentId: "STU2026001",
  school: "Example University",
  programme: "BSc Computer Science",
  phone: "024 XXX XXXX",
  email: "kwame.mensah@example.edu.gh",
  balance: 250,
  cardNumber: "5399 •••• •••• 2026",
  cardExpiry: "08/29",
};

const day = 86400000;

export const MOCK_TRANSACTIONS: StudentTx[] = [
  {
    id: "s1",
    ref: "SP-9F3K21",
    type: "School Deposit",
    direction: "in",
    amount: 200,
    at: Date.now() - day * 1,
    status: "Successful",
    detail: "Allowance from guardian",
  },
  {
    id: "s2",
    ref: "SP-7C1M84",
    type: "POS Withdrawal",
    direction: "out",
    amount: 50,
    at: Date.now() - day * 2,
    status: "Successful",
    detail: "Campus POS agent — Legon",
  },
  {
    id: "s3",
    ref: "SP-4B8Q07",
    type: "Vendor Payment",
    direction: "out",
    amount: 20,
    at: Date.now() - day * 3,
    status: "Successful",
    detail: "Campus cafeteria",
  },
  {
    id: "s4",
    ref: "SP-2X5T63",
    type: "School Deposit",
    direction: "in",
    amount: 150,
    at: Date.now() - day * 6,
    status: "Successful",
    detail: "Monthly allowance",
  },
  {
    id: "s5",
    ref: "SP-6H0L19",
    type: "POS Withdrawal",
    direction: "out",
    amount: 100,
    at: Date.now() - day * 9,
    status: "Successful",
    detail: "MaxMart POS",
  },
  {
    id: "s6",
    ref: "SP-1D7N45",
    type: "Vendor Payment",
    direction: "out",
    amount: 35,
    at: Date.now() - day * 12,
    status: "Successful",
    detail: "Bookshop",
  },
];

export function makeRef() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ0123456789";
  let out = "";
  for (let i = 0; i < 6; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return `SP-${out}`;
}

export function formatDateTime(ts: number) {
  return new Date(ts).toLocaleString("en-GH", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDate(ts: number) {
  return new Date(ts).toLocaleDateString("en-GH", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatTime(ts: number) {
  return new Date(ts).toLocaleTimeString("en-GH", {
    hour: "2-digit",
    minute: "2-digit",
  });
}
