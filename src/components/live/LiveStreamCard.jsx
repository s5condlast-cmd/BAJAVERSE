import React from "react";
import { Link } from "react-router-dom";
import { Users, Play } from "lucide-react";
import { Image } from "@/components/ui/image";
import { formatPrice } from "@/lib/format";

export default function LiveStreamCard({ stream, ended }) {
  return (
    <Link to={`/live/${stream.id}`} className="group block overflow-hidden rounded-3xl border border-border bg-card transition hover:border-primary/40">
      <div className="relative aspect-video overflow-hidden bg-black">
        {stream.product_image ? (
          <Image src={stream.product_image} alt={stream.title} fittingType="fill" className="h-full w-full object-cover opacity-70 transition group-hover:opacity-90" />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-primary/30 to-background" />
        )}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="grid h-14 w-14 place-items-center rounded-full bg-white/15 backdrop-blur transition group-hover:bg-primary">
            <Play className="h-6 w-6 text-white" />
          </span>
        </div>
        {!ended && (
          <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-red-500 px-2.5 py-1 text-[11px] font-semibold text-white">
            <span className="h-1.5 w-1.5 rounded-full bg-white" /> LIVE
          </span>
        )}
        <span className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-black/50 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur">
          <Users className="h-3 w-3" /> {stream.viewer_count || 0}
        </span>
      </div>
      <div className="p-4">
        <p className="text-[11px] uppercase tracking-[0.16em] text-primary">{stream.seller_name}</p>
        <h3 className="mt-1.5 line-clamp-2 font-display text-sm font-semibold text-foreground">{stream.title}</h3>
        {stream.product_name && (
          <p className="mt-2 text-xs text-muted-foreground">
            {stream.product_name} · {formatPrice(stream.product_price)}
          </p>
        )}
      </div>
    </Link>
  );
}
