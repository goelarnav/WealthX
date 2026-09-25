import type { ReactNode } from "react";
import { Brand } from "@/components/navigation/brand";
import { Reveal } from "@/components/motion/reveal";

export function AuthShell({
  title,
  description,
  children,
  footer,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-muted/30 px-4 py-12">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 left-1/2 size-[36rem] -translate-x-1/2 rounded-full bg-teal-200/30 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-40 right-1/2 size-[28rem] translate-x-1/2 rounded-full bg-teal-100/40 blur-3xl sm:right-0 sm:translate-x-1/3"
      />

      <div className="relative mb-8">
        <Brand />
      </div>
      <Reveal className="relative w-full max-w-sm">
        <div className="rounded-2xl border bg-card p-6 shadow-xl shadow-slate-900/[0.04] sm:p-8">
          <div className="mb-6 space-y-1.5 text-center">
            <h1 className="text-xl font-semibold text-foreground">{title}</h1>
            {description ? (
              <p className="text-sm text-muted-foreground">{description}</p>
            ) : null}
          </div>
          {children}
        </div>
        {footer ? <div className="mt-6 text-center text-sm text-muted-foreground">{footer}</div> : null}
      </Reveal>
    </div>
  );
}
