"use client";

import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";

/** Labeled slider with a live numeric readout — used for ages, years, and
 * percentage assumptions across every calculator. */
export function SliderField({
  id,
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  suffix = "",
  sublabel,
}: {
  id: string;
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  suffix?: string;
  sublabel?: string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between gap-2">
        <Label htmlFor={id}>{label}</Label>
        <span className="text-sm font-medium tabular-nums text-foreground">
          {value}
          {suffix}
        </span>
      </div>
      <Slider
        id={id}
        value={[value]}
        onValueChange={(next) => onChange(Array.isArray(next) ? next[0] : next)}
        min={min}
        max={max}
        step={step}
      />
      {sublabel ? <p className="text-xs text-muted-foreground">{sublabel}</p> : null}
    </div>
  );
}
