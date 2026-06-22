# Market #259 Ad Command Center - Starter Scaffold

This repo contains a minimal starter scaffold for the Market #259 Ad Command Center. It includes:

- Next.js + TypeScript frontend scaffold
- TailwindCSS styling with Walmart-like color tokens
- Prisma schema for core models (Store, Week, AdItem, Submission, Photo, Suggestion)
- A simple Submit Ad Check form (mobile-first)
- QR Code page for printing store-specific QR to the submit form
- API route to accept submissions (basic)
- Prisma seed script to create Store 259 and Weeks starting at Week 21

Getting started

1. Copy `.env.example` to `.env` and set DATABASE_URL and optional AWS keys.

2. Install dependencies:

   npm install

3. Generate Prisma client and run migrations (or introspect existing DB):

   npx prisma generate
   npx prisma migrate dev --name init

4. Run seed (optional):

   node prisma/seed.js

5. Run the dev server:

   npm run dev

Notes & next steps

- This is a starter scaffold. The submission API currently creates minimal records; form validation, file upload, scoring logic, role-based auth, and admin panels need to be implemented.
- If you want, I can continue by adding the admin dashboard, full scoring implementation, S3 presigned uploads, exports, and recap generation.

