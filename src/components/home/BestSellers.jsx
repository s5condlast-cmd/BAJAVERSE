import React from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Flame } from "lucide-react";
import { Image } from "@/components/ui/image";
import Stars from "@/components/Stars";
import AddToCartButton from "@/components/AddToCartButton";
import Section from "@/components/Section";
import SectionHeading from "@/components/SectionHeading";
import { formatPrice, soldLabel } from "@/lib/format";

export default function BestSellers({ products = [], loading = false }) {
  return (
    <Section id="best-sellers" className="border-y border-border bg-muted/40">
      <SectionHeading
        eyebrow="Best sellers"
        title="What everyone is buying right now"
        description="Ranked by units sold in the last 30 days across the whole marketplace."
        action={
          <Link to="/products?best=1" className="inline-flex items-center gap-1.5 text-sm font-medium text-primary transition-colors hover:text-primary/80">
            See the full ranking
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        }
      />

      <div className="mt-10 space-y-3.5">
        {loading
          ? Array.from({ length: 4 }).map((_, index) => <div key={index} className="h-[104px] animate-pulse rounded-2xl border border-border bg-card" />)
          : products.map((product, index) => (
              <article key={product.id} className="group flex items-center gap-4 rounded-2xl border border-border bg-card p-4 transition-all duration-300 hover:border-primary/40 sm:gap-6">
                <span className="num w-7 shrink-0 text-2xl font-semibold text-muted-foreground/25 transition-colors group-hover:text-primary sm:w-10 sm:text-3xl">
                  {String(index + 1).padStart(2, "0")}
                </span>

                <Link to={`/product/${product.id}`} className="flex min-w-0 flex-1 items-center gap-4">
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-muted sm:h-20 sm:w-20">
                    <Image
                      src={product.image_url}
                      alt={`${product.name} — ${formatPrice(product.price)}`}
                      fittingType="fill"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-medium text-foreground sm:text-[15px]">{product.name}</h3>
                    <Stars rating={product.rating} reviewCount={product.review_count} className="mt-2" />
                    <p className="mt-2 flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground">
                      <Flame className="h-3.5 w-3.5 text-primary" />
                      {soldLabel(product.sales_count)} sold
                    </p>
                  </div>
                </Link>

                <div className="flex shrink-0 flex-col items-end gap-2">
                  <span className="num text-sm font-semibold text-foreground sm:text-base">{formatPrice(product.price)}</span>
                  <AddToCartButton product={product} />
                </div>
              </article>
            ))}
      </div>
    </Section>
  );
}
