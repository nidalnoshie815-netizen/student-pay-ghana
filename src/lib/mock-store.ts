// Simple in-memory mock store (first version, no backend yet)
export type PaymentMethod = "MTN MoMo" | "Vodafone Cash" | "AirtelTigo Money" | "Telecel Cash";

export const PAYMENT_METHODS: { id: PaymentMethod; color: string; short: string }[] = [
  { id: "MTN MoMo", color: "#FFCC08", short: "MTN" },
  { id: "Vodafone Cash", color: "#E60000", short: "VOD" },
  { id: "Telecel Cash", color: "#E60000", short: "TEL" },
  { id: "AirtelTigo Money", color: "#005EB8", short: "AT" },
];

export type TxCategory =
  | "POS Withdrawal"
  | "Wallet Funding"
  | "Transfer"
  | "Vendor Payment";

export interface Transaction {
  id: string;
  type: "deposit" | "withdrawal";
  amount: number; // GHS
  method?: PaymentMethod;
  studentId: string;
  studentName: string;
  parentName?: string;
  note?: string;
  category?: TxCategory;
  status: "pending" | "completed";
  createdAt: number;
}

const LS_KEY = "studentpay_state_v1";

export interface StudentAccount {
  studentId: string; // e.g. SP-2024-AB12
  studentName: string;
  school: string;
  balance: number;
  parentName: string;
  parentPhone: string;
}

interface State {
  account: StudentAccount;
  transactions: Transaction[];
}

const defaultState: State = {
  account: {
    studentId: "SP-7F4K-92AC",
    studentName: "Kwame Mensah",
    school: "University of Ghana, Legon",
    balance: 420,
    parentName: "Akosua Mensah",
    parentPhone: "024 555 8821",
  },
  transactions: [
    {
      id: "t1",
      type: "deposit",
      amount: 300,
      method: "MTN MoMo",
      studentId: "SP-7F4K-92AC",
      studentName: "Kwame Mensah",
      parentName: "Akosua Mensah",
      category: "Wallet Funding",
      status: "completed",
      createdAt: Date.now() - 86400000 * 2,
    },
    {
      id: "t2",
      type: "withdrawal",
      amount: 80,
      studentId: "SP-7F4K-92AC",
      studentName: "Kwame Mensah",
      note: "Campus cafeteria",
      category: "Vendor Payment",
      status: "completed",
      createdAt: Date.now() - 86400000,
    },
    {
      id: "t3",
      type: "deposit",
      amount: 200,
      method: "Telecel Cash",
      studentId: "SP-7F4K-92AC",
      studentName: "Kwame Mensah",
      parentName: "Akosua Mensah",
      category: "Wallet Funding",
      status: "completed",
      createdAt: Date.now() - 3600000 * 5,
    },
    {
      id: "t4",
      type: "withdrawal",
      amount: 50,
      studentId: "SP-7F4K-92AC",
      studentName: "Kwame Mensah",
      note: "POS at MaxMart",
      category: "POS Withdrawal",
      status: "completed",
      createdAt: Date.now() - 3600000 * 2,
    },
    {
      id: "t5",
      type: "withdrawal",
      amount: 30,
      studentId: "SP-7F4K-92AC",
      studentName: "Kwame Mensah",
      note: "Transfer to roommate",
      category: "Transfer",
      status: "completed",
      createdAt: Date.now() - 3600000,
    },
  ],
};

function load(): State {
  if (typeof window === "undefined") return defaultState;
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return defaultState;
    return JSON.parse(raw) as State;
  } catch {
    return defaultState;
  }
}

function save(s: State) {
  if (typeof window === "undefined") return;
  localStorage.setItem(LS_KEY, JSON.stringify(s));
  window.dispatchEvent(new Event("studentpay:update"));
}

export function getState(): State {
  return load();
}

export function addDeposit(input: {
  amount: number;
  method: PaymentMethod;
  studentId: string;
  parentName: string;
}) {
  const s = load();
  if (input.studentId.trim().toUpperCase() !== s.account.studentId.toUpperCase()) {
    throw new Error("Student ID not found");
  }
  const tx: Transaction = {
    id: crypto.randomUUID(),
    type: "deposit",
    amount: input.amount,
    method: input.method,
    studentId: s.account.studentId,
    studentName: s.account.studentName,
    parentName: input.parentName,
    category: "Wallet Funding",
    status: "completed",
    createdAt: Date.now(),
  };
  s.account.balance += input.amount;
  s.transactions.unshift(tx);
  save(s);
  return tx;
}

export function addWithdrawal(input: {
  amount: number;
  studentId: string;
  note?: string;
  category?: TxCategory;
}) {
  const s = load();
  if (input.studentId.trim().toUpperCase() !== s.account.studentId.toUpperCase()) {
    throw new Error("Invalid Student ID");
  }
  if (input.amount > s.account.balance) throw new Error("Insufficient balance");
  const tx: Transaction = {
    id: crypto.randomUUID(),
    type: "withdrawal",
    amount: input.amount,
    studentId: s.account.studentId,
    studentName: s.account.studentName,
    note: input.note,
    category: input.category ?? "Vendor Payment",
    status: "completed",
    createdAt: Date.now(),
  };
  s.account.balance -= input.amount;
  s.transactions.unshift(tx);
  save(s);
  return tx;
}

export function formatGHS(n: number) {
  return new Intl.NumberFormat("en-GH", {
    style: "currency",
    currency: "GHS",
    maximumFractionDigits: 2,
  }).format(n);
}
