import React from "react";
import { Link } from "react-router-dom";
import { Image } from "@/components/ui/image";
import Stars from "@/components/Stars";
import AddToCartButton from "@/components/AddToCartButton";
import { discountPercent, formatPrice } from "@/lib/format";

export default function ProductCard({ product }) {
  const off = discountPercent(product);

  return (
    <article className="group flex h-full flex-col rounded-2xl border border-border bg-card p-3 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-[0_24px_50px_-30px_rgba(109,40,217,0.35)]">
      <Link to={`/product/${product.id}`} className="flex flex-1 flex-col outline-none">
        <div className="relative aspect-square overflow-hidden rounded-xl bg-muted">
          <Image
            src={product.image_url}
            alt={`${product.name} — ${formatPrice(product.price)} — rated ${Number(product.rating || 0).toFixed(1)} stars`}
            fittingType="fill"
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.07]"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-foreground/5 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
          {off > 0 ? (
            <span className="num absolute left-3 top-3 rounded-full bg-primary px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-primary-foreground">
              -{off}%
            </span>
          ) : (
            product.badge && (
              <span className="absolute left-3 top-3 rounded-full border border-primary/30 bg-card/90 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-primary backdrop-blur">
                {product.badge}
              </span>
            )
          )}
        </div>

        <div className="mt-3.5 flex flex-1 flex-col px-1">
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            {product.seller_name || "BAJAVERSE"}
          </span>
          <h3 className="mt-1.5 line-clamp-2 text-sm font-medium leading-snug text-foreground">{product.name}</h3>
          <div className="mt-2.5">
            <Stars rating={product.rating} reviewCount={product.review_count} />
          </div>
        </div>
      </Link>

      <div className="mt-4 flex items-end justify-between gap-3 px-1 pb-0.5">
        <div>
          <p className="num text-base font-semibold leading-none text-foreground">{formatPrice(product.price)}</p>
          {product.original_price > product.price && (
            <p className="num mt-1.5 text-xs leading-none text-muted-foreground line-through">
              {formatPrice(product.original_price)}
            </p>
          )}
        </div>
        <AddToCartButton product={product} />
      </div>
    </article>
  );
}
