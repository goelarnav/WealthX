"use client";

import { useEffect, useRef, useState, type ChangeEvent, type FocusEvent } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { parseAmountShorthand } from "@/lib/calculators/format";
import { cn } from "@/lib/utils";

/** ₹ amount input that accepts Indian shorthand ("1.5 Cr", "10k") and
 * re-formats to plain digits on blur — same convention across every
 * calculator so amounts never require counting zeros by hand.
 *
 * Propagates every keystroke that parses to a valid amount so results
 * update live, but only overwrites the displayed text (from an external
 * value change, or the blur reformat) while the field isn't focused —
 * otherwise a mid-shorthand string like "1.5 C" would get stomped before
 * the user finishes typing "Cr". */
export function CurrencyField({
  id,
  label,
  value,
  onChange,
  sublabel,
  className,
}: {
  id: string;
  label: string;
  value: number;
  onChange: (value: number) => void;
  sublabel?: string;
  className?: string;
}) {
  const [text, setText] = useState(String(value));
  const [error, setError] = useState<string | null>(null);
  const focused = useRef(false);

  useEffect(() => {
    if (!focused.current) setText(String(value));
  }, [value]);

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const raw = event.target.value;
    setText(raw);
    try {
      const parsed = parseAmountShorthand(raw);
      if (parsed < 0) throw new Error("Invalid input");
      setError(null);
      onChange(parsed);
    } catch {
      // Incomplete or invalid while typing (e.g. "1.5 C") — hold off on
      // propagating until it parses again, but don't touch the text.
    }
  }

  function handleFocus() {
    focused.current = true;
  }

  function handleBlur(event: FocusEvent<HTMLInputElement>) {
    focused.current = false;
    try {
      const parsed = parseAmountShorthand(event.target.value);
      if (parsed < 0) throw new Error("Invalid input");
      setError(null);
      setText(String(parsed));
      onChange(parsed);
    } catch {
      setError("Invalid amount");
    }
  }

  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
          ₹
        </span>
        <Input
          id={id}
          className="pl-7"
          inputMode="decimal"
          value={text}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          aria-invalid={error ? true : undefined}
        />
      </div>
      {error ? (
        <p className="text-xs text-destructive">{error}</p>
      ) : sublabel ? (
        <p className="text-xs text-muted-foreground">{sublabel}</p>
      ) : null}
    </div>
  );
}
