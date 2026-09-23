"use client";

import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  onComplete?: (value: string) => void;
  disabled?: boolean;
  autoFocus?: boolean;
}

/** 6-digit OTP entry. Digits are shown — unlike the PIN, an OTP is a
 * one-time code with no standing value, so there's nothing to protect by
 * masking it. */
export function OtpInput({ value, onChange, onComplete, disabled, autoFocus }: OtpInputProps) {
  return (
    <InputOTP
      maxLength={6}
      value={value}
      onChange={onChange}
      onComplete={onComplete}
      disabled={disabled}
      autoFocus={autoFocus}
      inputMode="numeric"
    >
      <InputOTPGroup>
        {Array.from({ length: 6 }, (_, index) => (
          <InputOTPSlot key={index} index={index} className="size-11 text-base" />
        ))}
      </InputOTPGroup>
    </InputOTP>
  );
}
