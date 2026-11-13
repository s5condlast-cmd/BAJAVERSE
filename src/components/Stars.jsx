import React from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Stars({ rating = 0, reviewCount, className, size = 13, hideValue = false }) {
  const value = Number(rating) || 0;
  const filled = Math.round(value);

  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <div className="flex items-center gap-0.5" aria-hidden="true">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            style={{ width: size, height: size }}
            className={cn("shrink-0", i <= filled ? "fill-primary text-primary" : "fill-transparent text-muted-foreground/30")}
          />
        ))}
      </div>
      {!hideValue && (
        <span className="num text-[11px] leading-none text-muted-foreground">
          {value.toFixed(1)}
          {typeof reviewCount === "number" && reviewCount > 0 ? ` (${reviewCount})` : ""}
        </span>
      )}
    </div>
  );
}
