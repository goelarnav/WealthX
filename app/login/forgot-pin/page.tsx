import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/auth-shell";
import { ForgotPinWizard } from "@/components/auth/forgot-pin-wizard";

export const metadata: Metadata = { title: "Reset PIN — WealthX" };

export default function ForgotPinPage() {
  return (
    <AuthShell title="Reset your PIN" description="We'll verify your number with an OTP first.">
      <ForgotPinWizard />
    </AuthShell>
  );
}
