"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { requireUser, destroySession } from "@/lib/auth/session";
import { verifyPinOrThrow, hashPin, PinLockedError } from "@/lib/auth/pin";
import { nameSchema, pinSchema } from "@/lib/validators/auth";
import type { ActionResult } from "@/lib/action-result";

export async function updateName(rawName: string): Promise<ActionResult> {
  const sessionUser = await requireUser();
  const name = nameSchema.safeParse(rawName);
  if (!name.success) {
    return { ok: false, error: name.error.issues[0]?.message ?? "Invalid name" };
  }

  await prisma.user.update({
    where: { id: sessionUser.id },
    data: { name: name.data },
  });

  return { ok: true };
}

export async function changePin(rawCurrentPin: string, rawNewPin: string): Promise<ActionResult> {
  const sessionUser = await requireUser();
  const currentPin = pinSchema.safeParse(rawCurrentPin);
  const newPin = pinSchema.safeParse(rawNewPin);
  if (!currentPin.success || !newPin.success) {
    return { ok: false, error: "Enter two valid 4-digit PINs." };
  }

  const user = await prisma.user.findUniqueOrThrow({ where: { id: sessionUser.id } });

  try {
    await verifyPinOrThrow(user, currentPin.data);
  } catch (error) {
    if (error instanceof PinLockedError) {
      return { ok: false, error: error.message };
    }
    return { ok: false, error: "Current PIN is incorrect." };
  }

  const pinHash = await hashPin(newPin.data);
  await prisma.user.update({ where: { id: user.id }, data: { pinHash } });

  return { ok: true };
}

export async function logout(): Promise<void> {
  await destroySession();
  redirect("/login");
}
