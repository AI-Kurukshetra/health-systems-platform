# Healthcare Infrastructure SaaS (Next.js 15)

Full-stack starter for a GraphQL-first AI Healthcare Infrastructure platform.

## Stack
- Next.js App Router + TypeScript
- Supabase (Auth, Postgres, Storage, Realtime)
- Tailwind CSS v4 + shadcn/ui-style components

## Roles
- `admin`
- `provider`
- `patient`

Store role in Supabase user metadata (`user_metadata.role` or `app_metadata.role`).

## Getting Started
1. Install dependencies
```bash
npm install
```
2. Configure env
```bash
cp .env.example .env.local
```
3. Run development server
```bash
npm run dev
```

## Environment Variables
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `OPENAI_API_KEY`
- `OPENAI_DIAGNOSIS_MODEL` (optional)
- `OPENAI_CLINICAL_NOTES_MODEL` (optional)
- `OPENAI_PATIENT_SUMMARY_MODEL` (optional)

## Route Structure
- `/(auth)/login`
- `/(auth)/signup`
- `/(admin)/dashboard`
- `/(admin)/organizations`
- `/(admin)/providers`
- `/(doctor)/dashboard`
- `/(doctor)/patients`
- `/(doctor)/appointments`
- `/(doctor)/records`
- `/(patient)/dashboard`
- `/(patient)/symptoms`
- `/(patient)/appointments`
- `/(patient)/chat`

## API
- `GET /api/health`
- `POST /api/graphql` (starter scaffold)

## Notes
- Middleware and server-side role checks are both enabled.
- `src/modules/*` contains domain types for modular scaling.
- AI features are intentionally deferred for later phases.
