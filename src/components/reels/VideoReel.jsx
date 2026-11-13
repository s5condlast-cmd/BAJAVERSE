import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Heart, ShoppingBag } from "lucide-react";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

export default function VideoReel({ video, active }) {
  const ref = useRef(null);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (active) {
      el.currentTime = 0;
      el.play().catch(() => {});
    } else {
      el.pause();
    }
  }, [active]);

  return (
    <article className="relative h-full w-full snap-start overflow-hidden bg-black">
      <video ref={ref} src={video.video_url} poster={video.product_image} loop muted playsInline preload="metadata" className="h-full w-full object-cover" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-black/30" />
      <div className="absolute inset-x-0 bottom-0 p-5 pb-24 sm:p-7 md:pb-7">
        <div className="flex items-end justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-primary">{video.seller_name}</p>
            <h2 className="mt-1.5 line-clamp-2 font-display text-lg font-semibold text-white sm:text-xl">{video.title}</h2>
            {video.caption && <p className="mt-1.5 line-clamp-2 text-sm text-white/80">{video.caption}</p>}
            <Link
              to={`/product/${video.product_id}`}
              className="mt-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur transition hover:bg-primary hover:text-primary-foreground"
            >
              <ShoppingBag className="h-4 w-4" />
              {video.product_name} · {formatPrice(video.product_price)}
            </Link>
          </div>
          <button
            type="button"
            onClick={() => setLiked((v) => !v)}
            aria-label={liked ? "Unlike" : "Like"}
            className="flex shrink-0 flex-col items-center gap-1 text-white"
          >
            <span className="grid h-11 w-11 place-items-center rounded-full bg-white/10 backdrop-blur">
              <Heart className={cn("h-5 w-5", liked && "fill-primary text-primary")} />
            </span>
            <span className="num text-[11px]">{(video.likes || 0) + (liked ? 1 : 0)}</span>
          </button>
        </div>
      </div>
    </article>
  );
}
