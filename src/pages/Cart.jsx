import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Info, ShieldCheck, ShoppingBag, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Image } from "@/components/ui/image";
import QuantityStepper from "@/components/QuantityStepper";
import { useCart } from "@/lib/CartContext";
import { formatPrice } from "@/lib/format";

export default function Cart() {
  const { items, count, subtotal, savings, shipping, total, setQuantity, removeItem, clearCart, freeShippingThreshold } = useCart();
  const [showNotice, setShowNotice] = useState(false);

  if (items.length === 0) {
    return (
      <div className="mx-auto flex w-full max-w-[1600px] flex-col items-center justify-center px-4 py-24 text-center sm:px-6 lg:px-10">
        <span className="grid h-16 w-16 place-items-center rounded-2xl bg-primary/15 text-primary">
          <ShoppingBag className="h-7 w-7" strokeWidth={1.8} />
        </span>
        <h1 className="mt-7 font-display text-3xl font-semibold tracking-[-0.03em] text-foreground">Your cart is empty</h1>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
          Add something from the marketplace and it will show up here — your cart is saved on this device, ready when you come back.
        </p>
        <Button asChild size="lg" className="mt-8 h-12 rounded-full bg-primary px-7 text-sm text-primary-foreground hover:bg-primary/90">
          <Link to="/products">
            Start shopping
            <ArrowRight className="ml-1.5 h-4 w-4" />
          </Link>
        </Button>
      </div>
    );
  }

  const remaining = Math.max(0, freeShippingThreshold - subtotal);
  const progress = Math.min(100, (subtotal / freeShippingThreshold) * 100);

  return (
    <div className="mx-auto w-full max-w-[1600px] px-4 py-10 sm:px-6 lg:px-10 lg:py-14">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-primary">Shopping cart</p>
          <h1 className="mt-3 font-display text-3xl font-semibold tracking-[-0.03em] text-foreground sm:text-4xl">
            {count} {count === 1 ? "item" : "items"} ready to go
          </h1>
        </div>
        <button type="button" onClick={clearCart} className="inline-flex items-center gap-2 text-xs text-muted-foreground transition-colors hover:text-destructive">
          <Trash2 className="h-3.5 w-3.5" /> Empty cart
        </button>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1.6fr_1fr] lg:gap-10">
        <div className="space-y-4">
          {items.map((item) => (
            <article key={item.id} className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-4 transition-colors hover:border-primary/30 sm:flex-row sm:items-center sm:gap-5">
              <Link to={`/product/${item.id}`} className="flex min-w-0 flex-1 items-center gap-4">
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-muted sm:h-24 sm:w-24">
                  <Image src={item.image_url} alt={item.name} fittingType="fill" className="h-full w-full object-cover" />
                </div>
                <div className="min-w-0">
                  <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{item.seller_name || "BAJAVERSE"}</span>
                  <h2 className="mt-1.5 line-clamp-2 text-sm font-medium text-foreground">{item.name}</h2>
                  <p className="num mt-2 text-xs text-muted-foreground">
                    {formatPrice(item.price)} each
                    {item.original_price > item.price && <span className="ml-2 line-through opacity-70">{formatPrice(item.original_price)}</span>}
                  </p>
                </div>
              </Link>

              <div className="flex items-center justify-between gap-4 sm:justify-end">
                <QuantityStepper compact value={item.quantity} onChange={(value) => setQuantity(item.id, value)} />
                <span className="num w-24 text-right text-sm font-semibold text-foreground">{formatPrice(item.price * item.quantity)}</span>
                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  aria-label={`Remove ${item.name} from cart`}
                  className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-border text-muted-foreground transition-colors hover:border-destructive/50 hover:text-destructive"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </article>
          ))}

          <Link to="/products" className="inline-flex items-center gap-2 text-sm text-primary transition-colors hover:text-primary/80">
            Continue shopping
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <aside className="h-fit rounded-3xl border border-border bg-card p-6 backdrop-blur lg:sticky lg:top-28">
          <h2 className="font-display text-lg font-semibold text-foreground">Order summary</h2>

          {remaining > 0 ? (
            <div className="mt-5 rounded-2xl border border-primary/20 bg-primary/10 p-4">
              <p className="text-xs text-foreground/85">
                Add <span className="num font-semibold text-primary">{formatPrice(remaining)}</span> more for free delivery
              </p>
              <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${progress}%` }} />
              </div>
            </div>
          ) : (
            <div className="mt-5 flex items-center gap-2.5 rounded-2xl border border-primary/20 bg-primary/10 p-4 text-xs text-foreground/85">
              <ShieldCheck className="h-4 w-4 shrink-0 text-primary" />
              Free tracked delivery unlocked
            </div>
          )}

          <dl className="mt-6 space-y-3.5 text-sm">
            <div className="flex items-center justify-between">
              <dt className="text-muted-foreground">Subtotal</dt>
              <dd className="num font-medium text-foreground">{formatPrice(subtotal)}</dd>
            </div>
            {savings > 0 && (
              <div className="flex items-center justify-between">
                <dt className="text-muted-foreground">Deal savings</dt>
                <dd className="num font-medium text-primary">−{formatPrice(savings)}</dd>
              </div>
            )}
            <div className="flex items-center justify-between">
              <dt className="text-muted-foreground">Delivery</dt>
              <dd className="num font-medium text-foreground">{shipping === 0 ? "Free" : formatPrice(shipping)}</dd>
            </div>
            <div className="flex items-center justify-between border-t border-border pt-4">
              <dt className="text-base font-medium text-foreground">Total</dt>
              <dd className="num text-xl font-semibold text-foreground">{formatPrice(total)}</dd>
            </div>
          </dl>

          <Button onClick={() => setShowNotice(true)} size="lg" className="mt-7 h-14 w-full rounded-full bg-primary text-sm font-medium text-primary-foreground hover:bg-primary/90">
            Proceed to checkout
          </Button>

          {showNotice && (
            <p className="mt-4 flex items-start gap-2.5 rounded-2xl border border-border bg-muted p-4 text-xs leading-relaxed text-muted-foreground">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
              Checkout opens soon — BAJAVERSE doesn&rsquo;t take payments yet. Your cart stays saved on this device in the meantime.
            </p>
          )}

          <p className="mt-5 text-center text-[11px] leading-relaxed text-muted-foreground">Verified sellers · 30-day returns · buyer protection on every order</p>
        </aside>
      </div>
    </div>
  );
}
