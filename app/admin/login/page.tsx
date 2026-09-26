import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/auth-shell";
import { AdminLoginForm } from "@/components/admin/admin-login-form";

export const metadata: Metadata = { title: "Admin login — WealthX" };

export default function AdminLoginPage() {
  return (
    <AuthShell title="Admin" description="Sign in to manage recommendations.">
      <AdminLoginForm />
    </AuthShell>
  );
}
