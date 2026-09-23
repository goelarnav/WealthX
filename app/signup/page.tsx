import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/auth-shell";
import { SignupWizard } from "@/components/auth/signup-wizard";

export const metadata: Metadata = { title: "Sign up — WealthX" };

export default function SignupPage() {
  return (
    <AuthShell title="Create your account" description="Verify your number to get started.">
      <SignupWizard />
    </AuthShell>
  );
}
