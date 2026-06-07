// Lightweight mock auth for guardians (parents). Stored in localStorage.
// Replace with Lovable Cloud auth when backend is enabled.

const PIN_KEY = "studentpay_guardian_pin_v1";

export function getPin(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(PIN_KEY);
}

export async function changePin(input: { currentPin?: string; newPin: string }): Promise<void> {
  const existing = getPin();
  if (existing && input.currentPin !== existing) {
    throw new Error("Current PIN is incorrect");
  }
  if (!/^\d{4}$/.test(input.newPin)) throw new Error("PIN must be 4 digits");
  localStorage.setItem(PIN_KEY, input.newPin);
}

export function updateStudents(students: StudentLink[]): Guardian {
  const session = getSession();
  if (!session) throw new Error("Not signed in");
  const normalized: StudentLink[] = students
    .map((s) => ({ studentId: s.studentId.trim().toUpperCase(), school: s.school.trim() }))
    .filter((s) => s.studentId.length > 0);
  if (normalized.length === 0) throw new Error("Add at least one student");
  const users = loadUsers();
  const idx = users.findIndex((u) => u.id === session.id);
  if (idx === -1) throw new Error("Account not found");
  users[idx] = {
    ...users[idx],
    students: normalized,
    studentId: normalized[0].studentId,
  };
  saveUsers(users);
  const { passwordHash: _ph, ...updated } = users[idx];
  setSession(updated);
  return updated;
}

export async function changePassword(input: {
  currentPassword: string;
  newPassword: string;
}): Promise<void> {
  const session = getSession();
  if (!session) throw new Error("Not signed in");
  if (input.newPassword.length < 6) throw new Error("Password must be at least 6 characters");
  const users = loadUsers();
  const idx = users.findIndex((u) => u.id === session.id);
  if (idx === -1) throw new Error("Account not found");
  const currentHash = await hash(input.currentPassword);
  if (currentHash !== users[idx].passwordHash) throw new Error("Current password is incorrect");
  users[idx].passwordHash = await hash(input.newPassword);
  saveUsers(users);
}

export interface StudentLink {
  studentId: string;
  school: string;
  name?: string;
  grade?: string;
}

export interface Guardian {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  studentId: string; // primary (first) student — kept for back-compat
  students: StudentLink[];
  createdAt: number;
  avatarDataUrl?: string;
  address?: string;
  occupation?: string;
  emergencyName?: string;
  emergencyPhone?: string;
  preferredLanguage?: string;
  dateOfBirth?: string;
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
  studentId?: string;
  students?: StudentLink[];
  password: string;
}): Promise<Guardian> {
  const users = loadUsers();
  const email = input.email.trim().toLowerCase();
  if (users.some((u) => u.email === email)) {
    throw new Error("An account with this email already exists");
  }
  if (input.password.length < 6) throw new Error("Password must be at least 6 characters");

  const normalized: StudentLink[] = (input.students && input.students.length
    ? input.students
    : input.studentId
    ? [{ studentId: input.studentId, school: "" }]
    : []
  )
    .map((s) => ({ studentId: s.studentId.trim().toUpperCase(), school: s.school.trim() }))
    .filter((s) => s.studentId.length > 0);

  if (normalized.length === 0) throw new Error("Please add at least one student");

  const guardian: StoredGuardian = {
    id: crypto.randomUUID(),
    fullName: input.fullName.trim(),
    email,
    phone: input.phone.trim(),
    studentId: normalized[0].studentId,
    students: normalized,
    createdAt: Date.now(),
    passwordHash: await hash(input.password),
  };
  users.push(guardian);
  saveUsers(users);
  const { passwordHash: _ph, ...session } = guardian;
  setSession(session);
  return session;
}

const PENDING_STUDENTS_KEY = "studentpay_pending_students_v1";

export function savePendingStudents(students: StudentLink[]) {
  localStorage.setItem(PENDING_STUDENTS_KEY, JSON.stringify(students));
}
export function loadPendingStudents(): StudentLink[] {
  try {
    return JSON.parse(localStorage.getItem(PENDING_STUDENTS_KEY) || "[]");
  } catch {
    return [];
  }
}
export function clearPendingStudents() {
  localStorage.removeItem(PENDING_STUDENTS_KEY);
}

export async function signInWithGoogle(input?: {
  students?: StudentLink[];
}): Promise<Guardian> {
  const { lovable } = await import("@/integrations/lovable");
  if (input?.students && input.students.length) {
    savePendingStudents(input.students);
  }
  const result = await lovable.auth.signInWithOAuth("google", {
    redirect_uri: window.location.origin + "/guardian/auth",
  });
  if (result.error) {
    clearPendingStudents();
    throw result.error instanceof Error ? result.error : new Error(String(result.error));
  }
  // If redirected === true, the browser is navigating away; throw to halt UI.
  throw new Error("Redirecting to Google…");
}

// Called by the auth page after returning from Google OAuth. Creates a
// guardian record from the Supabase session if needed.
export async function completeGoogleSignIn(): Promise<Guardian | null> {
  const { supabase } = await import("@/integrations/supabase/client");
  const { data } = await supabase.auth.getUser();
  const sUser = data.user;
  if (!sUser?.email) return null;

  const email = sUser.email.toLowerCase();
  const fullName =
    (sUser.user_metadata?.full_name as string) ||
    (sUser.user_metadata?.name as string) ||
    email.split("@")[0];

  const users = loadUsers();
  let u = users.find((x) => x.email === email);
  if (!u) {
    const pending = loadPendingStudents();
    const normalized: StudentLink[] = pending
      .map((s) => ({ studentId: s.studentId.trim().toUpperCase(), school: s.school.trim() }))
      .filter((s) => s.studentId.length > 0);
    if (normalized.length === 0) {
      // No students captured before redirect — sign out of supabase to keep state clean.
      await supabase.auth.signOut();
      throw new Error("Add at least one child's Student ID before continuing with Google");
    }
    u = {
      id: sUser.id,
      fullName,
      email,
      phone: (sUser.user_metadata?.phone as string) || "",
      studentId: normalized[0].studentId,
      students: normalized,
      createdAt: Date.now(),
      passwordHash: await hash(crypto.randomUUID()),
    };
    users.push(u);
    saveUsers(users);
  }
  clearPendingStudents();
  if (!u.students || u.students.length === 0) {
    u.students = [{ studentId: u.studentId, school: "" }];
    saveUsers(users);
  }
  const { passwordHash: _ph, ...session } = u;
  setSession(session);
  return session;
}

export async function signIn(email: string, password: string): Promise<Guardian> {
  const users = loadUsers();
  const u = users.find((x) => x.email === email.trim().toLowerCase());
  if (!u) throw new Error("No account found for this email");
  const ph = await hash(password);
  if (ph !== u.passwordHash) throw new Error("Incorrect password");
  // back-compat: ensure students array exists
  if (!u.students || u.students.length === 0) {
    u.students = [{ studentId: u.studentId, school: "" }];
    saveUsers(users);
  }
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
  const existingStudents = users[idx].students || [];
  const nextStudents: StudentLink[] = existingStudents.length
    ? [{ studentId, school: existingStudents[0]?.school || "" }, ...existingStudents.slice(1)]
    : [{ studentId, school: "" }];
  users[idx] = { ...users[idx], fullName, phone, studentId, students: nextStudents };
  saveUsers(users);
  const { passwordHash: _ph, ...updated } = users[idx];
  setSession(updated);
  return updated;
}

export type ProfileExtras = Partial<
  Pick<
    Guardian,
    | "avatarDataUrl"
    | "address"
    | "occupation"
    | "emergencyName"
    | "emergencyPhone"
    | "preferredLanguage"
    | "dateOfBirth"
  >
> & { students?: StudentLink[] };

export function updateProfileFull(
  input: {
    fullName: string;
    phone: string;
  } & ProfileExtras,
): Guardian {
  const session = getSession();
  if (!session) throw new Error("Not signed in");
  const fullName = input.fullName.trim();
  const phone = input.phone.trim();
  if (!fullName) throw new Error("Full name is required");
  const users = loadUsers();
  const idx = users.findIndex((u) => u.id === session.id);
  if (idx === -1) throw new Error("Account not found");

  let nextStudents = users[idx].students || [];
  if (input.students) {
    nextStudents = input.students
      .map((s) => ({
        studentId: s.studentId.trim().toUpperCase(),
        school: (s.school || "").trim(),
        name: s.name?.trim() || undefined,
        grade: s.grade?.trim() || undefined,
      }))
      .filter((s) => s.studentId.length > 0);
    if (nextStudents.length === 0) throw new Error("Add at least one child");
  }

  users[idx] = {
    ...users[idx],
    fullName,
    phone,
    students: nextStudents,
    studentId: nextStudents[0]?.studentId || users[idx].studentId,
    avatarDataUrl: input.avatarDataUrl ?? users[idx].avatarDataUrl,
    address: input.address ?? users[idx].address,
    occupation: input.occupation ?? users[idx].occupation,
    emergencyName: input.emergencyName ?? users[idx].emergencyName,
    emergencyPhone: input.emergencyPhone ?? users[idx].emergencyPhone,
    preferredLanguage: input.preferredLanguage ?? users[idx].preferredLanguage,
    dateOfBirth: input.dateOfBirth ?? users[idx].dateOfBirth,
  };
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
