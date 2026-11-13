// IndexedDB-backed local database for BAJAVERSE
const DB_NAME = "bajaverse_local_db";
const DB_VERSION = 1;

const STORES = [
  "Product",
  "Category",
  "WalletTransaction",
  "ProductVideo",
  "Livestream",
  "User",
  "chat_messages",
  "meta",
];

function makeProductArt(label, bg1, bg2, accent, shape = "circle") {
  const safeLabel = String(label).replace(/&/g, "&amp;").replace(/</g, "&lt;");
  const shapeSvg =
    shape === "headphones"
      ? `<path d="M140 230v-30a60 60 0 0 1 120 0v30" fill="none" stroke="${accent}" stroke-width="14" stroke-linecap="round"/><rect x="122" y="218" width="28" height="58" rx="14" fill="${accent}"/><rect x="250" y="218" width="28" height="58" rx="14" fill="${accent}"/>`
      : shape === "watch"
        ? `<rect x="172" y="102" width="56" height="44" rx="10" fill="${accent}" opacity="0.65"/><rect x="172" y="254" width="56" height="44" rx="10" fill="${accent}" opacity="0.65"/><rect x="148" y="138" width="104" height="124" rx="28" fill="#0f172a" stroke="${accent}" stroke-width="8"/><circle cx="200" cy="200" r="24" fill="none" stroke="${accent}" stroke-width="5"/>`
        : shape === "camera"
          ? `<rect x="115" y="145" width="170" height="115" rx="20" fill="#0f172a" stroke="${accent}" stroke-width="7"/><rect x="160" y="124" width="60" height="24" rx="8" fill="${accent}"/><circle cx="200" cy="202" r="36" fill="none" stroke="${accent}" stroke-width="8"/><circle cx="200" cy="202" r="14" fill="${accent}" opacity="0.8"/>`
          : shape === "gamepad"
            ? `<rect x="108" y="152" width="184" height="96" rx="44" fill="#0f172a" stroke="${accent}" stroke-width="7"/><circle cx="152" cy="200" r="14" fill="${accent}"/><circle cx="242" cy="188" r="8" fill="${accent}"/><circle cx="260" cy="206" r="8" fill="${accent}"/>`
            : shape === "home"
              ? `<path d="M130 205 L200 135 L270 205 V272 H130 Z" fill="#0f172a" stroke="${accent}" stroke-width="7" stroke-linejoin="round"/><circle cx="200" cy="215" r="20" fill="${accent}" opacity="0.85"/>`
              : `<rect x="145" y="135" width="110" height="130" rx="22" fill="#0f172a" stroke="${accent}" stroke-width="7"/><path d="M185 182 L212 182 L196 206 L218 206 L186 240 L194 214 L175 214 Z" fill="${accent}"/>`;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${bg1}"/>
        <stop offset="100%" stop-color="${bg2}"/>
      </linearGradient>
    </defs>
    <rect width="400" height="400" fill="url(#g)"/>
    <circle cx="200" cy="200" r="125" fill="${accent}" opacity="0.12"/>
    ${shapeSvg}
    <text x="200" y="348" text-anchor="middle" font-family="Inter,system-ui,sans-serif" font-size="14" font-weight="600" fill="#334155" letter-spacing="1.5">${safeLabel}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

const SEED_CATEGORIES = [
  { id: "cat-audio", name: "Audio", slug: "audio", icon: "headphones", tagline: "Studio headphones, earbuds & DACs", sort_order: 1 },
  { id: "cat-wearables", name: "Wearables", slug: "wearables", icon: "watch", tagline: "Smartwatches, rings & fitness bands", sort_order: 2 },
  { id: "cat-cameras", name: "Cameras", slug: "cameras", icon: "camera", tagline: "Mirrorless bodies, action cams & gimbals", sort_order: 3 },
  { id: "cat-gaming", name: "Gaming", slug: "gaming", icon: "gamepad", tagline: "Handhelds, mechanical boards & controllers", sort_order: 4 },
  { id: "cat-smart-home", name: "Smart Home", slug: "smart-home", icon: "home", tagline: "Ambient lighting, hubs & security", sort_order: 5 },
  { id: "cat-accessories", name: "Accessories", slug: "accessories", icon: "plug", tagline: "GaN chargers, cables & desk docks", sort_order: 6 },
];

const now = Date.now();
const daysAgo = (d) => new Date(now - d * 86400000).toISOString();

const SEED_PRODUCTS = [
  {
    id: "prod-aura-anc",
    name: "Aura Studio Pro ANC Headphones",
    description: "Hybrid active noise cancellation up to 48dB with 40mm planar-inspired drivers, multipoint Bluetooth 5.4, and 60-hour battery life.",
    category: "Audio",
    category_slug: "audio",
    price: 6490,
    original_price: 8990,
    discount_percent: 28,
    image_url: makeProductArt("AURA STUDIO PRO", "#f5f3ff", "#ede9fe", "#7c3aed", "headphones"),
    highlights: ["48dB adaptive noise cancelling", "60-hour battery + 5-min fast charge", "Lossless USB-C DAC audio mode"],
    rating: 4.9,
    review_count: 342,
    sales_count: 1840,
    stock: 42,
    seller_name: "Aura Acoustics",
    badge: "Top Rated",
    featured: true,
    best_seller: true,
    deal: true,
    status: "active",
    created_date: daysAgo(1),
  },
  {
    id: "prod-pulse-watch",
    name: "Pulse Titanium Watch S4",
    description: "Grade-5 titanium chassis, dual-frequency GPS, sapphire crystal display, and 14-day battery for endurance athletes.",
    category: "Wearables",
    category_slug: "wearables",
    price: 11990,
    original_price: 14500,
    discount_percent: 17,
    image_url: makeProductArt("PULSE TITANIUM S4", "#eff6ff", "#dbeafe", "#2563eb", "watch"),
    highlights: ["Grade-5 titanium & sapphire glass", "Dual-band L1+L5 precision GPS", "14-day battery with solar assist"],
    rating: 4.8,
    review_count: 215,
    sales_count: 960,
    stock: 19,
    seller_name: "Kinetix Labs",
    badge: "Featured",
    featured: true,
    best_seller: true,
    deal: true,
    status: "active",
    created_date: daysAgo(2),
  },
  {
    id: "prod-lumina-cam",
    name: "Lumina Pocket 4K60 Gimbal Camera",
    description: "1-inch CMOS sensor on a 3-axis mechanical gimbal. Fits in your jeans pocket and shoots 10-bit D-Log M.",
    category: "Cameras",
    category_slug: "cameras",
    price: 18490,
    original_price: null,
    discount_percent: 0,
    image_url: makeProductArt("LUMINA POCKET 4K", "#fdf2f8", "#fce7f3", "#db2777", "camera"),
    highlights: ["1-inch CMOS 4K/60fps sensor", "3-axis stabilized mechanical gimbal", "ActiveTrack 6.0 subject lock"],
    rating: 4.9,
    review_count: 189,
    sales_count: 720,
    stock: 14,
    seller_name: "Lumina Optics",
    badge: "New",
    featured: true,
    best_seller: false,
    deal: false,
    status: "active",
    created_date: daysAgo(3),
  },
  {
    id: "prod-nova-pad",
    name: "Nova Hall-Effect Pro Controller",
    description: "Zero-drift Hall-effect thumbsticks, micro-switch mechanical face buttons, and 1000Hz polling over 2.4GHz wireless.",
    category: "Gaming",
    category_slug: "gaming",
    price: 2890,
    original_price: 3690,
    discount_percent: 22,
    image_url: makeProductArt("NOVA PRO PAD", "#f0fdf4", "#dcfce7", "#16a34a", "gamepad"),
    highlights: ["Zero-drift Hall-effect sticks & triggers", "1000Hz ultra-low latency wireless", "4 remappable rear paddles"],
    rating: 4.7,
    review_count: 418,
    sales_count: 2410,
    stock: 65,
    seller_name: "Vortex Gear",
    badge: "Best Seller",
    featured: true,
    best_seller: true,
    deal: true,
    status: "active",
    created_date: daysAgo(4),
  },
  {
    id: "prod-halo-hub",
    name: "Halo Matter Smart Home Hub & Lamp",
    description: "Thread border router, Matter controller, and 16M-color circadian ambient lamp in a single anodized aluminum cylinder.",
    category: "Smart Home",
    category_slug: "smart-home",
    price: 3490,
    original_price: null,
    discount_percent: 0,
    image_url: makeProductArt("HALO MATTER HUB", "#fffbeb", "#fef3c7", "#d97706", "home"),
    highlights: ["Built-in Thread & Matter bridge", "Works with Apple Home, Google & Alexa", "Adaptive circadian light engine"],
    rating: 4.6,
    review_count: 127,
    sales_count: 540,
    stock: 31,
    seller_name: "Atelier Living",
    badge: "Editor's Pick",
    featured: true,
    best_seller: false,
    deal: false,
    status: "active",
    created_date: daysAgo(5),
  },
  {
    id: "prod-volt-gan",
    name: "Volt 140W GaN Prime 4-Port Charger",
    description: "Charge two laptops and two phones simultaneously with dynamic PD 3.1 power allocation and real-time thermal monitoring.",
    category: "Accessories",
    category_slug: "accessories",
    price: 1890,
    original_price: 2490,
    discount_percent: 24,
    image_url: makeProductArt("VOLT 140W GAN", "#ecfeff", "#cffafe", "#0891b2", "plug"),
    highlights: ["140W USB-C PD 3.1 output", "3x USB-C + 1x USB-A ports", "Foldable prongs & travel adapters"],
    rating: 4.8,
    review_count: 512,
    sales_count: 3120,
    stock: 110,
    seller_name: "VoltCore",
    badge: "Hot Deal",
    featured: true,
    best_seller: true,
    deal: true,
    status: "active",
    created_date: daysAgo(6),
  },
  {
    id: "prod-echo-buds",
    name: "EchoAir Open-Fit Titanium Earbuds",
    description: "Featherweight 6g open-ear acoustic design for runners and commuters who want spatial awareness without sacrificing bass.",
    category: "Audio",
    category_slug: "audio",
    price: 3990,
    original_price: null,
    discount_percent: 0,
    image_url: makeProductArt("ECHOAIR BUDS", "#f5f3ff", "#e9d5ff", "#9333ea", "headphones"),
    highlights: ["IPX5 sweat & rain resistant", "36-hour total case playback", "AI wind-noise call reduction"],
    rating: 4.7,
    review_count: 98,
    sales_count: 430,
    stock: 28,
    seller_name: "Aura Acoustics",
    badge: "New",
    featured: true,
    best_seller: false,
    deal: false,
    status: "active",
    created_date: daysAgo(7),
  },
  {
    id: "prod-ring-sleep",
    name: "Onyx Smart Health Ring Gen 2",
    description: "2.5mm ultra-thin titanium ring tracking HRV, deep sleep stages, skin temperature, and readiness score for 7 days per charge.",
    category: "Wearables",
    category_slug: "wearables",
    price: 8990,
    original_price: 10500,
    discount_percent: 14,
    image_url: makeProductArt("ONYX RING GEN 2", "#eff6ff", "#e0e7ff", "#4f46e5", "watch"),
    highlights: ["7-day battery, wireless charging dock", "100m water resistance", "No monthly subscription required"],
    rating: 4.8,
    review_count: 164,
    sales_count: 610,
    stock: 22,
    seller_name: "Kinetix Labs",
    badge: "Featured",
    featured: true,
    best_seller: false,
    deal: false,
    status: "active",
    created_date: daysAgo(8),
  },
  {
    id: "prod-mech-75",
    name: "Keycraft 75% Gasket Mechanical Keyboard",
    description: "CNC aluminum 75% wireless mechanical keyboard with hot-swap sockets, pre-lubed linear switches, and a rotary volume knob.",
    category: "Gaming",
    category_slug: "gaming",
    price: 4590,
    original_price: null,
    discount_percent: 0,
    image_url: makeProductArt("KEYCRAFT 75% CNC", "#f0fdf4", "#bbf7d0", "#15803d", "gamepad"),
    highlights: ["CNC 6063 aluminum chassis", "Tri-mode 2.4GHz / BT 5.1 / USB-C", "QMK/VIA programmable keymap"],
    rating: 4.9,
    review_count: 274,
    sales_count: 890,
    stock: 35,
    seller_name: "Vortex Gear",
    badge: "Top Rated",
    featured: false,
    best_seller: false,
    deal: false,
    status: "active",
    created_date: daysAgo(9),
  },
  {
    id: "prod-dock-tb4",
    name: "DockOne 11-in-1 USB4 Desk Hub",
    description: "Dual 4K60 display output, 2.5GbE Ethernet, UHS-II SD reader, and 100W host pass-through charging in one machined block.",
    category: "Accessories",
    category_slug: "accessories",
    price: 4290,
    original_price: 5290,
    discount_percent: 19,
    image_url: makeProductArt("DOCKONE USB4 HUB", "#ecfeff", "#a5f3fc", "#0e7490", "plug"),
    highlights: ["40Gbps USB4 / Thunderbolt compatible", "Dual 4K60 HDMI + DisplayPort", "2.5GbE + UHS-II SD 4.0"],
    rating: 4.7,
    review_count: 143,
    sales_count: 520,
    stock: 27,
    seller_name: "VoltCore",
    badge: null,
    featured: false,
    best_seller: false,
    deal: false,
    status: "active",
    created_date: daysAgo(10),
  },
];

const SEED_LIVESTREAMS = [
  {
    id: "stream-demo-1",
    title: "Live Unboxing: Aura Studio Pro ANC & Nova Hall-Effect Pad",
    seller_name: "Aura Acoustics",
    status: "live",
    product_id: "prod-aura-anc",
    product_name: "Aura Studio Pro ANC Headphones",
    product_price: 6490,
    product_image: makeProductArt("AURA STUDIO PRO", "#f5f3ff", "#ede9fe", "#7c3aed", "headphones"),
    viewer_count: 128,
    started_at: daysAgo(0),
    created_by_id: "user-demo",
  },
];

const SEED_USERS = [
  {
    id: "user-demo",
    email: "demo@bajaverse.com",
    password: "password123",
    full_name: "Alex Rivera",
    role: "user",
    created_date: daysAgo(30),
  },
];

// In-memory fallback if IndexedDB is blocked
const memoryFallback = new Map(STORES.map((s) => [s, new Map()]));
let useMemory = typeof indexedDB === "undefined";

let dbPromise = null;
let seedPromise = null;

function openDb() {
  if (useMemory) return Promise.resolve(null);
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve) => {
    try {
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = (event) => {
        const db = event.target.result;
        for (const name of STORES) {
          if (!db.objectStoreNames.contains(name)) {
            const keyPath = name === "chat_messages" ? "streamId" : name === "meta" ? "key" : "id";
            db.createObjectStore(name, { keyPath });
          }
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => {
        useMemory = true;
        resolve(null);
      };
    } catch {
      useMemory = true;
      resolve(null);
    }
  });
  return dbPromise;
}

async function rawGetAll(storeName) {
  const db = await openDb();
  if (!db) return Array.from(memoryFallback.get(storeName).values());
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, "readonly");
    const req = tx.objectStore(storeName).getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}

async function rawGet(storeName, key) {
  const db = await openDb();
  if (!db) return memoryFallback.get(storeName).get(key) || null;
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, "readonly");
    const req = tx.objectStore(storeName).get(key);
    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => reject(req.error);
  });
}

async function rawPut(storeName, value) {
  const db = await openDb();
  if (!db) {
    const key = storeName === "chat_messages" ? value.streamId : storeName === "meta" ? value.key : value.id;
    memoryFallback.get(storeName).set(key, value);
    return value;
  }
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, "readwrite");
    const req = tx.objectStore(storeName).put(value);
    req.onsuccess = () => resolve(value);
    req.onerror = () => reject(req.error);
  });
}

async function rawDelete(storeName, key) {
  const db = await openDb();
  if (!db) {
    memoryFallback.get(storeName).delete(key);
    return;
  }
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, "readwrite");
    const req = tx.objectStore(storeName).delete(key);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function ensureSeeded() {
  if (seedPromise) return seedPromise;
  seedPromise = (async () => {
    const marker = await rawGet("meta", "seeded_v1");
    if (marker) return;

    await Promise.all([
      ...SEED_CATEGORIES.map((c) => rawPut("Category", c)),
      ...SEED_PRODUCTS.map((p) => rawPut("Product", p)),
      ...SEED_LIVESTREAMS.map((s) => rawPut("Livestream", s)),
      ...SEED_USERS.map((u) => rawPut("User", u)),
    ]);
    await rawPut("meta", { key: "seeded_v1", at: new Date().toISOString() });
  })();
  return seedPromise;
}

export async function getAllRecords(storeName) {
  await ensureSeeded();
  return rawGetAll(storeName);
}

export async function getRecord(storeName, id) {
  await ensureSeeded();
  return rawGet(storeName, id);
}

export async function putRecord(storeName, record) {
  await ensureSeeded();
  return rawPut(storeName, record);
}

export async function deleteRecord(storeName, id) {
  await ensureSeeded();
  return rawDelete(storeName, id);
}

export async function getChatHistory(streamId) {
  const row = await rawGet("chat_messages", streamId);
  return row?.messages || [];
}

export async function saveChatHistory(streamId, messages) {
  await rawPut("chat_messages", { streamId, messages: messages.slice(-100) });
}

export { SEED_CATEGORIES, SEED_PRODUCTS, SEED_LIVESTREAMS };
