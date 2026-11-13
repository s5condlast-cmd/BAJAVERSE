import React, { useEffect, useState } from "react";

export default function ScrollPulse() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <div className="fixed inset-x-0 top-0 z-[60] h-px bg-border" aria-hidden="true">
      <div className="h-px bg-primary shadow-[0_0_10px_rgba(109,40,217,0.5)]" style={{ width: `${progress * 100}%` }} />
    </div>
  );
}
