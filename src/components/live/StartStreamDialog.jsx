import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Radio } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function StartStreamDialog({ open, onOpenChange, products = [], onStarted }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [sellerName, setSellerName] = useState("");
  const [productId, setProductId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const reset = () => {
    setTitle("");
    setSellerName("");
    setProductId("");
    setError("");
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Give your stream a title before going live.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const product = products.find((p) => p.id === productId);
      const created = await base44.entities.Livestream.create({
        title: title.trim(),
        seller_name: sellerName.trim() || user?.full_name || "BAJAVERSE Seller",
        status: "live",
        product_id: product?.id || null,
        product_name: product?.name || null,
        product_price: product ? Number(product.price) || 0 : null,
        product_image: product?.image_url || null,
        viewer_count: 1,
        started_at: new Date().toISOString(),
      });
      onStarted?.();
      onOpenChange(false);
      reset();
      navigate(`/live/${created.id}`);
    } catch {
      setError("Could not start your stream. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(n) => { onOpenChange(n); if (!n) reset(); }}>
      <DialogContent className="border-border bg-card sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-xl text-foreground">Go live on BAJAVERSE</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Start a live shopping session and pin a product for viewers to buy in real time.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="mt-2 space-y-4">
          <div>
            <Label htmlFor="stream-title" className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
              Stream title
            </Label>
            <Input
              id="stream-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Unboxing our latest audio drop"
              className="mt-2 h-11 border-border bg-muted text-foreground"
            />
          </div>
          <div>
            <Label htmlFor="stream-seller" className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
              Store / host name
            </Label>
            <Input
              id="stream-seller"
              value={sellerName}
              onChange={(e) => setSellerName(e.target.value)}
              placeholder={user?.full_name || "Your store name"}
              className="mt-2 h-11 border-border bg-muted text-foreground"
            />
          </div>
          <div>
            <Label className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Featured product (optional)</Label>
            <Select value={productId} onValueChange={setProductId}>
              <SelectTrigger className="mt-2 h-11 border-border bg-muted text-foreground">
                <SelectValue placeholder="Pin a product to your stream" />
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
          {error && <p className="rounded-2xl border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive">{error}</p>}
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="h-11 rounded-full border-border bg-muted text-foreground hover:bg-muted">
              Cancel
            </Button>
            <Button type="submit" disabled={submitting} className="h-11 rounded-full bg-primary px-6 text-primary-foreground hover:bg-primary/90">
              {submitting ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Radio className="mr-1.5 h-4 w-4" />}
              {submitting ? "Starting…" : "Start live"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
