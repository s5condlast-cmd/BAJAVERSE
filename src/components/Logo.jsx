import React from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

export default function Logo({ className, onNavigate }) {
  return (
    <Link to="/" onClick={onNavigate} aria-label="BAJAVERSE home" className={cn("group flex shrink-0 items-center gap-2.5", className)}>
      <img
        src="/logo.png"
        alt="BAJAVERSE logo"
        className="h-9 w-9 object-contain transition-transform duration-300 group-hover:scale-105"
      />
      <span className="font-display text-lg font-semibold tracking-[-0.03em] text-foreground">
        BAJA<span className="text-primary">VERSE</span>
      </span>
    </Link>
  );
}
