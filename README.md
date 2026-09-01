This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Content management

A small newsroom-style CMS is built in:

| Area | Path | Purpose |
| --- | --- | --- |
| Public home | `/` | Published news posts, newest first |
| Post page | `/news/<slug>` | One post, Markdown body + images |
| Gallery | `/gallery` | All uploaded images |
| Admin | `/admin` | Password-protected: create / edit / delete posts, upload images |

### Setup

1. `cp .env.example .env.local` and set:
   - `ADMIN_PASSWORD` — unlocks `/admin` (single shared editor password)
   - `SESSION_SECRET` — signs the admin cookie; generate with
     `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
2. `npm install`
3. `npm run dev`, then open `/admin` and sign in.

### Where data lives

- Posts + image metadata: `data/cms.db` (SQLite, via Node's built-in
  `node:sqlite` — no native module). Created automatically on first run.
- Image files: `public/uploads/`, served at `/uploads/<file>`.
- Both are gitignored.

> **Deploy note:** the `Dockerfile` runs `next start` in an ephemeral container,
> so `data/` and `public/uploads/` are wiped on each redeploy. For a persistent
> deployment, mount a volume at those paths, or swap `src/lib/db.ts` +
> `src/lib/images.ts` for a hosted database and object storage (e.g. Postgres +
> S3) — the rest of the app talks only to those two modules.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
"# nextjs-sample" 
## Test Commit 