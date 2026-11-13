import React from "react";
import ProductCard from "@/components/ProductCard";
import { cn } from "@/lib/utils";

function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-border bg-card p-3">
      <div className="aspect-square animate-pulse rounded-xl bg-muted" />
      <div className="mt-4 h-2.5 w-16 animate-pulse rounded-full bg-muted" />
      <div className="mt-3 h-3.5 w-full animate-pulse rounded-full bg-muted" />
      <div className="mt-2 h-3.5 w-2/3 animate-pulse rounded-full bg-muted" />
      <div className="mt-5 flex items-center justify-between">
        <div className="h-4 w-20 animate-pulse rounded-full bg-muted" />
        <div className="h-10 w-10 animate-pulse rounded-full bg-muted" />
      </div>
    </div>
  );
}

export default function ProductGrid({
  products = [],
  loading = false,
  skeletonCount = 8,
  columns = "grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
  className,
}) {
  const items = loading ? Array.from({ length: skeletonCount }) : products;

  return (
    <div className={cn("grid gap-4 sm:gap-5", columns, className)}>
      {loading ? items.map((_, index) => <SkeletonCard key={index} />) : items.map((product) => <ProductCard key={product.id} product={product} />)}
    </div>
  );
}
