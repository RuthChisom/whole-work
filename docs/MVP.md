# WholeWork — Lean MVP Definition

> A life-aware career passport for women, especially moms, whose careers include caregiving and non-linear work.

**Target build time:** 48–72 hours (hackathon pace)
**Focus:** Demo-ability, not production.

---

## The One-Liner

A simple web app where a woman/mom builds a **"Career Passport"** — a single-page profile that reframes caregiving gaps as meaningful experience, shareable via link.

---

## Core Features (4 total)

### 1. Onboarding Questionnaire (the hook)

- 5–7 guided questions: name, current status (returning / exploring / active), years of caregiving, skills used during gap (budgeting, project management, crisis management, scheduling, advocacy, etc.), prior professional roles.
- Feels like a quiz, not a form. One question per screen.

### 2. AI-Generated Career Passport

- Takes questionnaire answers and calls an LLM (OpenAI/Claude API) to generate:
  - A **reframed professional summary** (turns "stay-at-home mom for 5 years" into a strengths-based narrative)
  - A **skills inventory** mapped from caregiving to professional equivalents
  - A **timeline view** that presents the non-linear path without "gaps"
- User can edit the generated content inline.

### 3. Passport View (the shareable page)

- Clean, single-page public profile at `/passport/:slug`
- Shows: summary, skills, timeline, optional photo
- Shareable link + "Copy Link" button
- This is the demo money shot.

### 4. Dashboard (minimal)

- Login → see your passport → edit → regenerate
- That's it. No settings, no notifications, no social features.

---

## User Flow

```
Landing Page → "Build Your Passport" CTA
       ↓
  Sign Up (email + password, or Google OAuth)
       ↓
  Onboarding Questionnaire (5–7 steps, one per screen)
       ↓
  AI generates Career Passport (loading screen with encouraging copy)
       ↓
  Passport Editor (preview + inline edit)
       ↓
  "Share Your Passport" → copy public link
       ↓
  Dashboard (view / edit / regenerate)
```

---

## Recommended Tech Stack

| Layer | Choice | Why |
|-------|--------|-----|
| Framework | Next.js 14 (App Router) | Full-stack in one repo, fast to scaffold |
| Styling | Tailwind CSS + shadcn/ui | Pre-built components, no design system needed |
| Auth | NextAuth.js (or Clerk) | Google OAuth + email in minutes |
| Database | Supabase (Postgres) | Free tier, instant setup, row-level security |
| AI | OpenAI API (or Anthropic) | Single prompt for passport generation |
| Deploy | Vercel | Zero-config Next.js deploys |

---

## Data Model (3 tables)

```sql
-- Core user record (managed by auth provider)
users
  id          uuid primary key
  email       text unique not null
  name        text
  avatar_url  text
  created_at  timestamptz default now()

-- The generated career passport
passports
  id          uuid primary key
  user_id     uuid references users(id)
  summary     text                          -- AI-generated professional summary
  skills      jsonb                         -- [{name, category, source}]
  timeline    jsonb                         -- [{title, org, start, end, type}]
  is_public   boolean default true
  slug        text unique not null          -- for /passport/:slug URLs
  created_at  timestamptz default now()
  updated_at  timestamptz default now()

-- Raw questionnaire answers (for regeneration)
questionnaire_responses
  id          uuid primary key
  user_id     uuid references users(id)
  answers     jsonb                         -- {question_key: answer_value}
  created_at  timestamptz default now()
```

---

## What to Skip

| Skip This | Why |
|-----------|-----|
| Resume upload / parsing | Complex, fragile, not needed for demo |
| Job matching / recommendations | Entire second product — cut it |
| Employer-side dashboard | Two-sided marketplace = scope death |
| PDF export | Nice-to-have, not demo-critical |
| Mobile app | Responsive web is enough |
| Email verification / password reset | Use OAuth, skip email flows |
| Analytics / tracking | Zero value for a demo |
| Multiple passports per user | One is enough |
| Community / social features | Not an MVP concern |
| Payment / subscriptions | Demo, not production |
| Accessibility audit | Important but post-MVP |
| i18n | English only |

---

## Demo Script (2 minutes)

1. "Meet Sarah. She's been a full-time mom for 4 years and wants to return to work."
2. Show Sarah completing the questionnaire (30 sec)
3. AI generates her Career Passport — the gap disappears, replaced by a strengths narrative (**wow moment**)
4. Sarah edits one line, clicks Share, copies her link
5. Open the public passport page — clean, professional, no "gap" in sight
6. "This is WholeWork. Your career didn't pause. It evolved."

---

## Build Order (suggested)

1. **Scaffold** — Next.js + Tailwind + shadcn/ui + Supabase project setup
2. **Auth** — NextAuth with Google OAuth
3. **Questionnaire** — multi-step form with local state
4. **AI generation** — API route that calls LLM, returns passport JSON
5. **Passport editor** — display generated passport, allow inline edits, save to DB
6. **Public passport page** — `/passport/:slug`, no auth required
7. **Landing page** — hero + CTA, last because it's cosmetic
