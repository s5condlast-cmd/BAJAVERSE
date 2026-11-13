import React from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import Section from "@/components/Section";
import SectionHeading from "@/components/SectionHeading";
import CategoryIcon from "@/components/CategoryIcon";

export default function CategoryStrip({ categories = [], counts = {}, loading = false }) {
  const items = loading ? Array.from({ length: 6 }) : categories;

  return (
    <Section id="categories">
      <SectionHeading
        eyebrow="Browse the bazaar"
        title="Shop by category"
        description="Six curated departments, each stocked by verified sellers and quality-checked before listing."
        action={
          <Link to="/products" className="inline-flex items-center gap-1.5 text-sm font-medium text-primary transition-colors hover:text-primary/80">
            View everything
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        }
      />

      <div className="mt-10 grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-3 xl:grid-cols-6">
        {items.map((category, index) => {
          if (!category) {
            return <div key={index} className="h-[168px] animate-pulse rounded-2xl border border-border bg-card" />;
          }
          const count = counts[category.slug];
          return (
            <Link
              key={category.slug}
              to={`/products?category=${category.slug}`}
              className="group relative flex h-[168px] flex-col justify-between overflow-hidden rounded-2xl border border-border bg-card p-5 transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-[0_24px_50px_-30px_rgba(109,40,217,0.3)]"
            >
              <div
                className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-primary/10 blur-2xl transition-opacity duration-500 group-hover:bg-primary/25"
                aria-hidden="true"
              />
              <span className="relative grid h-11 w-11 place-items-center rounded-xl border border-border bg-accent text-primary transition-colors duration-300 group-hover:border-primary/40 group-hover:bg-primary group-hover:text-primary-foreground">
                <CategoryIcon name={category.icon} className="h-5 w-5" />
              </span>
              <div className="relative">
                <h3 className="text-sm font-medium text-foreground">{category.name}</h3>
                <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground">{category.tagline}</p>
                {typeof count === "number" && (
                  <p className="num mt-2 text-[10px] uppercase tracking-[0.18em] text-primary">
                    {count} {count === 1 ? "item" : "items"}
                  </p>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </Section>
  );
}
