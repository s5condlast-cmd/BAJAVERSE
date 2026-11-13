import React from "react";
import { cn } from "@/lib/utils";

export default function Section({ id, children, className, innerClassName, container = true }) {
  return (
    <section id={id} className={cn("py-14 sm:py-16 lg:py-24", className)}>
      {container ? (
        <div className={cn("mx-auto w-full max-w-[1600px] px-4 sm:px-6 lg:px-10", innerClassName)}>{children}</div>
      ) : (
        children
      )}
    </section>
  );
}
