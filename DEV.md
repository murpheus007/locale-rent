# Local development

This repository uses Next.js (App Router), Tailwind, and Supabase for local development.

## Quick start

1. Copy environment template:

```bash
cp .env.example .env.local
# Fill in SUPABASE_URL, SUPABASE_ANON_KEY, SMTP_*, etc.
```

2. Start local Supabase (requires Docker & supabase CLI):

```bash
supabase start
# wait for services; then
supabase db reset --yes
```

3. Install and run dev server:

```bash
npm ci
npm run dev
```

4. Open the app:

- http://localhost:3000/en

## Notes

- Do NOT commit secrets. Keep `.env.local` out of git (already in `.gitignore`).
- Migrations are in `supabase/migrations/001_init.sql`.
- If Supabase local fails to pull images, use cloud Supabase instance or check Docker network/DNS.