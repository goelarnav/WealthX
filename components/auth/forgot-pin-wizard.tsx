"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { sendResetOtp, verifyResetOtp, completeReset } from "@/app/login/forgot-pin/actions";
import { OtpInput } from "@/components/auth/otp-input";
import { PinInput } from "@/components/auth/pin-input";
import { StepPanel } from "@/components/motion/step-panel";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

type Step = "phone" | "otp" | "newpin";

export function ForgotPinWizard() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [devCode, setDevCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function submitPhone() {
    setError(null);
    startTransition(async () => {
      const result = await sendResetOtp(phone);
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
      const result = await verifyResetOtp(phone, code);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setStep("newpin");
    });
  }

  function resendOtp() {
    setError(null);
    startTransition(async () => {
      const result = await sendResetOtp(phone);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setDevCode(result.data?.devCode ?? null);
      setCode("");
    });
  }

  function submitNewPin() {
    setError(null);
    if (pin !== confirmPin) {
      setError("PINs don't match.");
      return;
    }
    startTransition(async () => {
      const result = await completeReset(pin);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.push("/login?reset=success");
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
            <Label htmlFor="reset-phone">Phone number</Label>
            <Input
              id="reset-phone"
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
            <Link href="/login" className="font-medium text-teal-700 hover:text-teal-800">
              Back to login
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

      {step === "newpin" && (
        <form
          className="space-y-5"
          onSubmit={(event) => {
            event.preventDefault();
            submitNewPin();
          }}
        >
          <div className="space-y-2">
            <Label>New 4-digit PIN</Label>
            <PinInput value={pin} onChange={setPin} disabled={isPending} autoFocus aria-label="New PIN" />
          </div>
          <div className="space-y-2">
            <Label>Confirm new PIN</Label>
            <PinInput value={confirmPin} onChange={setConfirmPin} disabled={isPending} aria-label="Confirm new PIN" />
          </div>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}

          <Button
            type="submit"
            className="w-full"
            disabled={isPending || pin.length !== 4 || confirmPin.length !== 4}
          >
            {isPending ? "Saving…" : "Set new PIN"}
          </Button>
        </form>
      )}
    </StepPanel>
  );
}
