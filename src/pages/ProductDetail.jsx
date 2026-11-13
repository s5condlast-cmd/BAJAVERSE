import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { BadgeCheck, ChevronRight, Flame, PackageCheck, RotateCcw, ShieldCheck, Store, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Image } from "@/components/ui/image";
import QuantityStepper from "@/components/QuantityStepper";
import AddToCartButton from "@/components/AddToCartButton";
import ProductGrid from "@/components/ProductGrid";
import Section from "@/components/Section";
import Stars from "@/components/Stars";
import { useCart } from "@/lib/CartContext";
import { discountPercent, formatPrice, soldLabel } from "@/lib/format";

const DELIVERY_POINTS = [
  { Icon: Truck, label: "Free tracked delivery on orders over ₱2,000" },
  { Icon: RotateCcw, label: "30-day returns, collection arranged for you" },
  { Icon: ShieldCheck, label: "Buyer protection on every BAJAVERSE order" },
];

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setNotFound(false);
    setQuantity(1);

    const load = async () => {
      try {
        const item = await base44.entities.Product.get(id);
        if (!active) return;
        setProduct(item);
        const relatedPage = await base44.entities.Product.filter({ status: "active", category_slug: item.category_slug }, { sort: "-rating", limit: 6 });
        if (!active) return;
        setRelated((relatedPage.items || []).filter((entry) => entry.id !== item.id).slice(0, 4));
      } catch {
        if (active) setNotFound(true);
      } finally {
        if (active) setLoading(false);
      }
    };

    load();
    return () => {
      active = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-[1600px] px-4 py-12 sm:px-6 lg:px-10">
        <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="aspect-square animate-pulse rounded-3xl border border-border bg-card" />
          <div className="space-y-4">
            <div className="h-3 w-24 animate-pulse rounded-full bg-muted" />
            <div className="h-9 w-3/4 animate-pulse rounded-full bg-muted" />
            <div className="h-4 w-40 animate-pulse rounded-full bg-muted" />
            <div className="h-10 w-32 animate-pulse rounded-full bg-muted" />
            <div className="h-24 w-full animate-pulse rounded-2xl bg-muted" />
            <div className="h-12 w-full animate-pulse rounded-full bg-muted" />
          </div>
        </div>
      </div>
    );
  }

  if (notFound || !product) {
    return (
      <div className="mx-auto flex w-full max-w-[1600px] flex-col items-center justify-center px-4 py-24 text-center sm:px-6 lg:px-10">
        <h1 className="font-display text-3xl font-semibold text-foreground">This product is no longer listed</h1>
        <p className="mt-3 max-w-md text-sm text-muted-foreground">
          The listing may have sold out or been removed by the seller. Browse the marketplace to find something similar.
        </p>
        <Button asChild className="mt-8 h-12 rounded-full bg-primary px-7 text-sm text-primary-foreground hover:bg-primary/90">
          <Link to="/products">Back to all products</Link>
        </Button>
      </div>
    );
  }

  const off = discountPercent(product);
  const inStock = Number(product.stock) > 0 || product.stock === undefined;

  return (
    <>
      <nav aria-label="Breadcrumb" className="mx-auto flex w-full max-w-[1600px] items-center gap-2 px-4 py-6 text-xs text-muted-foreground sm:px-6 lg:px-10">
        <Link to="/" className="transition-colors hover:text-primary">
          Home
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link to={`/products?category=${product.category_slug}`} className="transition-colors hover:text-primary">
          {product.category}
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="truncate text-foreground/80">{product.name}</span>
      </nav>

      <div className="mx-auto grid w-full max-w-[1600px] gap-10 px-4 pb-6 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14 lg:px-10">
        <div>
          <div className="relative overflow-hidden rounded-3xl border border-border bg-muted p-2">
            <Image
              src={product.image_url}
              alt={`${product.name} — ${formatPrice(product.price)} — rated ${Number(product.rating || 0).toFixed(1)} stars`}
              fittingType="fill"
              className="aspect-square w-full rounded-[20px] object-cover"
            />
            {off > 0 && (
              <span className="num absolute left-5 top-5 rounded-full bg-primary px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-primary-foreground">
                Save {off}%
              </span>
            )}
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {DELIVERY_POINTS.map(({ Icon, label }) => (
              <div key={label} className="flex items-start gap-3 rounded-2xl border border-border bg-card p-4">
                <Icon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span className="text-[11px] leading-relaxed text-muted-foreground">{label}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <Link to={`/products?category=${product.category_slug}`} className="font-mono text-[11px] uppercase tracking-[0.28em] text-primary transition-colors hover:text-primary/80">
            {product.category}
          </Link>
          <h1 className="mt-3 font-display text-3xl font-semibold leading-tight tracking-[-0.03em] text-foreground sm:text-4xl">{product.name}</h1>

          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2">
            <Stars rating={product.rating} reviewCount={product.review_count} size={15} />
            <span className="flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground">
              <Flame className="h-3.5 w-3.5 text-primary" />
              {soldLabel(product.sales_count)} sold
            </span>
            {product.badge && (
              <span className="rounded-full border border-primary/40 bg-primary/10 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-primary">
                {product.badge}
              </span>
            )}
          </div>

          <div className="mt-7 flex flex-wrap items-end gap-4">
            <span className="num text-4xl font-semibold leading-none text-foreground">{formatPrice(product.price)}</span>
            {product.original_price > product.price && (
              <>
                <span className="num text-lg leading-none text-muted-foreground line-through">{formatPrice(product.original_price)}</span>
                <span className="num rounded-full bg-primary/15 px-3 py-1 text-xs font-medium text-primary">
                  You save {formatPrice(product.original_price - product.price)}
                </span>
              </>
            )}
          </div>

          <p className="mt-7 text-sm leading-relaxed text-muted-foreground">{product.description}</p>

          {Array.isArray(product.highlights) && product.highlights.length > 0 && (
            <ul className="mt-6 space-y-2.5">
              {product.highlights.map((highlight) => (
                <li key={highlight} className="flex items-start gap-3 text-sm text-foreground/85">
                  <PackageCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  {highlight}
                </li>
              ))}
            </ul>
          )}

          <div className="mt-8 flex flex-col gap-4 rounded-3xl border border-border bg-card p-5 backdrop-blur sm:p-6">
            <div className="flex flex-wrap items-center gap-3">
              <QuantityStepper value={quantity} onChange={setQuantity} max={Math.max(1, Math.min(99, Number(product.stock) || 99))} />
              <AddToCartButton product={product} quantity={quantity} variant="full" className="flex-1" />
              <Button
                onClick={() => {
                  addItem(product, quantity);
                  navigate("/cart");
                }}
                variant="outline"
                className="h-12 rounded-full border-border bg-muted px-7 text-sm text-foreground hover:bg-muted hover:text-foreground"
              >
                Buy now
              </Button>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4 text-xs">
              <span className={inStock ? "text-muted-foreground" : "text-destructive"}>
                {inStock ? `In stock — ${Number(product.stock) || "plenty of"} units ready to ship` : "Currently out of stock"}
              </span>
              <span className="text-muted-foreground">Free delivery over ₱2,000 · 30-day returns</span>
            </div>
          </div>

          <div className="mt-6 flex items-center gap-4 rounded-2xl border border-border bg-card p-5">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary/15 text-primary">
              <Store className="h-5 w-5" strokeWidth={1.8} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-2 text-sm font-medium text-foreground">
                {product.seller_name || "BAJAVERSE"}
                <BadgeCheck className="h-4 w-4 text-primary" />
              </p>
              <p className="mt-1 text-xs text-muted-foreground">Verified seller · 98% positive feedback · ships in 24h</p>
            </div>
            <Button asChild variant="ghost" className="hidden rounded-full text-sm text-primary hover:bg-primary/10 hover:text-primary sm:inline-flex">
              <Link to={`/products?seller=${encodeURIComponent(product.seller_name || "")}`}>Visit store</Link>
            </Button>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <Section className="mt-8 border-t border-border">
          <h2 className="font-display text-2xl font-semibold tracking-[-0.03em] text-foreground sm:text-3xl">More in {product.category}</h2>
          <ProductGrid products={related} columns="grid-cols-2 lg:grid-cols-4" className="mt-8" />
        </Section>
      )}
    </>
  );
}
