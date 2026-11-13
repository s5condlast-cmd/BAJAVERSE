import React, { useEffect, useState } from "react";
import { Radio } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import Section from "@/components/Section";
import LiveStreamCard from "@/components/live/LiveStreamCard";
import StartStreamDialog from "@/components/live/StartStreamDialog";

export default function Live() {
  const { isAuthenticated } = useAuth();
  const [live, setLive] = useState([]);
  const [recent, setRecent] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startOpen, setStartOpen] = useState(false);

  const load = async () => {
    const [livePage, recentPage, prods] = await Promise.all([
      base44.entities.Livestream.filter({ status: "live" }, { sort: "-started_at", limit: 20 }),
      base44.entities.Livestream.filter({ status: "ended" }, { sort: "-ended_at", limit: 8 }),
      base44.entities.Product.filter({ status: "active" }, { sort: "-created_date", limit: 50 }),
    ]);
    setLive(livePage.items || []);
    setRecent(recentPage.items || []);
    setProducts(prods.items || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div>
      <section className="relative overflow-hidden border-b border-border">
        <div className="pointer-events-none absolute inset-0 grid-backdrop opacity-50" aria-hidden="true" />
        <div className="pointer-events-none absolute -top-40 left-1/3 h-80 w-80 rounded-full bg-primary/10 blur-[130px]" aria-hidden="true" />
        <div className="relative mx-auto flex w-full max-w-[1600px] flex-col gap-6 px-4 py-12 sm:px-6 lg:flex-row lg:items-end lg:justify-between lg:px-10 lg:py-16">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-primary">Live Shopping</p>
            <h1 className="mt-3 max-w-2xl font-display text-3xl font-semibold tracking-[-0.03em] text-foreground sm:text-4xl lg:text-5xl">
              Watch sellers go live, demo products, and grab deals in real time
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground">
              Real-time chat, live product links, and instant checkout. Sellers stream directly from their store.
            </p>
          </div>
          {isAuthenticated && (
            <Button onClick={() => setStartOpen(true)} className="h-12 shrink-0 rounded-full bg-primary px-7 text-sm font-medium text-primary-foreground hover:bg-primary/90">
              <Radio className="mr-1.5 h-4 w-4" /> Go live
            </Button>
          )}
        </div>
      </section>

      <Section className="py-10 sm:py-12">
        <div className="flex items-center gap-3">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500" />
          </span>
          <h2 className="font-display text-lg font-semibold text-foreground">Live now</h2>
          <span className="num text-xs text-muted-foreground">{live.length} streaming</span>
        </div>

        {loading ? (
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-64 animate-pulse rounded-3xl bg-muted" />
            ))}
          </div>
        ) : live.length === 0 ? (
          <div className="mt-6 rounded-3xl border border-border bg-card p-10 text-center">
            <p className="text-sm text-muted-foreground">
              No sellers are live right now. {isAuthenticated ? "Start your own stream to go live." : "Check back soon."}
            </p>
          </div>
        ) : (
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {live.map((stream) => (
              <LiveStreamCard key={stream.id} stream={stream} />
            ))}
          </div>
        )}

        {recent.length > 0 && (
          <>
            <h2 className="mt-12 font-display text-lg font-semibold text-foreground">Recent streams</h2>
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {recent.map((stream) => (
                <LiveStreamCard key={stream.id} stream={stream} ended />
              ))}
            </div>
          </>
        )}
      </Section>

      <StartStreamDialog open={startOpen} onOpenChange={setStartOpen} products={products} onStarted={load} />
    </div>
  );
}
