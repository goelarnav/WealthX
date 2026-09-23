"use client";

import { AnimatePresence, motion } from "motion/react";
import type { ReactNode } from "react";

/** Crossfade + slight horizontal slide between wizard steps (signup,
 * forgot-PIN). `stepKey` changing is what triggers the transition. */
export function StepPanel({ stepKey, children }: { stepKey: string; children: ReactNode }) {
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={stepKey}
        initial={{ opacity: 0, x: 12 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -12 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
