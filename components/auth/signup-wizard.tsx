"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { sendSignupOtp, verifySignupOtp, completeSignup } from "@/app/signup/actions";
import { OtpInput } from "@/components/auth/otp-input";
import { PinInput } from "@/components/auth/pin-input";
import { StepPanel } from "@/components/motion/step-panel";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

type Step = "phone" | "otp" | "profile";

export function SignupWizard() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [devCode, setDevCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function submitPhone() {
    setError(null);
    startTransition(async () => {
      const result = await sendSignupOtp(phone);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setDevCode(result.data?.devCode ?? null);
      setStep("otp");
    });
  }

  function submitOtp() {
    setError(null);
    startTransition(async () => {
      const result = await verifySignupOtp(phone, code);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setStep("profile");
    });
  }

  function resendOtp() {
    setError(null);
    startTransition(async () => {
      const result = await sendSignupOtp(phone);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setDevCode(result.data?.devCode ?? null);
      setCode("");
    });
  }

  function submitProfile() {
    setError(null);
    if (pin !== confirmPin) {
      setError("PINs don't match.");
      return;
    }
    startTransition(async () => {
      const result = await completeSignup(name, pin);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.push("/dashboard");
      router.refresh();
    });
  }

  return (
    <StepPanel stepKey={step}>
      {step === "phone" && (
        <form
          className="space-y-5"
          onSubmit={(event) => {
            event.preventDefault();
            submitPhone();
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="signup-phone">Phone number</Label>
            <Input
              id="signup-phone"
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
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <Button type="submit" className="w-full" disabled={isPending || phone.length < 10}>
            {isPending ? "Sending code…" : "Send OTP"}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-teal-700 hover:text-teal-800">
              Log in
            </Link>
          </p>
        </form>
      )}

      {step === "otp" && (
        <form
          className="space-y-5"
          onSubmit={(event) => {
            event.preventDefault();
            submitOtp();
          }}
        >
          <div className="space-y-2 text-center">
            <p className="text-sm text-muted-foreground">
              Enter the 6-digit code sent to <span className="font-medium text-foreground">{phone}</span>
            </p>
            <div className="flex justify-center pt-1">
              <OtpInput value={code} onChange={setCode} onComplete={submitOtp} disabled={isPending} autoFocus />
            </div>
          </div>

          {devCode ? (
            <p className="rounded-lg bg-teal-50 px-3 py-2 text-center text-sm text-teal-800">
              Dev mode — your code is <span className="font-mono font-semibold">{devCode}</span>
            </p>
          ) : null}

          {error ? <p className="text-sm text-destructive">{error}</p> : null}

          <Button type="submit" className="w-full" disabled={isPending || code.length !== 6}>
            {isPending ? "Verifying…" : "Verify code"}
          </Button>

          <div className="flex items-center justify-between text-sm">
            <button
              type="button"
              className="text-muted-foreground hover:text-foreground"
              onClick={() => {
                setStep("phone");
                setCode("");
                setError(null);
              }}
              disabled={isPending}
            >
              Change number
            </button>
            <button
              type="button"
              className="font-medium text-teal-700 hover:text-teal-800"
              onClick={resendOtp}
              disabled={isPending}
            >
              Resend code
            </button>
          </div>
        </form>
      )}

      {step === "profile" && (
        <form
          className="space-y-5"
          onSubmit={(event) => {
            event.preventDefault();
            submitProfile();
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="signup-name">Full name</Label>
            <Input
              id="signup-name"
              placeholder="Your name"
              autoFocus
              value={name}
              onChange={(event) => setName(event.target.value)}
              disabled={isPending}
            />
          </div>

          <div className="space-y-2">
            <Label>Phone number</Label>
            <Input value={phone} readOnly disabled className="text-muted-foreground" />
          </div>

          <div className="space-y-2">
            <Label>Create a 4-digit PIN</Label>
            <PinInput value={pin} onChange={setPin} disabled={isPending} aria-label="Create PIN" />
          </div>

          <div className="space-y-2">
            <Label>Confirm PIN</Label>
            <PinInput value={confirmPin} onChange={setConfirmPin} disabled={isPending} aria-label="Confirm PIN" />
          </div>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}

          <Button
            type="submit"
            className="w-full"
            disabled={isPending || name.trim().length < 2 || pin.length !== 4 || confirmPin.length !== 4}
          >
            {isPending ? "Creating account…" : "Create account"}
          </Button>
        </form>
      )}
    </StepPanel>
  );
}
