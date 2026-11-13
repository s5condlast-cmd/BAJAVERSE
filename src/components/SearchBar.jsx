import React, { useState } from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

export default function SearchBar({
  onSubmit,
  placeholder = "Search products, brands and categories",
  size = "md",
  className,
  autoFocus = false,
}) {
  const [value, setValue] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(value.trim());
  };

  return (
    <form
      onSubmit={handleSubmit}
      role="search"
      className={cn(
        "group relative flex w-full items-center rounded-full border border-border bg-card transition-all duration-300 focus-within:border-primary/60 focus-within:shadow-[0_0_0_4px_rgba(109,40,217,0.12)]",
        size === "lg" ? "h-14 pl-5 pr-2" : "h-11 pl-4 pr-1.5",
        className
      )}
    >
      <Search className={cn("shrink-0 text-muted-foreground", size === "lg" ? "h-5 w-5" : "h-4 w-4")} />
      <input
        type="search"
        value={value}
        autoFocus={autoFocus}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        aria-label="Search the BAJAVERSE Marketplace"
        className={cn(
          "h-full flex-1 bg-transparent px-3 text-foreground outline-none placeholder:text-muted-foreground/80",
          size === "lg" ? "text-[15px]" : "text-sm"
        )}
      />
      <button
        type="submit"
        className={cn(
          "shrink-0 rounded-full bg-primary font-medium text-primary-foreground transition-all duration-300 hover:bg-primary/90",
          size === "lg" ? "h-10 px-5 text-sm" : "h-8 px-4 text-xs"
        )}
      >
        Search
      </button>
    </form>
  );
}
