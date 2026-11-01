# ARMY Vault Megastore

A BTS fan merchandise megastore grounded in real Weverse / official album lines — apparel, incense, jewelry, membership, ARMY cards, autographs, and meet & greets across seven member boutiques.

**Fan project — not affiliated with HYBE or BIGHIT MUSIC.**

## Features

- **Real catalog titles** — Proof, ARIRANG editions, Light Stick Ver.4, solo albums (Indigo, Happy, Echo, D-DAY, Jack In The Box, FACE, Layover, GOLDEN)
- **Unique product photography** — every SKU maps to `/products/{slug}.jpg` (single source of truth)
- **Bring an ARMY** invite links to flood the Vault with friends
- **Cart + demo checkout** (Stripe-ready payment seam)
- **My Vault** collection tracker

## Images

```bash
npm run gen:images
```

Copies AI studio shots from Cursor assets when present, otherwise renders a unique per-slug catalog image. Manifest: `src/data/product-image-manifest.json`.

## Getting Started

```bash
npm install
npm run gen:images
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Tech Stack

- Next.js 15, React 19, TypeScript, Tailwind CSS 4, sharp
