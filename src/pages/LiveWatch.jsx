import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, ShoppingBag, Radio, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { Image } from "@/components/ui/image";
import { formatPrice } from "@/lib/format";
import LiveChat from "@/components/live/LiveChat";
import LiveKitRoom from "@/components/live/LiveKitRoom";

export default function LiveWatch() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stream, setStream] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [token, setToken] = useState(null);
  const [url, setUrl] = useState("");
  const [tokenError, setTokenError] = useState("");
  const [tokenLoading, setTokenLoading] = useState(false);

  const load = async () => {
    try {
      const s = await base44.entities.Livestream.get(id);
      setStream(s);
    } catch {
      setNotFound(true);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [id]);

  useEffect(() => {
    const unsub = base44.entities.Livestream.subscribe((event) => {
      if (event.id === id) load();
    });
    return unsub;
  }, [id]);

  const isLive = stream?.status === "live";
  const isOwner = user && stream?.created_by_id === user.id;
  const mode = isOwner && isLive ? "publisher" : "subscriber";

  useEffect(() => {
    if (loading || notFound || !stream || !isLive) return;
    let cancelled = false;
    (async () => {
      setTokenLoading(true);
      try {
        const res = await base44.functions.invoke("createLiveToken", { livestreamId: id, role: mode });
        if (cancelled) return;
        setToken(res.data.token);
        setUrl(res.data.url);
        setTokenError("");
      } catch (e) {
        if (!cancelled) setTokenError(e?.response?.data?.error || e?.message || "Could not start the live video.");
      } finally {
        if (!cancelled) setTokenLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id, mode, isLive, loading, notFound]);

  const endStream = async () => {
    await base44.entities.Livestream.update(id, { status: "ended", ended_at: new Date().toISOString() });
    setStream({ ...stream, status: "ended" });
  };

  if (loading) return <div className="flex h-[60vh] items-center justify-center text-muted-foreground">Loading stream…</div>;
  if (notFound || !stream) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
        <p className="text-sm text-muted-foreground">This stream is no longer available.</p>
        <Button asChild className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90">
          <Link to="/live">Back to Live</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 lg:px-10">
      <div className="mb-4 flex items-center justify-between">
        <Button variant="ghost" size="icon" onClick={() => navigate("/live")} aria-label="Back to live" className="h-11 w-11 rounded-xl text-foreground hover:bg-muted">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        {isOwner && isLive && (
          <Button onClick={endStream} className="h-11 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90">
            <Radio className="mr-1.5 h-4 w-4" /> End Live
          </Button>
        )}
      </div>
      <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        <div className="overflow-hidden rounded-3xl border border-border bg-black">
          <div className="relative aspect-video w-full bg-black">
            {!isLive ? (
              <div className="flex h-full items-center justify-center bg-black/70">
                <div className="text-center">
                  <p className="font-display text-lg text-white">Stream ended</p>
                  <p className="mt-1 text-xs text-white/60">Thanks for watching</p>
                </div>
              </div>
            ) : tokenError ? (
              <div className="flex h-full items-center justify-center bg-black/70 px-4 text-center text-sm text-white/80">{tokenError}</div>
            ) : tokenLoading ? (
              <div className="flex h-full items-center justify-center text-sm text-white/70">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Connecting…
              </div>
            ) : token ? (
              <LiveKitRoom token={token} url={url} mode={mode} />
            ) : null}
          </div>
          <div className="bg-card p-4">
            <div className="flex items-center gap-2">
              {isLive && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500 px-2.5 py-1 text-[11px] font-semibold text-white">
                  <span className="h-1.5 w-1.5 rounded-full bg-white" /> LIVE
                </span>
              )}
              <p className="text-[11px] uppercase tracking-[0.16em] text-primary">{stream.seller_name}</p>
            </div>
            <h1 className="mt-2 font-display text-xl font-semibold text-foreground">{stream.title}</h1>
            {stream.product_name && (
              <Link to={`/product/${stream.product_id}`} className="mt-4 flex items-center gap-3 rounded-2xl border border-border bg-muted/40 p-3 transition hover:border-primary/40">
                {stream.product_image && <Image src={stream.product_image} alt={stream.product_name} fittingType="fill" className="h-14 w-14 rounded-xl object-cover" />}
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">Featured product</p>
                  <p className="truncate text-sm font-medium text-foreground">{stream.product_name}</p>
                </div>
                <span className="num text-sm font-semibold text-primary">{formatPrice(stream.product_price)}</span>
                <ShoppingBag className="h-4 w-4 text-muted-foreground" />
              </Link>
            )}
          </div>
        </div>
        <div className="h-[60vh] overflow-hidden rounded-3xl border border-border bg-card lg:h-auto">
          <LiveChat streamId={id} userName={user?.full_name || user?.email || "Viewer"} />
        </div>
      </div>
    </div>
  );
}
