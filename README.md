# Tapvora

Tapvora is the MVP for an NFC + QR Google Review card business. Each physical card carries one permanent Tapvora URL in both its printed QR and NFC chip. The destination can be updated from the private dashboard without changing the card.

## What is included

- Responsive public website.
- Supabase email/password admin authentication.
- Card batch creation and management.
- Permanent `/r/{code}` redirect route with combined open counts.
- Downloadable QR SVG.
- Exact 85.6 × 54 mm print artwork SVG.
- Row-level security and a minimal public database resolver.
- Demo mode when Supabase variables are absent.

## Local setup

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env.local`.
3. Create a Supabase project and run `supabase/migrations/001_init.sql` in its SQL editor.
4. Create a user in Supabase Authentication, then insert its UUID into `public.app_admins` using the final commented statement in the migration.
5. Fill in the Supabase URL, publishable key, and `NEXT_PUBLIC_SITE_URL`.
6. Run `npm run dev`.

Without environment variables, the app opens in a safe preview mode with an empty dashboard and zero totals. It never invents card activity or business records.

## Deployment

Deploy the repository to Vercel, add the three environment variables, and test a preview deployment. Then add `tapvora.in` as the production domain and copy the exact DNS records Vercel requests into Hostinger DNS. Do not print or encode production cards until the custom domain and HTTPS redirect route have been verified.

## Important production check

Before mass printing, open every generated permanent URL on mobile data, confirm it redirects to the intended Google Review screen, and test both the printed QR and the programmed NFC chip on multiple phones.
