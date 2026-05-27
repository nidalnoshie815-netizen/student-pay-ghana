import { Link } from "@tanstack/react-router";
import { GraduationCap } from "lucide-react";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link to="/" className={`flex items-center gap-2 ${className}`}>
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-primary shadow-glow">
        <GraduationCap className="h-5 w-5 text-primary-foreground" strokeWidth={2.5} />
      </div>
      <span className="font-display text-lg font-bold tracking-tight">
        Student<span className="text-primary">Pay</span>
      </span>
    </Link>
  );
}
