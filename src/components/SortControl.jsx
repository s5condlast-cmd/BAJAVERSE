import React, { useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { cn } from "@/lib/utils";

export default function SortControl({ value, options, onChange, placeholder = "Sort" }) {
  const [open, setOpen] = useState(false);
  const current = options.find((option) => option.value === value);

  return (
    <>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="hidden h-11 w-[190px] rounded-full border-border bg-card text-sm text-foreground md:flex">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="border-border bg-popover">
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>
          <button
            type="button"
            className="flex h-11 items-center gap-2 rounded-full border border-border bg-card px-4 text-sm text-foreground transition hover:border-primary/40 md:hidden"
          >
            <span className="text-muted-foreground">Sort:</span>
            <span className="font-medium">{current?.label || placeholder}</span>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </button>
        </DrawerTrigger>
        <DrawerContent className="border-border bg-card">
          <DrawerHeader className="text-left">
            <DrawerTitle className="font-display text-base text-foreground">Sort products</DrawerTitle>
          </DrawerHeader>
          <ul className="px-2 pb-6">
            {options.map((option) => {
              const active = option.value === value;
              return (
                <li key={option.value}>
                  <button
                    type="button"
                    onClick={() => {
                      onChange(option.value);
                      setOpen(false);
                    }}
                    className={cn(
                      "flex w-full items-center justify-between rounded-2xl px-4 py-4 text-left text-sm transition-colors",
                      active ? "bg-accent text-primary" : "text-foreground hover:bg-muted"
                    )}
                  >
                    <span className="py-1">{option.label}</span>
                    {active && <Check className="h-4 w-4" />}
                  </button>
                </li>
              );
            })}
          </ul>
        </DrawerContent>
      </Drawer>
    </>
  );
}
