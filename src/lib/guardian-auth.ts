// Real Supabase-backed auth. The Guardian shape and exported function names
// are preserved so existing routes continue to work unchanged.
// A Guardian snapshot is cached in localStorage so `getSession()` stays sync
// for existing callers; the source of truth is Supabase Auth + `profiles` + `user_roles`.

import { supabase } from "@/integrations/supabase/client";

export type Role = "parent" | "student" | "vendor" | "admin";

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
  studentId: string;
  students: StudentLink[];
  createdAt: number;
  role?: Role;
  businessName?: string;
  suspended?: boolean;
  avatarDataUrl?: string;
  address?: string;
  occupation?: string;
  emergencyName?: string;
  emergencyPhone?: string;
  preferredLanguage?: string;
  dateOfBirth?: string;
}

const SESSION_KEY = "studentpay_guardian_session_v2";
const PIN_KEY = "studentpay_guardian_pin_v1";
const PENDING_STUDENTS_KEY = "studentpay_pending_students_v1";

function emitAuth() {
  if (typeof window !== "undefined") window.dispatchEvent(new Event("studentpay:auth"));
}

function setSessionCache(g: Guardian | null) {
  if (typeof window === "undefined") return;
  if (g) localStorage.setItem(SESSION_KEY, JSON.stringify(g));
  else localStorage.removeItem(SESSION_KEY);
  emitAuth();
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

interface ProfileRow {
  id: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  business_name: string | null;
  student_id: string | null;
  school: string | null;
  suspended: boolean;
  students: StudentLink[] | null;
  address: string | null;
  occupation: string | null;
  emergency_name: string | null;
  emergency_phone: string | null;
  preferred_language: string | null;
  date_of_birth: string | null;
  created_at: string;
}

function rowToGuardian(row: ProfileRow, email: string, role: Role): Guardian {
  const students = Array.isArray(row.students) ? row.students : [];
  return {
    id: row.id,
    fullName: row.full_name || email.split("@")[0],
    email,
    phone: row.phone || "",
    studentId: row.student_id || students[0]?.studentId || "",
    students,
    createdAt: new Date(row.created_at).getTime(),
    role,
    businessName: row.business_name || undefined,
    suspended: row.suspended,
    avatarDataUrl: row.avatar_url || undefined,
    address: row.address || undefined,
    occupation: row.occupation || undefined,
    emergencyName: row.emergency_name || undefined,
    emergencyPhone: row.emergency_phone || undefined,
    preferredLanguage: row.preferred_language || undefined,
    dateOfBirth: row.date_of_birth || undefined,
  };
}

async function hydrateGuardian(userId: string, email: string): Promise<Guardian | null> {
  const [{ data: profile, error: pErr }, { data: roles }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
    supabase.from("user_roles").select("role").eq("user_id", userId),
  ]);
  if (pErr) throw pErr;
  if (!profile) return null;
  const roleList = (roles || []).map((r: { role: Role }) => r.role);
  const role: Role = roleList.includes("admin")
    ? "admin"
    : roleList.includes("vendor")
    ? "vendor"
    : roleList.includes("student")
    ? "student"
    : "parent";
  return rowToGuardian(profile as ProfileRow, email, role);
}

async function refreshCache(): Promise<Guardian | null> {
  const { data } = await supabase.auth.getUser();
  const u = data.user;
  if (!u?.email) {
    setSessionCache(null);
    return null;
  }
  try {
    const g = await hydrateGuardian(u.id, u.email);
    setSessionCache(g);
    return g;
  } catch {
    return null;
  }
}

let _authInit = false;
export function initAuth() {
  if (_authInit || typeof window === "undefined") return;
  _authInit = true;
  // Initial hydration from any existing session.
  void refreshCache();
  supabase.auth.onAuthStateChange((event) => {
    if (event === "SIGNED_OUT") {
      setSessionCache(null);
      return;
    }
    if (event === "SIGNED_IN" || event === "USER_UPDATED" || event === "TOKEN_REFRESHED") {
      void refreshCache();
    }
  });
}

// ---------- Sign up / Sign in ----------

export async function signUp(input: {
  fullName: string;
  email: string;
  phone: string;
  studentId?: string;
  students?: StudentLink[];
  password: string;
  role?: Role;
  businessName?: string;
}): Promise<Guardian> {
  if (input.password.length < 6) throw new Error("Password must be at least 6 characters");
  const role: Role = input.role || "parent";
  if (role === "admin") throw new Error("Admin accounts can't be self-created");

  const normalized: StudentLink[] = (input.students && input.students.length
    ? input.students
    : input.studentId
    ? [{ studentId: input.studentId, school: "" }]
    : []
  )
    .map((s) => ({ studentId: s.studentId.trim().toUpperCase(), school: (s.school || "").trim() }))
    .filter((s) => s.studentId.length > 0);

  if ((role === "parent" || role === "student") && normalized.length === 0) {
    throw new Error(role === "parent" ? "Please add at least one student" : "Please enter your Student ID");
  }
  if (role === "vendor" && !input.businessName?.trim()) {
    throw new Error("Business name is required");
  }

  const email = input.email.trim().toLowerCase();
  const { data, error } = await supabase.auth.signUp({
    email,
    password: input.password,
    options: {
      emailRedirectTo: `${window.location.origin}/guardian/auth`,
      data: {
        full_name: input.fullName.trim(),
        phone: input.phone.trim(),
        role,
        business_name: input.businessName?.trim(),
        student_id: normalized[0]?.studentId,
        school: normalized[0]?.school,
      },
    },
  });
  if (error) throw error;
  const userId = data.user?.id;
  if (!userId) throw new Error("Sign up failed — check your email to confirm your account");

  // Persist the full students list on the profile (trigger only stored the first).
  if (normalized.length) {
    await supabase.from("profiles").update({ students: normalized as unknown as never }).eq("id", userId);
  }

  // If email confirmation is required and no session yet, return a stub.
  if (!data.session) {
    return {
      id: userId,
      fullName: input.fullName.trim(),
      email,
      phone: input.phone.trim(),
      studentId: normalized[0]?.studentId || "",
      students: normalized,
      createdAt: Date.now(),
      role,
      businessName: input.businessName?.trim(),
    };
  }

  const g = await refreshCache();
  return g!;
}

export async function signIn(email: string, password: string): Promise<Guardian> {
  const { error } = await supabase.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password,
  });
  if (error) throw new Error(error.message === "Invalid login credentials" ? "Incorrect email or password" : error.message);
  const g = await refreshCache();
  if (!g) throw new Error("Could not load account profile");
  if (g.suspended) {
    await supabase.auth.signOut();
    setSessionCache(null);
    throw new Error("This account has been suspended. Contact support.");
  }
  return g;
}

export async function signOut(): Promise<void> {
  await supabase.auth.signOut();
  setSessionCache(null);
}

// ensureAdminSeed retained for API compatibility; admin creation happens
// server-side via a migration (a client cannot mint an admin role safely).
export async function ensureAdminSeed(): Promise<void> {
  return;
}

// ---------- Google OAuth ----------

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

export async function signInWithGoogle(input?: { students?: StudentLink[] }): Promise<Guardian> {
  const { lovable } = await import("@/integrations/lovable");
  if (input?.students?.length) savePendingStudents(input.students);
  const result = await lovable.auth.signInWithOAuth("google", {
    redirect_uri: window.location.origin + "/guardian/auth",
  });
  if (result.error) {
    clearPendingStudents();
    throw result.error instanceof Error ? result.error : new Error(String(result.error));
  }
  throw new Error("Redirecting to Google…");
}

// After returning from Google OAuth, hydrate profile & attach any pending students.
export async function completeGoogleSignIn(): Promise<Guardian | null> {
  const { data } = await supabase.auth.getUser();
  const u = data.user;
  if (!u?.email) return null;

  const pending = loadPendingStudents()
    .map((s) => ({ studentId: s.studentId.trim().toUpperCase(), school: (s.school || "").trim() }))
    .filter((s) => s.studentId.length > 0);

  if (pending.length) {
    await supabase
      .from("profiles")
      .update({
        students: pending,
        student_id: pending[0].studentId,
        school: pending[0].school,
      })
      .eq("id", u.id);
    clearPendingStudents();
  }

  const g = await refreshCache();
  return g;
}

// ---------- Profile ----------

export async function updateProfile(input: {
  fullName: string;
  phone: string;
  studentId: string;
}): Promise<Guardian> {
  const session = getSession();
  if (!session) throw new Error("Not signed in");
  const fullName = input.fullName.trim();
  const phone = input.phone.trim();
  const studentId = input.studentId.trim().toUpperCase();
  if (!fullName) throw new Error("Full name is required");

  const existing = session.students || [];
  const nextStudents: StudentLink[] = existing.length
    ? [{ studentId, school: existing[0]?.school || "" }, ...existing.slice(1)]
    : studentId
    ? [{ studentId, school: "" }]
    : [];

  const { error } = await supabase
    .from("profiles")
    .update({ full_name: fullName, phone, student_id: studentId || null, students: nextStudents as unknown as never })
    .eq("id", session.id);
  if (error) throw error;
  const g = await refreshCache();
  return g!;
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

export async function updateProfileFull(
  input: { fullName: string; phone: string } & ProfileExtras,
): Promise<Guardian> {
  const session = getSession();
  if (!session) throw new Error("Not signed in");
  const fullName = input.fullName.trim();
  const phone = input.phone.trim();
  if (!fullName) throw new Error("Full name is required");

  let nextStudents = session.students || [];
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

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: fullName,
      phone,
      students: nextStudents,
      student_id: nextStudents[0]?.studentId || session.studentId || null,
      avatar_url: input.avatarDataUrl ?? session.avatarDataUrl ?? null,
      address: input.address ?? session.address ?? null,
      occupation: input.occupation ?? session.occupation ?? null,
      emergency_name: input.emergencyName ?? session.emergencyName ?? null,
      emergency_phone: input.emergencyPhone ?? session.emergencyPhone ?? null,
      preferred_language: input.preferredLanguage ?? session.preferredLanguage ?? null,
      date_of_birth: input.dateOfBirth ?? session.dateOfBirth ?? null,
    })
    .eq("id", session.id);
  if (error) throw error;
  const g = await refreshCache();
  return g!;
}

export async function updateStudents(students: StudentLink[]): Promise<Guardian> {
  const session = getSession();
  if (!session) throw new Error("Not signed in");
  const normalized: StudentLink[] = students
    .map((s) => ({ studentId: s.studentId.trim().toUpperCase(), school: s.school.trim() }))
    .filter((s) => s.studentId.length > 0);
  if (normalized.length === 0) throw new Error("Add at least one student");
  const { error } = await supabase
    .from("profiles")
    .update({ students: normalized, student_id: normalized[0].studentId, school: normalized[0].school })
    .eq("id", session.id);
  if (error) throw error;
  const g = await refreshCache();
  return g!;
}

// ---------- Password ----------

export async function changePassword(input: {
  currentPassword: string;
  newPassword: string;
}): Promise<void> {
  const session = getSession();
  if (!session) throw new Error("Not signed in");
  if (input.newPassword.length < 6) throw new Error("Password must be at least 6 characters");
  // Re-verify current password by attempting sign-in.
  const { error: verifyErr } = await supabase.auth.signInWithPassword({
    email: session.email,
    password: input.currentPassword,
  });
  if (verifyErr) throw new Error("Current password is incorrect");
  const { error } = await supabase.auth.updateUser({ password: input.newPassword });
  if (error) throw error;
}

// Password reset via Supabase email link. The old OTP flow is replaced.
export async function requestPasswordReset(email: string): Promise<{ email: string }> {
  const normalized = email.trim().toLowerCase();
  const { error } = await supabase.auth.resetPasswordForEmail(normalized, {
    redirectTo: `${window.location.origin}/reset-password`,
  });
  if (error) throw error;
  return { email: normalized };
}

export async function resetPassword(input: { newPassword: string }): Promise<void> {
  if (input.newPassword.length < 6) throw new Error("Password must be at least 6 characters");
  const { error } = await supabase.auth.updateUser({ password: input.newPassword });
  if (error) throw error;
}

// Deprecated: only kept so old imports compile. Recovery uses the email link.
export function verifyResetCode(_email: string, _code: string): boolean {
  return true;
}

// ---------- PIN (still client-side; separate from account password) ----------

export function getPin(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(PIN_KEY);
}

export async function changePin(input: { currentPin?: string; newPin: string }): Promise<void> {
  const existing = getPin();
  if (existing && input.currentPin !== existing) throw new Error("Current PIN is incorrect");
  if (!/^\d{4}$/.test(input.newPin)) throw new Error("PIN must be 4 digits");
  localStorage.setItem(PIN_KEY, input.newPin);
}

// ---------- Admin ----------

export async function listAllUsers(): Promise<Guardian[]> {
  const [{ data: profiles, error }, { data: roles }] = await Promise.all([
    supabase.from("profiles").select("*").order("created_at", { ascending: false }),
    supabase.from("user_roles").select("user_id, role"),
  ]);
  if (error) throw error;
  const roleMap = new Map<string, Role>();
  for (const r of (roles || []) as { user_id: string; role: Role }[]) {
    const cur = roleMap.get(r.user_id);
    // Elevate to the "highest" role for display purposes.
    const order: Role[] = ["parent", "student", "vendor", "admin"];
    if (!cur || order.indexOf(r.role) > order.indexOf(cur)) roleMap.set(r.user_id, r.role);
  }
  return (profiles || []).map((p) => {
    const g = rowToGuardian(p as ProfileRow, "", roleMap.get(p.id) || "parent");
    return { ...g, email: "" };
  });
}

export async function setUserSuspended(id: string, suspended: boolean): Promise<void> {
  const { error } = await supabase.from("profiles").update({ suspended }).eq("id", id);
  if (error) throw error;
}
