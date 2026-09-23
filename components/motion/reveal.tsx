"use client";

import { motion, type Transition } from "motion/react";
import type { ReactNode } from "react";

const transition: Transition = { duration: 0.25, ease: "easeOut" };

/** Subtle fade + rise-in used for cards/sections entering the viewport.
 * Kept deliberately small — this app avoids showy motion. */
export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...transition, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
