import React from "react";
import { NavLink } from "react-router-dom";
import { Home, LayoutGrid, Play, Radio, ShoppingCart } from "lucide-react";
import { useCart } from "@/lib/CartContext";
import { cn } from "@/lib/utils";

const TABS = [
  { to: "/", label: "Home", icon: Home, end: true },
  { to: "/products", label: "Shop", icon: LayoutGrid, end: false },
  { to: "/videos", label: "Reels", icon: Play, end: false },
  { to: "/live", label: "Live", icon: Radio, end: false },
  { to: "/cart", label: "Cart", icon: ShoppingCart, end: false },
];

export default function BottomTabBar() {
  const { count } = useCart();

  return (
    <nav
      aria-label="Bottom navigation"
      className="safe-bottom fixed inset-x-0 bottom-0 z-[60] flex border-t border-border glass md:hidden"
    >
      {TABS.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            cn(
              "relative flex flex-1 flex-col items-center justify-center gap-1 py-2.5 text-[11px] font-medium transition-colors",
              isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
            )
          }
        >
          <span className="relative">
            <Icon className="h-5 w-5" strokeWidth={1.9} />
            {to === "/cart" && count > 0 && (
              <span className="num absolute -right-2.5 -top-1.5 grid h-4 min-w-[16px] place-items-center rounded-full bg-primary px-1 text-[9px] font-semibold text-primary-foreground">
                {count}
              </span>
            )}
          </span>
          {label}
        </NavLink>
      ))}
    </nav>
  );
}
