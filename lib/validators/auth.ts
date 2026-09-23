import { z } from "zod";

// India-first MVP: accept a 10-digit local number or a +91 prefixed one and
// normalize to a consistent E.164-ish string used as the DB key.
export const phoneSchema = z
  .string()
  .trim()
  .transform((value) => value.replace(/[\s-]/g, ""))
  .pipe(
    z
      .string()
      .regex(/^(\+91)?[6-9]\d{9}$/, "Enter a valid 10-digit mobile number"),
  )
  .transform((value) => (value.startsWith("+91") ? value : `+91${value}`));

export const otpCodeSchema = z
  .string()
  .trim()
  .regex(/^\d{6}$/, "Enter the 6-digit code");

export const pinSchema = z
  .string()
  .regex(/^\d{4}$/, "PIN must be exactly 4 digits");

export const nameSchema = z
  .string()
  .trim()
  .min(2, "Name is too short")
  .max(60, "Name is too long");

export type Phone = z.infer<typeof phoneSchema>;
