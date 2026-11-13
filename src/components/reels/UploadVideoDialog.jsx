import React, { useState } from "react";
import { Loader2, UploadCloud } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function UploadVideoDialog({ open, onOpenChange, products, onUploaded }) {
  const [form, setForm] = useState({ productId: "", title: "", caption: "" });
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const reset = () => {
    setForm({ productId: "", title: "", caption: "" });
    setFile(null);
    setError("");
  };

  const submit = async (e) => {
    e.preventDefault();
    const product = products.find((p) => p.id === form.productId);
    if (!product || !file || !form.title.trim()) {
      setError("Choose a product, add a title and pick a video file.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const { file_url } = await base44.integrations.Core.UploadPublicFile({ file });
      await base44.entities.ProductVideo.create({
        title: form.title.trim(),
        caption: form.caption.trim(),
        video_url: file_url,
        product_id: product.id,
        product_name: product.name,
        product_price: Number(product.price) || 0,
        product_image: product.image_url,
        seller_name: product.seller_name || "BAJAVERSE Seller",
        category: product.category,
        category_slug: product.category_slug,
        views: 0,
        likes: 0,
        status: "active",
      });
      onUploaded?.();
      onOpenChange(false);
      reset();
    } catch {
      setError("Could not upload your video. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(n) => { onOpenChange(n); if (!n) reset(); }}>
      <DialogContent className="max-h-[90vh] overflow-y-auto border-border bg-card sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-xl text-foreground">Post a product reel</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Upload a short clip. Buyers can tap straight through to the product from your reel.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="mt-2 space-y-4">
          <div>
            <Label className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Product</Label>
            <Select value={form.productId} onValueChange={(v) => setForm({ ...form, productId: v })}>
              <SelectTrigger className="mt-2 h-11 border-border bg-muted text-foreground">
                <SelectValue placeholder="Choose a listing" />
              </SelectTrigger>
              <SelectContent className="border-border bg-popover">
                {products.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="reel-title" className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
              Title
            </Label>
            <Input
              id="reel-title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Quick unboxing demo"
              className="mt-2 h-11 border-border bg-muted text-foreground"
            />
          </div>
          <div>
            <Label htmlFor="reel-caption" className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
              Caption
            </Label>
            <Textarea
              id="reel-caption"
              rows={2}
              value={form.caption}
              onChange={(e) => setForm({ ...form, caption: e.target.value })}
              placeholder="What makes this worth watching?"
              className="mt-2 border-border bg-muted text-foreground"
            />
          </div>
          <div>
            <Label className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Video clip</Label>
            <label
              htmlFor="reel-file"
              className="mt-2 flex cursor-pointer items-center gap-3 rounded-2xl border border-dashed border-border bg-muted/40 p-4 transition hover:border-primary/50"
            >
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-accent text-primary">
                <UploadCloud className="h-5 w-5" />
              </span>
              <span className="text-sm text-muted-foreground">{file ? file.name : "MP4 or WebM, under 30s recommended"}</span>
            </label>
            <input id="reel-file" type="file" accept="video/*" onChange={(e) => setFile(e.target.files?.[0] || null)} className="sr-only" />
          </div>
          {error && <p className="rounded-2xl border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive">{error}</p>}
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="h-11 rounded-full border-border bg-muted text-foreground hover:bg-muted">
              Cancel
            </Button>
            <Button type="submit" disabled={submitting} className="h-11 rounded-full bg-primary px-6 text-primary-foreground hover:bg-primary/90">
              {submitting ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : null}
              {submitting ? "Posting…" : "Post reel"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
