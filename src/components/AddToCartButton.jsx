import React, { useState } from "react";
import { Check, Plus, ShoppingCart } from "lucide-react";
import { useCart } from "@/lib/CartContext";
import { cn } from "@/lib/utils";

export default function AddToCartButton({ product, quantity = 1, variant = "icon", label = "Add to cart", className }) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  const handleClick = () => {
    addItem(product, quantity);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1600);
  };

  if (variant === "icon") {
    return (
      <button
        type="button"
        onClick={handleClick}
        aria-label={added ? `${product.name} added to cart` : `Add ${product.name} to cart`}
        className={cn(
          "grid h-11 w-11 shrink-0 place-items-center rounded-full border transition-all duration-300",
          added
            ? "border-primary bg-primary text-primary-foreground"
            : "border-border bg-card text-foreground hover:border-primary/50 hover:bg-primary hover:text-primary-foreground",
          className
        )}
      >
        {added ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={label}
      className={cn(
        "inline-flex h-12 items-center justify-center gap-2 rounded-full px-7 text-sm font-medium transition-all duration-300",
        added ? "bg-foreground text-background" : "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90",
        className
      )}
    >
      {added ? (
        <>
          <Check className="h-4 w-4" /> Added to cart
        </>
      ) : (
        <>
          <ShoppingCart className="h-4 w-4" /> {label}
        </>
      )}
    </button>
  );
}
