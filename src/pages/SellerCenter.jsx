import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Boxes, ImagePlus, Loader2, PackagePlus, Star, TrendingUp, Trash2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Image } from "@/components/ui/image";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Section from "@/components/Section";
import { formatPrice, soldLabel } from "@/lib/format";

const EMPTY_FORM = {
  name: "",
  categorySlug: "",
  price: "",
  comparePrice: "",
  stock: "",
  storeName: "",
  description: "",
};

function StatCard({ Icon, label, value }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 transition-colors duration-300 hover:border-primary/40">
      <span className="grid h-10 w-10 place-items-center rounded-xl bg-accent text-primary">
        <Icon className="h-5 w-5" strokeWidth={1.8} />
      </span>
      <p className="num mt-4 text-2xl font-semibold text-foreground">{value}</p>
      <p className="mt-1.5 text-[11px] uppercase tracking-[0.16em] text-muted-foreground">{label}</p>
    </div>
  );
}

export default function SellerCenter() {
  const [listings, setListings] = useState([]);
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState({ rows: [] });
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [pendingDelete, setPendingDelete] = useState(null);

  const loadListings = async () => {
    const { items } = await base44.entities.Product.filter({}, { sort: "-created_date", limit: 50 });
    setListings(items || []);
  };

  const loadStats = async () => {
    const result = await base44.entities.Product.aggregate({
      query: { status: "active" },
      groupBy: "category_slug",
      sum: ["sales_count", "stock"],
      avg: ["rating"],
    });
    setStats(result || { rows: [] });
  };

  useEffect(() => {
    let active = true;
    const load = async () => {
      const [categoryPage] = await Promise.all([
        base44.entities.Category.filter({}, { sort: "sort_order", limit: 12 }),
        loadListings(),
        loadStats(),
      ]);
      if (!active) return;
      setCategories(categoryPage.items || []);
      setLoading(false);
    };
    load();
    return () => {
      active = false;
    };
  }, []);

  const totals = useMemo(() => {
    const rows = stats.rows || [];
    const listingsCount = rows.reduce((sum, row) => sum + (row.count || 0), 0);
    const sold = rows.reduce((sum, row) => sum + (row.sum_sales_count || 0), 0);
    const stock = rows.reduce((sum, row) => sum + (row.sum_stock || 0), 0);
    const weighted = rows.reduce((sum, row) => sum + (row.avg_rating || 0) * (row.count || 0), 0);
    const maxSold = Math.max(1, ...rows.map((row) => row.sum_sales_count || 0));
    return {
      rows: [...rows].sort((a, b) => (b.sum_sales_count || 0) - (a.sum_sales_count || 0)),
      listingsCount,
      sold,
      stock,
      avgRating: listingsCount ? weighted / listingsCount : 0,
      maxSold,
    };
  }, [stats]);

  const categoryName = (slug) => categories.find((c) => c.slug === slug)?.name || slug;

  const handleFile = (event) => {
    const selected = event.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
  };

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setFile(null);
    setPreview(null);
    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const category = categories.find((c) => c.slug === form.categorySlug);

    if (!form.name.trim() || !category || !form.price || !file) {
      setError("Add a product name, category, price and photo before publishing.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const { file_url } = await base44.integrations.Core.UploadPublicFile({ file });
      const price = Number(form.price);
      const compare = Number(form.comparePrice);
      const hasDiscount = Number.isFinite(compare) && compare > price;

      await base44.entities.Product.create({
        name: form.name.trim(),
        description:
          form.description.trim() ||
          `${form.name.trim()} — listed on BAJAVERSE by a verified seller. Ships within 24 hours with tracked delivery.`,
        category: category.name,
        category_slug: category.slug,
        price,
        original_price: hasDiscount ? compare : null,
        discount_percent: hasDiscount ? Math.round(((compare - price) / compare) * 100) : 0,
        image_url: file_url,
        rating: 0,
        review_count: 0,
        sales_count: 0,
        stock: Number(form.stock) || 10,
        seller_name: form.storeName.trim() || "BAJAVERSE Seller",
        badge: "New",
        featured: false,
        best_seller: false,
        deal: hasDiscount,
        status: "active",
      });

      setSuccess(`“${form.name.trim()}” is now live on BAJAVERSE.`);
      setOpen(false);
      resetForm();
      await Promise.all([loadListings(), loadStats()]);
    } catch {
      setError("Something went wrong while publishing your listing. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    const target = pendingDelete;
    setPendingDelete(null);
    await base44.entities.Product.delete(target.id);
    setSuccess(`“${target.name}” was removed from your listings.`);
    await Promise.all([loadListings(), loadStats()]);
  };

  return (
    <div>
      <section className="relative overflow-hidden border-b border-border">
        <div className="pointer-events-none absolute inset-0 grid-backdrop opacity-50" aria-hidden="true" />
        <div className="pointer-events-none absolute -top-40 left-1/3 h-80 w-80 rounded-full bg-primary/10 blur-[130px]" aria-hidden="true" />
        <div className="relative mx-auto flex w-full max-w-[1600px] flex-col gap-6 px-4 py-12 sm:px-6 lg:flex-row lg:items-end lg:justify-between lg:px-10 lg:py-16">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-primary">Seller Center</p>
            <h1 className="mt-3 max-w-2xl font-display text-3xl font-semibold tracking-[-0.03em] text-foreground sm:text-4xl lg:text-5xl">
              Your store, your numbers, your catalogue
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground">
              Publish a listing in under two minutes, track how it performs and keep your inventory in one place. No monthly fee — BAJAVERSE only takes commission when you sell.
            </p>
          </div>

          <Dialog
            open={open}
            onOpenChange={(next) => {
              setOpen(next);
              if (!next) resetForm();
            }}
          >
            <DialogTrigger asChild>
              <Button size="lg" className="h-12 shrink-0 rounded-full bg-primary px-7 text-sm font-medium text-primary-foreground hover:bg-primary/90">
                <PackagePlus className="mr-1.5 h-4 w-4" />
                List a new product
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto border-border bg-card sm:max-w-2xl">
              <DialogHeader>
                <DialogTitle className="font-display text-xl text-foreground">List a new product</DialogTitle>
                <DialogDescription className="text-sm text-muted-foreground">
                  Your listing goes live immediately and appears across the marketplace, categories and search.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="mt-2 space-y-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <Label htmlFor="product-name" className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                      Product name
                    </Label>
                    <Input
                      id="product-name"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Aura Pro Wireless Headphones"
                      className="mt-2 h-11 border-border bg-muted text-foreground"
                    />
                  </div>

                  <div>
                    <Label className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Category</Label>
                    <Select value={form.categorySlug} onValueChange={(value) => setForm({ ...form, categorySlug: value })}>
                      <SelectTrigger className="mt-2 h-11 border-border bg-muted text-foreground">
                        <SelectValue placeholder="Choose a category" />
                      </SelectTrigger>
                      <SelectContent className="border-border bg-popover">
                        {categories.map((category) => (
                          <SelectItem key={category.slug} value={category.slug}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="store-name" className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                      Store name
                    </Label>
                    <Input
                      id="store-name"
                      value={form.storeName}
                      onChange={(e) => setForm({ ...form, storeName: e.target.value })}
                      placeholder="Your store"
                      className="mt-2 h-11 border-border bg-muted text-foreground"
                    />
                  </div>

                  <div>
                    <Label htmlFor="price" className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                      Price (PHP)
                    </Label>
                    <Input
                      id="price"
                      type="number"
                      min="1"
                      step="0.01"
                      value={form.price}
                      onChange={(e) => setForm({ ...form, price: e.target.value })}
                      placeholder="199"
                      className="mt-2 h-11 border-border bg-muted text-foreground"
                    />
                  </div>

                  <div>
                    <Label htmlFor="compare" className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                      Compare-at price
                    </Label>
                    <Input
                      id="compare"
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.comparePrice}
                      onChange={(e) => setForm({ ...form, comparePrice: e.target.value })}
                      placeholder="Optional — starts a deal"
                      className="mt-2 h-11 border-border bg-muted text-foreground"
                    />
                  </div>

                  <div>
                    <Label htmlFor="stock" className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                      Units in stock
                    </Label>
                    <Input
                      id="stock"
                      type="number"
                      min="1"
                      value={form.stock}
                      onChange={(e) => setForm({ ...form, stock: e.target.value })}
                      placeholder="25"
                      className="mt-2 h-11 border-border bg-muted text-foreground"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <Label htmlFor="description" className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                      Description
                    </Label>
                    <Textarea
                      id="description"
                      rows={3}
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      placeholder="What makes this product worth buying?"
                      className="mt-2 border-border bg-muted text-foreground"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <Label className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Product photo</Label>
                    <label
                      htmlFor="product-photo"
                      className="mt-2 flex cursor-pointer items-center gap-4 rounded-2xl border border-dashed border-border bg-muted/40 p-4 transition-colors hover:border-primary/50"
                    >
                      {preview ? (
                        <Image src={preview} alt="Product photo preview" className="h-16 w-16 rounded-xl object-cover" />
                      ) : (
                        <span className="grid h-16 w-16 place-items-center rounded-xl bg-accent text-primary">
                          <ImagePlus className="h-5 w-5" />
                        </span>
                      )}
                      <span className="text-sm text-muted-foreground">{file ? file.name : "Upload a square photo — JPG or PNG"}</span>
                    </label>
                    <input id="product-photo" type="file" accept="image/*" onChange={handleFile} className="sr-only" />
                  </div>
                </div>

                {error && <p className="rounded-2xl border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive">{error}</p>}

                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                  <Button type="button" variant="outline" onClick={() => setOpen(false)} className="h-11 rounded-full border-border bg-muted text-foreground hover:bg-muted hover:text-foreground">
                    Cancel
                  </Button>
                  <Button type="submit" disabled={submitting} className="h-11 rounded-full bg-primary px-6 text-primary-foreground hover:bg-primary/90">
                    {submitting ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : null}
                    {submitting ? "Publishing…" : "Publish listing"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </section>

      <Section className="py-10 sm:py-12 lg:py-14">
        {success && (
          <div className="mb-8 flex items-center gap-3 rounded-2xl border border-primary/30 bg-primary/10 p-4 text-sm text-foreground">
            <Check className="h-4 w-4 shrink-0 text-primary" />
            {success}
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard Icon={Boxes} label="Active listings" value={loading ? "—" : totals.listingsCount} />
          <StatCard Icon={TrendingUp} label="Units sold" value={loading ? "—" : soldLabel(totals.sold)} />
          <StatCard Icon={PackagePlus} label="Units in stock" value={loading ? "—" : soldLabel(totals.stock)} />
          <StatCard Icon={Star} label="Average rating" value={loading ? "—" : totals.avgRating.toFixed(1)} />
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-3xl border border-border bg-card p-6">
            <h2 className="font-display text-lg font-semibold text-foreground">Units sold by category</h2>
            <p className="mt-1.5 text-xs text-muted-foreground">Live across the whole BAJAVERSE marketplace</p>
            <ul className="mt-6 space-y-4">
              {totals.rows.map((row) => (
                <li key={row.category_slug}>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-foreground/85">{categoryName(row.category_slug)}</span>
                    <span className="num text-muted-foreground">{soldLabel(row.sum_sales_count || 0)}</span>
                  </div>
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${Math.max(4, ((row.sum_sales_count || 0) / totals.maxSold) * 100)}%` }} />
                  </div>
                </li>
              ))}
              {!loading && totals.rows.length === 0 && <li className="text-sm text-muted-foreground">No sales data yet.</li>}
            </ul>
          </div>

          <div className="rounded-3xl border border-border bg-card p-6">
            <h2 className="font-display text-lg font-semibold text-foreground">Seller checklist</h2>
            <p className="mt-1.5 text-xs text-muted-foreground">Everything a new listing needs to rank well</p>
            <ul className="mt-6 space-y-3.5 text-sm text-foreground/85">
              <li className="flex items-start gap-3">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" /> Square photo on a clean, dark background
              </li>
              <li className="flex items-start gap-3">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" /> Honest compare-at price to qualify for Deals
              </li>
              <li className="flex items-start gap-3">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" /> At least three spec highlights in the description
              </li>
              <li className="flex items-start gap-3">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" /> Dispatch within 24 hours to keep seller score high
              </li>
            </ul>
            <Button asChild variant="outline" className="mt-7 h-11 w-full rounded-full border-border bg-muted text-foreground hover:bg-muted hover:text-foreground">
              <Link to="/products">See how listings appear</Link>
            </Button>
          </div>
        </div>

        <div className="mt-8 rounded-3xl border border-border bg-card p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-display text-lg font-semibold text-foreground">Your listings</h2>
            <span className="text-xs text-muted-foreground">Latest {listings.length} products</span>
          </div>

          <div className="mt-5 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-muted-foreground">Product</TableHead>
                  <TableHead className="text-muted-foreground">Category</TableHead>
                  <TableHead className="text-muted-foreground">Price</TableHead>
                  <TableHead className="text-muted-foreground">Stock</TableHead>
                  <TableHead className="text-muted-foreground">Sold</TableHead>
                  <TableHead className="text-right text-muted-foreground">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading
                  ? Array.from({ length: 4 }).map((_, index) => (
                      <TableRow key={index} className="border-border">
                        <TableCell colSpan={6}>
                          <div className="h-6 animate-pulse rounded-full bg-muted" />
                        </TableCell>
                      </TableRow>
                    ))
                  : listings.map((product) => (
                      <TableRow key={product.id} className="border-border">
                        <TableCell>
                          <div className="flex min-w-[220px] items-center gap-3">
                            <div className="h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-muted">
                              <Image src={product.image_url} alt={product.name} fittingType="fill" className="h-full w-full object-cover" />
                            </div>
                            <Link to={`/product/${product.id}`} className="line-clamp-1 text-sm text-foreground transition-colors hover:text-primary">
                              {product.name}
                            </Link>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">{product.category}</TableCell>
                        <TableCell className="num text-sm text-foreground">{formatPrice(product.price)}</TableCell>
                        <TableCell className="num text-sm text-muted-foreground">{product.stock ?? "—"}</TableCell>
                        <TableCell className="num text-sm text-muted-foreground">{soldLabel(product.sales_count)}</TableCell>
                        <TableCell className="text-right">
                          <button
                            type="button"
                            onClick={() => setPendingDelete(product)}
                            aria-label={`Remove ${product.name}`}
                            className="grid h-11 w-11 place-items-center rounded-full border border-border text-muted-foreground transition-colors hover:border-destructive/50 hover:text-destructive"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </TableCell>
                      </TableRow>
                    ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </Section>

      <AlertDialog open={Boolean(pendingDelete)} onOpenChange={(next) => !next && setPendingDelete(null)}>
        <AlertDialogContent className="border-border bg-card">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display text-lg text-foreground">Remove this listing?</AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-muted-foreground">
              {pendingDelete?.name} will disappear from the marketplace immediately. This can&rsquo;t be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full border-border bg-muted text-foreground hover:bg-muted hover:text-foreground">Keep listing</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Remove listing
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
