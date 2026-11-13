import React from "react";

export default function HeroArtwork() {
  return (
    <div className="relative h-[360px] w-full overflow-hidden rounded-[22px] bg-white sm:h-[460px] lg:h-[560px]">
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 800 800"
        preserveAspectRatio="xMidYMid slice"
        role="img"
        aria-label="Abstract blue and white design made of diagonal stripes in light, royal and navy blue"
      >
        <defs>
          <linearGradient id="hv-base" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#ffffff" />
            <stop offset="1" stopColor="#f6faff" />
          </linearGradient>
          <radialGradient id="hv-glow" cx="0.74" cy="0.2" r="0.75">
            <stop offset="0" stopColor="#bfdbfe" stopOpacity="0.85" />
            <stop offset="1" stopColor="#bfdbfe" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="hv-wash" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#e8f1ff" />
            <stop offset="1" stopColor="#dbeafe" />
          </linearGradient>
          <linearGradient id="hv-sky" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#93c5fd" />
            <stop offset="1" stopColor="#3b82f6" />
          </linearGradient>
          <linearGradient id="hv-royal" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#3b82f6" />
            <stop offset="0.55" stopColor="#2563eb" />
            <stop offset="1" stopColor="#1e40af" />
          </linearGradient>
          <linearGradient id="hv-navy" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#1e3a8a" />
            <stop offset="1" stopColor="#0b1b3a" />
          </linearGradient>
          <pattern id="hv-hairlines" width="34" height="34" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="34" stroke="#dbeafe" strokeWidth="1" />
          </pattern>
        </defs>

        <rect width="800" height="800" fill="url(#hv-base)" />
        <rect width="800" height="800" fill="url(#hv-glow)" />
        <rect width="800" height="800" fill="url(#hv-hairlines)" opacity="0.7" />

        <g fill="none" stroke="#bfdbfe" strokeWidth="1.5" opacity="0.9">
          <circle cx="612" cy="168" r="112" />
          <circle cx="612" cy="168" r="68" opacity="0.6" />
        </g>

        <polygon points="800,110 800,270 270,800 110,800" fill="url(#hv-wash)" />
        <polygon points="800,300 800,380 380,800 300,800" fill="url(#hv-sky)" />
        <polygon points="800,420 800,620 620,800 420,800" fill="url(#hv-royal)" />
        <polygon points="800,670 800,740 740,800 670,800" fill="url(#hv-navy)" />

        <line x1="800" y1="470" x2="470" y2="800" stroke="#ffffff" strokeWidth="3" opacity="0.22" />
        <line x1="800" y1="505" x2="505" y2="800" stroke="#ffffff" strokeWidth="1.5" opacity="0.14" />
      </svg>
    </div>
  );
}
