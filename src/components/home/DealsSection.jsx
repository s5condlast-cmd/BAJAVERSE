import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, BadgePercent, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import Section from "@/components/Section";
import ProductGrid from "@/components/ProductGrid";

export default function DealsSection({ products = [], loading = false }) {
  const best = products.reduce((max, p) => {
    const off = p.original_price > p.price ? (p.original_price - p.price) / p.original_price : 0;
    return off > max ? off : max;
  }, 0);
  const headline = best > 0 ? `Up to ${Math.round(best * 100)}% off` : "Member pricing";

  return (
    <Section id="deals">
      <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:gap-10">
        <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-accent p-7 sm:p-9">
          <div className="pointer-events-none absolute -bottom-16 -right-10 h-52 w-52 rounded-full bg-primary/10 blur-[90px]" aria-hidden="true" />
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-card px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.22em] text-primary">
            <BadgePercent className="h-3.5 w-3.5" /> Deals &amp; discounts
          </span>
          <h2 className="mt-6 font-display text-3xl font-semibold tracking-[-0.03em] text-foreground sm:text-4xl">{headline}</h2>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
            Limited-run price drops from verified sellers. Every deal is checked against the last 30 days of pricing — no fake markdowns, no inflated list prices.
          </p>
          <ul className="mt-7 space-y-3 text-sm text-foreground/85">
            <li className="flex items-center gap-2.5">
              <Clock className="h-4 w-4 text-primary" /> Refreshed every 24 hours
            </li>
            <li className="flex items-center gap-2.5">
              <BadgePercent className="h-4 w-4 text-primary" /> Price-match guarantee on flagged deals
            </li>
          </ul>
          <Button asChild size="lg" className="mt-8 h-12 rounded-full bg-primary px-7 text-sm font-medium text-primary-foreground hover:bg-primary/90">
            <Link to="/products?sale=1">
              Shop all deals
              <ArrowRight className="ml-1.5 h-4 w-4" />
            </Link>
          </Button>
        </div>

        <ProductGrid products={products} loading={loading} skeletonCount={4} columns="grid-cols-2" className="self-center" />
      </div>
    </Section>
  );
}
