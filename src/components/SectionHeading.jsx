import React from "react";
import { cn } from "@/lib/utils";

export default function SectionHeading({ eyebrow, title, description, action, className }) {
  return (
    <div className={cn("flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between", className)}>
      <div className="max-w-2xl">
        {eyebrow && <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-primary">{eyebrow}</p>}
        <h2 className="mt-3 font-display text-3xl font-semibold tracking-[-0.03em] text-foreground sm:text-4xl">{title}</h2>
        {description && <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-[15px]">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
