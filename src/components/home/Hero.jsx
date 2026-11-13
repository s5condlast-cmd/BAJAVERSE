import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import SearchBar from "@/components/SearchBar";
import HeroArtwork from "@/components/home/HeroArtwork";

const STATS = [
  { value: "20k+", label: "Products listed" },
  { value: "4.8k", label: "Verified sellers" },
  { value: "4.9", label: "Average rating" },
];

export default function Hero({ onSearch }) {
  return (
    <section className="relative overflow-hidden border-b border-border">
      <div className="pointer-events-none absolute inset-0 grid-backdrop opacity-70" aria-hidden="true" />
      <div className="pointer-events-none absolute -top-48 left-[15%] h-[520px] w-[520px] rounded-full bg-primary/10 blur-[150px]" aria-hidden="true" />
      <div className="pointer-events-none absolute -bottom-32 right-0 h-[420px] w-[420px] rounded-full bg-primary/5 blur-[140px]" aria-hidden="true" />

      <div className="relative mx-auto grid w-full max-w-[1600px] items-center gap-14 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:px-10 lg:py-24">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.22em] text-primary">
            New season drop
          </span>
          <h1 className="mt-6 font-display text-4xl font-semibold leading-[1.06] tracking-[-0.035em] text-foreground sm:text-5xl lg:text-6xl">
            Welcome to{" "}
            <span className="bg-gradient-to-r from-primary to-violet-500 bg-clip-text text-transparent">BAJA VERSE</span>{" "}
            Shop!
          </h1>
          <p className="mt-5 font-display text-lg font-medium tracking-[-0.01em] text-primary sm:text-xl">
            Discover. Shop. Enjoy.
          </p>
          <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-muted-foreground sm:text-base">
            Your marketplace for products, great finds, and new possibilities.
          </p>

          <div className="mt-8 max-w-xl">
            <SearchBar size="lg" onSubmit={onSearch} placeholder="Search headphones, drones, smart home…" />
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Button asChild size="lg" className="h-12 rounded-full bg-primary px-7 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90">
              <Link to="/products">
                Start Shopping
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-12 rounded-full border-border bg-card px-7 text-sm font-medium text-foreground hover:bg-muted hover:text-foreground">
              <Link to="/seller">Become a seller</Link>
            </Button>
          </div>

          <dl className="mt-11 grid max-w-lg grid-cols-3 gap-6 border-t border-border pt-7">
            {STATS.map((stat) => (
              <div key={stat.label}>
                <dt className="num text-2xl font-semibold text-foreground">{stat.value}</dt>
                <dd className="mt-1.5 text-[11px] uppercase tracking-[0.16em] text-muted-foreground">{stat.label}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="relative">
          <div className="relative overflow-hidden rounded-[28px] border border-border bg-card p-2 shadow-[0_30px_60px_-40px_rgba(37,99,235,0.3)]">
            <HeroArtwork />
          </div>
          <div className="absolute -bottom-5 left-5 hidden items-center gap-3 rounded-2xl border border-border px-4 py-3 glass sm:flex">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-accent text-primary">
              <Truck className="h-4 w-4" />
            </span>
            <div>
              <p className="text-xs font-medium text-foreground">Free delivery over ₱2,000</p>
              <p className="text-[11px] text-muted-foreground">Dispatched within 24 hours</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
