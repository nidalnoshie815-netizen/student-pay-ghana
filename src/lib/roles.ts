import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useGuardian } from "@/hooks/use-guardian";

export type Role = "parent" | "student" | "vendor" | "admin";

export const ROLE_LABEL: Record<Role, string> = {
  parent: "Parent / Guardian",
  student: "Student",
  vendor: "Vendor / Merchant",
  admin: "Admin",
};

export const DASHBOARD_BY_ROLE: Record<Role, string> = {
  parent: "/parent",
  student: "/student",
  vendor: "/vendor",
  admin: "/admin",
};

export function useRequireRole(role: Role) {
  const user = useGuardian();
  const navigate = useNavigate();
  useEffect(() => {
    if (!user) {
      navigate({ to: "/guardian/auth" });
      return;
    }
    const actual = (user.role as Role) || "parent";
    if (actual !== role) {
      navigate({ to: DASHBOARD_BY_ROLE[actual] });
    }
  }, [user, role, navigate]);
  return user;
}
