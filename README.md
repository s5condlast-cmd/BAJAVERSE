# BAJAVERSE

BAJAVERSE is an online tech marketplace for audio gear, wearables, cameras, gaming, smart home devices, and accessories. It supports shopping, selling, short product videos, and live shopping with real-time chat.

## Features

- Home page with search, categories, featured products, deals, and best sellers
- Product catalog with search, category filter, and sorting
- Product details and a persistent shopping cart
- Seller Center to create and manage listings
- Short product video reels
- Live shopping streams with real-time chat
- Digital wallet and transaction history
- Accounts: register, login, Google sign-in, password reset, account deletion

## Tech Stack

- **Frontend:** React 18, Vite 6, React Router, Tailwind CSS, Radix UI, Framer Motion
- **Data & Forms:** TanStack React Query, React Hook Form, Zod
- **Backend / Database:** Firebase Authentication and Cloud Firestore
- **Live Streaming:** LiveKit
- **Hosting:** Netlify

## Getting Started

```bash
npm install
cp .env.example .env   # then fill in your Firebase keys
npm run dev
```

If no Firebase keys are set, the app falls back to local browser storage.

## Environment Variables

Set these in `.env` locally and in Netlify under **Site configuration → Environment variables**:

```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_MEASUREMENT_ID=
```

## Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Start the development server |
| `npm run build` | Build for production (`dist`) |
| `npm run preview` | Preview the production build |
| `npm run lint` | Run ESLint |

## Deployment

1. Push the repository to GitHub.
2. In Netlify, import the repo. `netlify.toml` sets the build command (`npm run build`) and publish folder (`dist`).
3. Add the `VITE_FIREBASE_*` variables in Netlify.
4. Add your Netlify domain in Firebase Console → Authentication → Settings → Authorized domains.
