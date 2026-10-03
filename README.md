# UniConnect

A student campus platform for COER University, built with Next.js 14, TypeScript, Tailwind CSS, and Supabase.

## Start locally

1. Install Node.js 20 LTS (includes npm) from https://nodejs.org/.
2. Open a VS Code terminal in this `uniconnect` folder.
3. Run `npm install`.
4. Copy `.env.example` to `.env.local` with `Copy-Item .env.example .env.local` in PowerShell.
5. Run `npm run dev` and open http://localhost:3000.

The dashboard and module pages render sample data before backend credentials are configured. This workspace did not have Node.js available while it was scaffolded, so install, lint, typecheck, and production build still need to be run locally.

## Supabase setup

1. Create a Supabase project, then copy the Project URL and anon/public key into `.env.local` as `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
2. Apply `001_core_schema.sql` through `006_private_storage.sql` in numeric order using the Supabase SQL editor or CLI.
3. In Supabase Auth, enable email OTP and add the local and deployed app URLs to the allowed redirect URLs.
4. Restart `npm run dev`, register a test student, and try sign-in, complaint submission/tracking, lost-item posting, and the private evidence upload endpoint.
5. Confirm the official COER student email domain with the university before restricting registration. The supplied brief lists both `@coeruniversity.ac.in` and `@coer.ac.in`; neither is enforced by this starter.
6. Provision the first admin only with a trusted server-side Supabase Admin API process that sets `app_metadata.role` to `admin`. Never use client-editable `user_metadata` for roles. No admin bootstrap utility is included yet.
7. Test every RLS policy using separate student and admin accounts before entering real campus data.

## Included routes

- `/` Student campus dashboard
- `/community` Help and collaboration board
- `/safety` Anonymous complaint information and tracking entry point
- `/lost-found` Lost and found board
- `/notices` Campus notices
- `/support` Counselling and career support hub
- `/admin` Admin workspace preview
- `/login` Sign-in screen
- `/safety/new` Submit a concern
- `/safety/track` Check a concern status
- `/lost-found/new` Post a lost or found item

## Before launch

- The homepage and boards use illustrative sample records; live feeds and profile-aware dashboard content are not connected yet.
- Community, support, accommodation, UniMarket, and chat are schema/UI previews, not complete user workflows.
- Admin management screens and audited admin-action APIs are not implemented; the admin dashboard is a preview and must not be treated as a production admin console.
- The private evidence bucket enforces MIME allowlisting and a 10 MB maximum. Malware scanning and attachment metadata/retention workflows still need to be implemented.
- Add distributed rate limiting and abuse monitoring to complaint, report, and upload endpoints.
- Verify the conflicting student email domains with COER; configure server-side enforcement and Supabase Auth protections before registration is opened.
- Run `npm run lint`, `npm run typecheck`, and `npm run build`; then test RLS, OTP flows, and mobile layouts with real Supabase test accounts.
