import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, LogOut, Menu, ShoppingCart, Store, Trash2, User, Wallet } from "lucide-react";
import Logo from "@/components/Logo";
import SearchBar from "@/components/SearchBar";
import { useCart } from "@/lib/CartContext";
import { useAuth } from "@/lib/AuthContext";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const NAV = [
  { label: "Home", to: "/" },
  { label: "Shop", to: "/products" },
  { label: "Reels", to: "/videos" },
  { label: "Live", to: "/live" },
  { label: "Deals", to: "/products?sale=1" },
  { label: "Best Sellers", to: "/products?best=1" },
  { label: "Sellers", to: "/seller" },
  { label: "About", to: "/about" },
];

export default function Header() {
  const { count } = useCart();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const go = (term) => navigate(term ? `/products?q=${encodeURIComponent(term)}` : "/products");
  const showBack = location.pathname !== "/";

  const handleSignOut = () => {
    setMenuOpen(false);
    setOpen(false);
    base44.auth.logout("/");
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    setDeleteError("");
    try {
      await base44.functions.invoke("deleteAccount", {});
      setDeleteOpen(false);
      setMenuOpen(false);
      setOpen(false);
      base44.auth.logout("/");
    } catch {
      setDeleteError("We couldn't delete your account right now. Please try again.");
      setDeleting(false);
    }
  };

  const requestDelete = () => {
    setMenuOpen(false);
    setOpen(false);
    setDeleteOpen(true);
  };

  return (
    <header className="safe-top sticky top-0 z-50 border-b border-border glass">
      <div className="mx-auto w-full max-w-[1600px] px-4 sm:px-6 lg:px-10">
        <div className="flex h-16 items-center gap-3 lg:h-20 lg:gap-7">
          {showBack && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => (window.history.length > 1 ? navigate(-1) : navigate("/"))}
              aria-label="Go back to the previous screen"
              className="h-11 w-11 shrink-0 rounded-xl text-foreground hover:bg-muted"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-11 w-11 shrink-0 rounded-xl text-foreground hover:bg-muted lg:hidden"
                aria-label="Open navigation menu"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] border-border bg-card p-6">
              <SheetTitle className="sr-only">BAJAVERSE navigation</SheetTitle>
              <Logo onNavigate={() => setOpen(false)} />
              <nav className="mt-8 flex flex-col gap-1" aria-label="Mobile">
                {NAV.map((item) => (
                  <Link
                    key={item.label}
                    to={item.to}
                    onClick={() => setOpen(false)}
                    className="rounded-xl px-3 py-3 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
              <div className="mt-7 flex flex-col gap-3 border-t border-border pt-6">
                {isAuthenticated ? (
                  <>
                    <div className="px-1">
                      <p className="text-sm font-medium text-foreground">{user?.full_name || "BAJAVERSE member"}</p>
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">{user?.email}</p>
                    </div>
                    <Button asChild variant="outline" className="h-11 rounded-full border-border bg-card text-foreground hover:bg-muted">
                      <Link to="/wallet" onClick={() => setOpen(false)}>
                        Wallet
                      </Link>
                    </Button>
                    <Button onClick={handleSignOut} className="h-11 rounded-full bg-primary text-primary-foreground hover:bg-primary/90">
                      Sign out
                    </Button>
                    <Button
                      onClick={requestDelete}
                      variant="outline"
                      className="h-11 rounded-full border-destructive/40 bg-card text-destructive hover:bg-destructive/10 hover:text-destructive"
                    >
                      Delete account
                    </Button>
                  </>
                ) : (
                  <>
                    <Button asChild className="h-11 rounded-full bg-primary text-primary-foreground hover:bg-primary/90">
                      <Link to="/login" onClick={() => setOpen(false)}>
                        Sign in
                      </Link>
                    </Button>
                    <Button
                      asChild
                      variant="outline"
                      className="h-11 rounded-full border-border bg-card text-foreground hover:bg-muted hover:text-foreground"
                    >
                      <Link to="/register" onClick={() => setOpen(false)}>
                        Create account
                      </Link>
                    </Button>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>

          <Logo />

          <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
            {NAV.map((item) => (
              <Link
                key={item.label}
                to={item.to}
                className="rounded-full px-3.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="ml-auto hidden max-w-md flex-1 lg:block">
            <SearchBar onSubmit={go} placeholder="Search products" />
          </div>

          <div className="ml-auto flex items-center gap-1.5 lg:ml-0">
            <Link
              to="/seller"
              className="hidden h-11 items-center gap-2 rounded-full px-3.5 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground sm:inline-flex"
            >
              <Store className="h-4 w-4" />
              <span className="hidden xl:inline">Sell</span>
            </Link>

            {isAuthenticated ? (
              <Popover open={menuOpen} onOpenChange={setMenuOpen}>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    aria-label="Account menu"
                    className="inline-flex h-11 items-center gap-2 rounded-full border border-border bg-card px-3 text-sm font-medium text-foreground transition hover:border-primary/50 hover:bg-accent"
                  >
                    <span className="grid h-7 w-7 place-items-center rounded-full bg-accent text-primary">
                      <User className="h-4 w-4" />
                    </span>
                    <span className="hidden max-w-[120px] truncate sm:inline">
                      {user?.full_name || user?.email || "Account"}
                    </span>
                  </button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-72 border-border bg-popover p-0">
                  <div className="border-b border-border p-4">
                    <p className="text-sm font-medium text-foreground">{user?.full_name || "BAJAVERSE member"}</p>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">{user?.email}</p>
                  </div>
                  <div className="p-2">
                    <Link
                      to="/wallet"
                      onClick={() => setMenuOpen(false)}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-foreground transition hover:bg-muted"
                    >
                      <Wallet className="h-4 w-4" /> Wallet
                    </Link>
                    <button
                      type="button"
                      onClick={handleSignOut}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-foreground transition hover:bg-muted"
                    >
                      <LogOut className="h-4 w-4" /> Sign out
                    </button>
                    <button
                      type="button"
                      onClick={requestDelete}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-destructive transition hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" /> Delete account
                    </button>
                  </div>
                </PopoverContent>
              </Popover>
            ) : (
              <Link
                to="/login"
                aria-label="Sign in to your account"
                className="inline-flex h-11 items-center gap-2 rounded-full px-3 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground sm:px-3.5"
              >
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Sign in</span>
              </Link>
            )}

            <Link
              to="/cart"
              aria-label={`Shopping cart, ${count} items`}
              className="relative grid h-11 w-11 place-items-center rounded-full border border-border bg-card text-foreground transition hover:border-primary/50 hover:bg-accent"
            >
              <ShoppingCart className="h-4 w-4" />
              {count > 0 && (
                <span className="num absolute -right-1 -top-1 grid h-5 min-w-[20px] place-items-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
                  {count}
                </span>
              )}
            </Link>
          </div>
        </div>
        <div className="pb-3 lg:hidden">
          <SearchBar onSubmit={go} placeholder="Search products" />
        </div>
      </div>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent className="border-border bg-card">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display text-lg text-foreground">Delete your account?</AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-muted-foreground">
              This permanently removes your BAJAVERSE profile and any listings you&apos;ve published. This action can&apos;t be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {deleteError && (
            <p className="rounded-2xl border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive">
              {deleteError}
            </p>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={deleting}
              className="rounded-full border-border bg-card text-foreground hover:bg-muted hover:text-foreground"
            >
              Keep account
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDeleteAccount();
              }}
              disabled={deleting}
              className="rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? "Deleting…" : "Delete account"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </header>
  );
}
