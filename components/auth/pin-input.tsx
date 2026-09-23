"use client";

import * as React from "react";
import { OTPInputContext } from "input-otp";
import { InputOTP, InputOTPGroup } from "@/components/ui/input-otp";
import { cn } from "@/lib/utils";

function MaskedSlot({ index, className }: { index: number; className?: string }) {
  const context = React.useContext(OTPInputContext);
  const slot = context?.slots[index];

  return (
    <div
      data-active={slot?.isActive}
      className={cn(
        "relative flex size-12 items-center justify-center border-y border-r border-input text-lg transition-all outline-none first:rounded-l-lg first:border-l last:rounded-r-lg data-[active=true]:z-10 data-[active=true]:border-ring data-[active=true]:ring-3 data-[active=true]:ring-ring/50 dark:bg-input/30",
        className,
      )}
    >
      {slot?.char ? (
        <span className="size-2.5 rounded-full bg-foreground" aria-hidden />
      ) : null}
      {slot?.hasFakeCaret && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-4 w-px animate-caret-blink bg-foreground duration-1000" />
        </div>
      )}
    </div>
  );
}

interface PinInputProps {
  value: string;
  onChange: (value: string) => void;
  onComplete?: (value: string) => void;
  disabled?: boolean;
  autoFocus?: boolean;
  "aria-label"?: string;
}

/** Masked 4-digit PIN entry — digits are never rendered on screen, only a
 * filled dot per slot, per the "never show the PIN in plain text" rule. */
export function PinInput({ value, onChange, onComplete, disabled, autoFocus, ...aria }: PinInputProps) {
  return (
    <InputOTP
      maxLength={4}
      value={value}
      onChange={onChange}
      onComplete={onComplete}
      disabled={disabled}
      autoFocus={autoFocus}
      inputMode="numeric"
      aria-label={aria["aria-label"] ?? "4-digit PIN"}
    >
      <InputOTPGroup>
        {Array.from({ length: 4 }, (_, index) => (
          <MaskedSlot key={index} index={index} />
        ))}
      </InputOTPGroup>
    </InputOTP>
  );
}
