// Lightweight mock auth for guardians (parents). Stored in localStorage.
// Replace with Lovable Cloud auth when backend is enabled.

export interface StudentLink {
  studentId: string;
  school: string;
}

export interface Guardian {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  studentId: string; // primary (first) student — kept for back-compat
  students: StudentLink[];
  createdAt: number;
}

interface StoredGuardian extends Guardian {
  passwordHash: string;
}

const USERS_KEY = "studentpay_guardians_v1";
const SESSION_KEY = "studentpay_guardian_session_v1";

async function hash(pw: string): Promise<string> {
  const data = new TextEncoder().encode(pw);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function loadUsers(): StoredGuardian[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
  } catch {
    return [];
  }
}
function saveUsers(u: StoredGuardian[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(u));
}

export function getSession(): Guardian | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as Guardian) : null;
  } catch {
    return null;
  }
}

function setSession(g: Guardian | null) {
  if (g) localStorage.setItem(SESSION_KEY, JSON.stringify(g));
  else localStorage.removeItem(SESSION_KEY);
  window.dispatchEvent(new Event("studentpay:auth"));
}

export async function signUp(input: {
  fullName: string;
  email: string;
  phone: string;
  studentId: string;
  password: string;
}): Promise<Guardian> {
  const users = loadUsers();
  const email = input.email.trim().toLowerCase();
  if (users.some((u) => u.email === email)) {
    throw new Error("An account with this email already exists");
  }
  if (input.password.length < 6) throw new Error("Password must be at least 6 characters");
  const guardian: StoredGuardian = {
    id: crypto.randomUUID(),
    fullName: input.fullName.trim(),
    email,
    phone: input.phone.trim(),
    studentId: input.studentId.trim().toUpperCase(),
    createdAt: Date.now(),
    passwordHash: await hash(input.password),
  };
  users.push(guardian);
  saveUsers(users);
  const { passwordHash: _ph, ...session } = guardian;
  setSession(session);
  return session;
}

export async function signIn(email: string, password: string): Promise<Guardian> {
  const users = loadUsers();
  const u = users.find((x) => x.email === email.trim().toLowerCase());
  if (!u) throw new Error("No account found for this email");
  const ph = await hash(password);
  if (ph !== u.passwordHash) throw new Error("Incorrect password");
  const { passwordHash: _ph, ...session } = u;
  setSession(session);
  return session;
}

export function signOut() {
  setSession(null);
}

export function updateProfile(input: {
  fullName: string;
  phone: string;
  studentId: string;
}): Guardian {
  const session = getSession();
  if (!session) throw new Error("Not signed in");
  const fullName = input.fullName.trim();
  const phone = input.phone.trim();
  const studentId = input.studentId.trim().toUpperCase();
  if (!fullName) throw new Error("Full name is required");
  if (!studentId) throw new Error("Student ID is required");
  const users = loadUsers();
  const idx = users.findIndex((u) => u.id === session.id);
  if (idx === -1) throw new Error("Account not found");
  users[idx] = { ...users[idx], fullName, phone, studentId };
  saveUsers(users);
  const { passwordHash: _ph, ...updated } = users[idx];
  setSession(updated);
  return updated;
}

// ---------- Password reset (mock OTP) ----------
// Since there's no backend yet, the OTP is generated locally and shown to the
// user (simulating the email). Stored with an expiry in localStorage.

const RESET_KEY = "studentpay_guardian_reset_v1";
const OTP_TTL_MS = 10 * 60 * 1000; // 10 minutes

interface ResetRecord {
  email: string;
  code: string;
  expiresAt: number;
}

function loadResets(): ResetRecord[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(RESET_KEY) || "[]");
  } catch {
    return [];
  }
}
function saveResets(r: ResetRecord[]) {
  localStorage.setItem(RESET_KEY, JSON.stringify(r));
}

function genCode(): string {
  // 6-digit numeric
  const n = Math.floor(100000 + Math.random() * 900000);
  return String(n);
}

export function requestPasswordReset(email: string): { code: string; email: string } {
  const users = loadUsers();
  const normalized = email.trim().toLowerCase();
  const u = users.find((x) => x.email === normalized);
  if (!u) throw new Error("No account found for this email");
  const code = genCode();
  const resets = loadResets().filter((r) => r.email !== normalized);
  resets.push({ email: normalized, code, expiresAt: Date.now() + OTP_TTL_MS });
  saveResets(resets);
  // In a real app, this would email the code. Here we return it so the UI can
  // show it (mock email delivery).
  return { code, email: normalized };
}

export function verifyResetCode(email: string, code: string): boolean {
  const normalized = email.trim().toLowerCase();
  const rec = loadResets().find((r) => r.email === normalized);
  if (!rec) throw new Error("No reset request found. Please request a new code.");
  if (Date.now() > rec.expiresAt) throw new Error("Code expired. Request a new one.");
  if (rec.code !== code.trim()) throw new Error("Incorrect code");
  return true;
}

export async function resetPassword(input: {
  email: string;
  code: string;
  newPassword: string;
}): Promise<void> {
  verifyResetCode(input.email, input.code);
  if (input.newPassword.length < 6) throw new Error("Password must be at least 6 characters");
  const normalized = input.email.trim().toLowerCase();
  const users = loadUsers();
  const idx = users.findIndex((u) => u.email === normalized);
  if (idx === -1) throw new Error("Account not found");
  users[idx].passwordHash = await hash(input.newPassword);
  saveUsers(users);
  // consume the code
  saveResets(loadResets().filter((r) => r.email !== normalized));
}
