# WholeWork — Tech Stack Decision

> Hackathon-friendly stack integrating **Aleph Cloud** for decentralized storage and compute.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                   Frontend (Next.js)                 │
│          Tailwind CSS + shadcn/ui components         │
│                  Deployed on Vercel                  │
└──────────────┬──────────────────┬────────────────────┘
               │                  │
               ▼                  ▼
    ┌──────────────────┐  ┌─────────────────────────┐
    │  Next.js API      │  │  Aleph Cloud (storage)  │
    │  Routes           │  │                         │
    │  - AI generation  │  │  - Passport data (POST) │
    │  - Auth logic     │  │  - User profiles (AGG)  │
    │                   │  │  - Avatar files (STORE)  │
    └──────────────────┘  └─────────────────────────┘
               │
               ▼
    ┌──────────────────┐
    │  Anthropic API   │
    │  (Claude)        │
    │  Passport gen    │
    └──────────────────┘
```

---

## Stack Choices

### 1. Frontend: **Next.js 14 (App Router)**

**Why it fits:**
- Full-stack in a single repo — API routes + React pages, no separate backend to deploy
- App Router gives you server components (fast loads) and client components (interactivity) in one framework
- File-based routing means pages like `/passport/[slug]` are just a folder — zero config
- Massive ecosystem: every tutorial, every library, every integration exists
- Deploys to Vercel in one click

**Hackathon advantage:** You never context-switch between "frontend repo" and "backend repo." One codebase, one deploy, one mental model.

---

### 2. Styling: **Tailwind CSS + shadcn/ui**

**Why it fits:**
- shadcn/ui gives you pre-built, accessible, good-looking components (buttons, cards, forms, dialogs) that you own and can customize
- No design system to build — just compose existing primitives
- Tailwind means you never leave your JSX to write CSS
- Looks polished enough for a demo without a designer

**Hackathon advantage:** Go from blank page to professional-looking UI in hours, not days. No fighting CSS.

---

### 3. Auth: **Wallet Connect (via Aleph SDK) + NextAuth.js (fallback)**

**Why it fits:**
- Aleph Cloud requires a wallet keypair for writes — so wallet-based auth is natural
- For the hackathon, use an **Ethereum wallet** (MetaMask) as the primary auth method — this aligns with the Aleph ecosystem and impresses blockchain-savvy judges
- NextAuth.js as optional fallback for non-crypto users (Google OAuth) if time permits
- `@aleph-sdk/ethereum` provides `importAccountFromPrivateKey()` and browser wallet integration

**Hackathon advantage:** Wallet connect is 1 integration, not 3 (no email, no password reset, no verification). Judges at an Aleph hackathon expect wallet auth.

**Simplified approach for MVP:**
```typescript
// For demo: generate a throwaway keypair per user session
// No MetaMask required — just works
import { newAccount } from '@aleph-sdk/ethereum';
const account = await newAccount();
// Store the private key in localStorage (fine for a demo, not for production)
```

---

### 4. Data Layer: **Aleph Cloud (Posts + Aggregates + Store)**

This is the core integration and what judges will evaluate.

**Why it fits:**
- **No database to set up.** No Supabase, no Postgres, no migrations, no connection strings. Aleph is your database.
- Decentralized storage means passport data is censorship-resistant and user-owned — a powerful narrative for WholeWork ("your career story belongs to you, not a platform")
- Three Aleph primitives map perfectly to our data model:

| WholeWork Data | Aleph Primitive | Why |
|----------------|-----------------|-----|
| User profile (name, status) | **Aggregate** | Per-address key-value store, perfect for user settings |
| Career Passport (summary, skills, timeline) | **Post** (type: `career-passport`) | JSON document, queryable by type/tags, amendable |
| Questionnaire answers | **Post** (type: `questionnaire`) | Store raw answers for regeneration |
| Avatar / profile photo | **Store** | File blob storage, returns a URL |

**Reading data (no auth, free):**
```typescript
import { AlephHttpClient } from '@aleph-sdk/client';

const client = new AlephHttpClient();

// Fetch a public passport by querying posts
const response = await client.getPosts({
  types: ['career-passport'],
  tags: ['slug:sarah-jones'],
  channels: ['wholework'],
});
const passport = response.posts[0]?.content;
```

**Writing data (requires wallet):**
```typescript
import { AuthenticatedAlephHttpClient } from '@aleph-sdk/client';

const authClient = new AuthenticatedAlephHttpClient(account);

// Save a career passport
await authClient.createPost({
  postType: 'career-passport',
  content: {
    summary: "Senior household operations manager...",
    skills: [{ name: "Budget Management", category: "Finance", source: "caregiving" }],
    timeline: [{ title: "Primary Caregiver", start: "2019", end: "2023", type: "caregiving" }],
    slug: 'sarah-jones',
  },
  channel: 'wholework',
  tags: ['slug:sarah-jones', 'public'],
  sync: true,
});
```

**Hackathon advantage:** You can say "WholeWork stores your career passport on Aleph's decentralized network — your story is yours, immutable and portable." This is a strong narrative for judges evaluating Aleph integration depth.

---

### 5. AI: **Anthropic Claude API**

**Why it fits:**
- Single API call transforms questionnaire answers into a reframed career narrative
- Claude excels at nuanced, empathetic text generation — exactly what a career reframing needs
- Simple integration: one API route, one prompt, structured JSON output
- No fine-tuning, no training data, no ML infrastructure

**Hackathon advantage:** The AI generation is the "wow moment" of the demo. One well-crafted prompt does all the work.

**Integration:**
```typescript
// app/api/generate-passport/route.ts
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic();

const response = await anthropic.messages.create({
  model: 'claude-sonnet-4-5-20250929',
  max_tokens: 1024,
  messages: [{
    role: 'user',
    content: `Given this questionnaire data, generate a career passport JSON...`
  }],
});
```

---

### 6. Deploy: **Vercel (frontend) + Aleph Cloud (data)**

**Why it fits:**
- Vercel: zero-config Next.js deploys, free tier, instant preview URLs for every push
- Aleph Cloud: data is already decentralized — no "database deploy" step at all
- Two `git push`es and you're live

**Hackathon advantage:** No DevOps. No Docker. No environment parity issues. Push and it works.

---

## Packages to Install

```bash
# Core framework
npx create-next-app@latest wholework --typescript --tailwind --eslint --app --src-dir

# UI components
npx shadcn@latest init

# Aleph Cloud SDK
npm install @aleph-sdk/client @aleph-sdk/ethereum @aleph-sdk/core

# AI
npm install @anthropic-ai/sdk

# Utilities
npm install nanoid          # generate passport slugs
```

---

## What We're NOT Using (and Why)

| Skipped | Why |
|---------|-----|
| Supabase / Postgres | Aleph replaces it — no traditional DB needed |
| Prisma / Drizzle ORM | No SQL database, no ORM needed |
| Firebase | Centralized, doesn't fit hackathon theme |
| IPFS directly | Aleph abstracts over IPFS — use Aleph's Store instead |
| Docker | Vercel handles deployment; Aleph handles data |
| Redis / caching | Premature for MVP |
| Solidity / smart contracts | Not needed — Aleph posts are sufficient for our data model |

---

## Environment Variables Needed

```env
# .env.local
ANTHROPIC_API_KEY=sk-ant-...          # Claude API for passport generation
ALEPH_PRIVATE_KEY=0x...               # Server-side Aleph account for admin writes (optional)
NEXT_PUBLIC_ALEPH_CHANNEL=wholework   # Aleph channel name for our app
```

---

## Summary: Why This Stack Works for an Aleph Hackathon

1. **Aleph is front and center** — not bolted on. It's the primary data layer, not an afterthought.
2. **The narrative is strong** — "Your career passport lives on decentralized infrastructure. You own it. No platform can delete it."
3. **Minimal moving parts** — Next.js + Aleph + Claude. Three integrations. No database server, no Docker, no DevOps.
4. **Fast to build** — shadcn/ui for UI, Aleph SDK for data, one AI prompt for generation. Every piece has a clear SDK and docs.
5. **Demo-ready** — Vercel gives you a live URL. Aleph gives you a decentralization story. Claude gives you the wow moment.
