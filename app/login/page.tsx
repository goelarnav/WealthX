import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = { title: "Log in — WealthX" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; reset?: string }>;
}) {
  const { next, reset } = await searchParams;

  return (
    <AuthShell title="Welcome back" description="Log in with your phone number and PIN.">
      <LoginForm next={next} showResetSuccess={reset === "success"} />
    </AuthShell>
  );
}
