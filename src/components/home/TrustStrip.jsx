import React from "react";
import { Headset, RotateCcw, ShieldCheck, Truck } from "lucide-react";
import Section from "@/components/Section";

const ITEMS = [
  { Icon: Truck, title: "Free delivery over ₱2,000", copy: "Tracked shipping on every order, dispatched within 24 hours." },
  { Icon: RotateCcw, title: "30-day easy returns", copy: "Changed your mind? Send it back within 30 days, no questions." },
  { Icon: ShieldCheck, title: "Verified sellers only", copy: "Every seller is reviewed and every listing is checked before it goes live." },
  { Icon: Headset, title: "24/7 buyer support", copy: "Real humans on chat and email, whatever time zone you shop from." },
];

export default function TrustStrip() {
  return (
    <Section className="py-12 sm:py-14 lg:py-16">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {ITEMS.map(({ Icon, title, copy }) => (
          <div key={title} className="rounded-2xl border border-border bg-card p-5 transition-colors duration-300 hover:border-primary/40">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-accent text-primary">
              <Icon className="h-5 w-5" strokeWidth={1.8} />
            </span>
            <h3 className="mt-4 text-sm font-medium text-foreground">{title}</h3>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{copy}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}
