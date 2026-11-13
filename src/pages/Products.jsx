import React, { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProductGrid from "@/components/ProductGrid";
import SortControl from "@/components/SortControl";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 12;

const SORT_OPTIONS = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "rating", label: "Top rated" },
  { value: "newest", label: "Newest arrivals" },
];

const SORT_FIELD = {
  featured: "-rating",
  "price-asc": "price",
  "price-desc": "-price",
  rating: "-rating",
  newest: "-created_date",
};

export default function Products() {
  const [params, setParams] = useSearchParams();

  const category = params.get("category") || "all";
  const term = params.get("q") || "";
  const sale = params.get("sale") === "1";
  const best = params.get("best") === "1";
  const seller = params.get("seller") || "";
  const sortParam = params.get("sort");
  const sort = SORT_FIELD[sortParam] ? sortParam : "featured";

  const [draft, setDraft] = useState(term);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [cursor, setCursor] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    setDraft(term);
  }, [term]);

  useEffect(() => {
    let active = true;
    const load = async () => {
      const { items } = await base44.entities.Category.filter({}, { sort: "sort_order", limit: 12 });
      if (active) setCategories(items || []);
    };
    load();
    return () => {
      active = false;
    };
  }, []);

  const query = useMemo(() => {
    const q = { status: "active" };
    if (category !== "all") q.category_slug = category;
    if (term) q.name = { $regex: term, $options: "i" };
    if (sale) q.deal = true;
    if (best) q.best_seller = true;
    if (seller) q.seller_name = seller;
    return q;
  }, [category, term, sale, best, seller]);

  useEffect(() => {
    let active = true;
    setLoading(true);

    const load = async () => {
      const [page, totalCount] = await Promise.all([
        base44.entities.Product.filter(query, { sort: SORT_FIELD[sort], limit: PAGE_SIZE }),
        base44.entities.Product.count(query),
      ]);
      if (!active) return;
      setProducts(page.items || []);
      setCursor(page.next_cursor || null);
      setHasMore(Boolean(page.has_more));
      setTotal(totalCount || 0);
      setLoading(false);
    };

    load();
    return () => {
      active = false;
    };
  }, [query, sort]);

  const updateParams = (patch) => {
    const next = new URLSearchParams(params);
    Object.entries(patch).forEach(([key, value]) => {
      if (!value || value === "all" || value === "featured") next.delete(key);
      else next.set(key, value);
    });
    setParams(next);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    updateParams({ q: draft.trim() });
  };

  const loadMore = async () => {
    if (!cursor || loadingMore) return;
    setLoadingMore(true);
    const page = await base44.entities.Product.filter(query, {
      sort: SORT_FIELD[sort],
      limit: PAGE_SIZE,
      cursor,
    });
    setProducts((prev) => [...prev, ...(page.items || [])]);
    setCursor(page.next_cursor || null);
    setHasMore(Boolean(page.has_more));
    setLoadingMore(false);
  };

  const activeCategory = categories.find((c) => c.slug === category);
  const title = seller ? seller : best ? "Best sellers" : sale ? "Deals & discounts" : activeCategory ? activeCategory.name : "All products";
  const eyebrow = seller ? "Seller store" : best ? "Top ranked" : sale ? "Limited price drops" : activeCategory ? "Category" : "Marketplace";
  const hasFilters = Boolean(term || sale || best || seller) || category !== "all";

  return (
    <>
      <section className="relative overflow-hidden border-b border-border bg-muted/40">
        <div className="pointer-events-none absolute inset-0 grid-backdrop opacity-50" aria-hidden="true" />
        <div className="pointer-events-none absolute -top-40 right-1/4 h-80 w-80 rounded-full bg-primary/15 blur-[130px]" aria-hidden="true" />
        <div className="relative mx-auto w-full max-w-[1600px] px-4 py-10 sm:px-6 lg:px-10 lg:py-14">
          <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-primary">{eyebrow}</p>
          <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <h1 className="font-display text-3xl font-semibold tracking-[-0.03em] text-foreground sm:text-4xl lg:text-5xl">{title}</h1>
            <p className="text-sm text-muted-foreground">{loading ? "Loading products…" : `${total} ${total === 1 ? "product" : "products"} available`}</p>
          </div>

          <form onSubmit={handleSearch} className="mt-7 flex max-w-xl items-center gap-2">
            <div className="relative flex h-12 flex-1 items-center rounded-full border border-border bg-card pl-4 transition-all focus-within:border-primary/60 focus-within:shadow-[0_0_0_4px_rgba(109,40,217,0.12)]">
              <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
              <input
                type="search"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                aria-label="Search the BAJAVERSE Marketplace"
                placeholder="Search within BAJAVERSE"
                className="h-full flex-1 bg-transparent px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground/80"
              />
              {draft && (
                <button
                  type="button"
                  onClick={() => setDraft("")}
                  aria-label="Clear search"
                  className="mr-2 grid h-7 w-7 place-items-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-foreground"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
            <Button type="submit" className="h-12 rounded-full bg-primary px-6 text-sm text-primary-foreground hover:bg-primary/90">
              Search
            </Button>
          </form>

          <div className="no-scrollbar mt-6 flex items-center gap-2 overflow-x-auto pb-1">
            <Link
              to="/products"
              className={cn(
                "shrink-0 rounded-full border px-4 py-2 text-sm transition-colors",
                category === "all" && !sale && !best && !seller
                  ? "border-primary bg-primary/15 text-primary"
                  : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"
              )}
            >
              All
            </Link>
            {categories.map((c) => (
              <Link
                key={c.slug}
                to={`/products?category=${c.slug}`}
                className={cn(
                  "shrink-0 rounded-full border px-4 py-2 text-sm transition-colors",
                  category === c.slug
                    ? "border-primary bg-primary/15 text-primary"
                    : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"
                )}
              >
                {c.name}
              </Link>
            ))}
            <Link
              to="/products?sale=1"
              className={cn(
                "shrink-0 rounded-full border px-4 py-2 text-sm transition-colors",
                sale ? "border-primary bg-primary/15 text-primary" : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"
              )}
            >
              On sale
            </Link>
            <Link
              to="/products?best=1"
              className={cn(
                "shrink-0 rounded-full border px-4 py-2 text-sm transition-colors",
                best ? "border-primary bg-primary/15 text-primary" : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"
              )}
            >
              Best sellers
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-[1600px] px-4 py-10 sm:px-6 lg:px-10 lg:py-12">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="flex items-center gap-2 text-xs text-muted-foreground">
            <SlidersHorizontal className="h-3.5 w-3.5" />
            {loading ? "Fetching the latest listings…" : `Showing ${products.length} of ${total}`}
          </p>
          <div className="flex items-center gap-3">
            {hasFilters && (
              <Link to="/products" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-primary">
                <X className="h-3.5 w-3.5" /> Clear filters
              </Link>
            )}
            <SortControl value={sort} options={SORT_OPTIONS} onChange={(value) => updateParams({ sort: value })} placeholder="Sort" />
          </div>
        </div>

        <div className="mt-8">
          {loading ? (
            <ProductGrid loading skeletonCount={8} />
          ) : products.length > 0 ? (
            <>
              <ProductGrid products={products} />
              {hasMore && (
                <div className="mt-12 flex justify-center">
                  <Button onClick={loadMore} disabled={loadingMore} variant="outline" size="lg" className="h-12 rounded-full border-border bg-card px-8 text-sm text-foreground hover:bg-muted hover:text-foreground">
                    {loadingMore ? "Loading…" : "Load more products"}
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-3xl border border-border bg-card px-6 py-20 text-center">
              <span className="grid h-12 w-12 place-items-center rounded-full bg-primary/15 text-primary">
                <Search className="h-5 w-5" />
              </span>
              <h2 className="mt-5 font-display text-xl font-semibold text-foreground">No products match those filters</h2>
              <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                Try a different search term, or browse the full catalogue to see everything on BAJAVERSE.
              </p>
              <Button asChild className="mt-7 h-11 rounded-full bg-primary px-6 text-sm text-primary-foreground hover:bg-primary/90">
                <Link to="/products">Browse all products</Link>
              </Button>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
