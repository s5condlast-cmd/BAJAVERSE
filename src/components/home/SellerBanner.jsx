import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, BarChart3, PackagePlus, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import Section from "@/components/Section";

const POINTS = [
  { Icon: PackagePlus, label: "List a product in under two minutes" },
  { Icon: BarChart3, label: "Live performance dashboard per listing" },
  { Icon: Store, label: "No monthly fee — commission only on sales" },
];

export default function SellerBanner() {
  return (
    <Section>
      <div className="relative overflow-hidden rounded-3xl border border-border bg-accent p-8 sm:p-12 lg:p-14">
        <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-primary/10 blur-[110px]" aria-hidden="true" />
        <div className="pointer-events-none absolute inset-0 grid-backdrop opacity-40" aria-hidden="true" />
        <div className="relative grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-primary">Sell on BAJAVERSE</p>
            <h2 className="mt-4 font-display text-3xl font-semibold tracking-[-0.03em] text-foreground sm:text-4xl">
              Open your store to 400,000 monthly shoppers
            </h2>
            <p className="mt-5 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-[15px]">
              Bring your catalogue to a marketplace built for speed. Set your own prices, manage inventory from one dashboard and get paid on a weekly cycle.
            </p>
            <Button asChild size="lg" className="mt-8 h-12 rounded-full bg-primary px-7 text-sm font-medium text-primary-foreground hover:bg-primary/90">
              <Link to="/seller">
                Enter the Seller Center
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <ul className="space-y-3.5">
            {POINTS.map(({ Icon, label }) => (
              <li key={label} className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-accent text-primary">
                  <Icon className="h-5 w-5" strokeWidth={1.8} />
                </span>
                <span className="text-sm text-foreground/90">{label}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Section>
  );
}
