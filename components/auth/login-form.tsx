"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { login } from "@/app/login/actions";
import { PinInput } from "@/components/auth/pin-input";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export function LoginForm({ next, showResetSuccess }: { next?: string; showResetSuccess?: boolean }) {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const hasShownResetToast = useRef(false);

  useEffect(() => {
    if (showResetSuccess && !hasShownResetToast.current) {
      hasShownResetToast.current = true;
      toast.success("PIN updated. Log in with your new PIN.");
      router.replace("/login");
    }
    // Only meant to run once, on mount, in response to the initial URL.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function submit() {
    setError(null);
    startTransition(async () => {
      const result = await login(phone, pin);
      if (!result.ok) {
        setError(result.error);
        setPin("");
        return;
      }
      router.push(next && next.startsWith("/") ? next : "/dashboard");
      router.refresh();
    });
  }

  return (
    <form
      className="space-y-5"
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
    >
      <div className="space-y-2">
        <Label htmlFor="phone">Phone number</Label>
        <Input
          id="phone"
          type="tel"
          inputMode="numeric"
          placeholder="98765 43210"
          autoComplete="tel"
          autoFocus
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          disabled={isPending}
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="pin">4-digit PIN</Label>
          <Link href="/login/forgot-pin" className="text-sm font-medium text-teal-700 hover:text-teal-800">
            Forgot PIN?
          </Link>
        </div>
        <PinInput value={pin} onChange={setPin} disabled={isPending} aria-label="4-digit PIN" />
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <Button type="submit" className="w-full" disabled={isPending || phone.length < 10 || pin.length !== 4}>
        {isPending ? "Logging in…" : "Log in"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        New here?{" "}
        <Link href="/signup" className="font-medium text-teal-700 hover:text-teal-800">
          Create an account
        </Link>
      </p>
    </form>
  );
}
