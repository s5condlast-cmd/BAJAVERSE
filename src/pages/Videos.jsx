import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Video, ChevronUp, ChevronDown } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import VideoReel from "@/components/reels/VideoReel";
import UploadVideoDialog from "@/components/reels/UploadVideoDialog";

export default function Videos() {
  const { isAuthenticated } = useAuth();
  const [videos, setVideos] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState(0);
  const [uploadOpen, setUploadOpen] = useState(false);
  const containerRef = useRef(null);

  const load = async () => {
    const [vids, prods] = await Promise.all([
      base44.entities.ProductVideo.filter({ status: "active" }, { sort: "-created_date", limit: 50 }),
      base44.entities.Product.filter({ status: "active" }, { sort: "-created_date", limit: 50 }),
    ]);
    setVideos(vids.items || []);
    setProducts(prods.items || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || videos.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio > 0.6) {
            setActive(Number(entry.target.dataset.index));
          }
        });
      },
      { root: container, threshold: [0.6] }
    );
    container.querySelectorAll("[data-index]").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [videos]);

  const scrollBy = (dir) => {
    const next = Math.max(0, Math.min(videos.length - 1, active + dir));
    const target = containerRef.current?.querySelector(`[data-index="${next}"]`);
    target?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="relative h-[calc(100dvh-64px)] md:h-[calc(100dvh-80px)]">
      {loading ? (
        <div className="flex h-full items-center justify-center text-muted-foreground">Loading reels…</div>
      ) : videos.length === 0 ? (
        <div className="flex h-full flex-col items-center justify-center gap-4 px-6 text-center">
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-accent text-primary">
            <Video className="h-6 w-6" />
          </span>
          <h2 className="font-display text-xl text-foreground">No reels yet</h2>
          <p className="max-w-sm text-sm text-muted-foreground">Sellers can post short product clips here. Be the first to share a reel.</p>
          {isAuthenticated && products.length > 0 && (
            <Button onClick={() => setUploadOpen(true)} className="h-11 rounded-full bg-primary px-6 text-primary-foreground hover:bg-primary/90">
              <Plus className="mr-1.5 h-4 w-4" /> Post a reel
            </Button>
          )}
          {isAuthenticated && products.length === 0 && (
            <Button asChild className="h-11 rounded-full bg-primary px-6 text-primary-foreground hover:bg-primary/90">
              <Link to="/seller">List a product first</Link>
            </Button>
          )}
        </div>
      ) : (
        <>
          <div ref={containerRef} className="no-scrollbar h-full snap-y snap-mandatory overflow-y-scroll scroll-smooth">
            {videos.map((video, index) => (
              <div key={video.id} data-index={index} className="h-full w-full snap-start">
                <VideoReel video={video} active={index === active} />
              </div>
            ))}
          </div>
          {videos.length > 1 && (
            <div className="absolute right-4 top-1/2 hidden -translate-y-1/2 flex-col gap-2 md:flex">
              <button onClick={() => scrollBy(-1)} aria-label="Previous reel" className="grid h-11 w-11 place-items-center rounded-full border border-white/20 bg-black/50 text-white backdrop-blur hover:bg-primary/30">
                <ChevronUp className="h-5 w-5" />
              </button>
              <button onClick={() => scrollBy(1)} aria-label="Next reel" className="grid h-11 w-11 place-items-center rounded-full border border-white/20 bg-black/50 text-white backdrop-blur hover:bg-primary/30">
                <ChevronDown className="h-5 w-5" />
              </button>
            </div>
          )}
          {isAuthenticated && (
            <Button onClick={() => setUploadOpen(true)} className="absolute right-4 top-4 z-10 h-11 rounded-full bg-primary px-5 text-primary-foreground shadow-lg hover:bg-primary/90">
              <Plus className="mr-1.5 h-4 w-4" /> Post
            </Button>
          )}
        </>
      )}
      <UploadVideoDialog open={uploadOpen} onOpenChange={setUploadOpen} products={products} onUploaded={load} />
    </div>
  );
}
