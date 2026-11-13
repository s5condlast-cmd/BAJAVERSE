import React from "react";
import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export default function QuantityStepper({ value, onChange, min = 1, max = 99, compact = false, className }) {
  return (
    <div className={cn("inline-flex items-center rounded-full border border-border bg-card", compact ? "h-11" : "h-12", className)}>
      <button
        type="button"
        aria-label="Decrease quantity"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        className="grid h-full w-11 place-items-center rounded-l-full text-muted-foreground transition-colors hover:text-foreground disabled:opacity-30"
      >
        <Minus className="h-3.5 w-3.5" />
      </button>
      <span className="num w-8 text-center text-sm font-medium text-foreground">{value}</span>
      <button
        type="button"
        aria-label="Increase quantity"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        className="grid h-full w-11 place-items-center rounded-r-full text-muted-foreground transition-colors hover:text-foreground disabled:opacity-30"
      >
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
