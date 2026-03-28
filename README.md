## Stanko Tražić

Compare real monthly apartment costs in Zagreb (rent, utilities, commute, parking, neighborhood score).

## Environment variables

Create **`.env.local`** in the project root (copy from [`.env.local.example`](.env.local.example)). Next.js loads it automatically; restart `npm run dev` after changes.

| Variable | Required | Purpose |
|----------|----------|---------|
| `GOOGLE_MAPS_DIRECTIONS_API_KEY` | Yes* | Commute (Directions API) |
| `GOOGLE_PLACES_API_KEY` | Yes* | Autocomplete, neighborhood nearby search, geocoding / parking |
| `GOOGLE_GEMINI_API_KEY` | No | Short “why this won” text after results |
| `GEMINI_MODEL` | No | Override Gemini model id (default `gemini-2.5-flash`) |

\*You can use the **same** Google Cloud API key for both if **Directions API**, **Places API (New)**, and **Geocoding API** are enabled for that key in [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → Credentials.

### Google Gemini API key (optional)

1. Open [Google AI Studio — API keys](https://aistudio.google.com/apikey).
2. Sign in with your Google account.
3. Click **Create API key** (you can create a new Google Cloud project or pick an existing one).
4. Copy the key and add to `.env.local`:
   ```bash
   GOOGLE_GEMINI_API_KEY=paste_your_key_here
   ```
5. Restart the dev server.

The app calls **`gemini-2.5-flash`** by default (older ids such as `gemini-2.0-flash` are unavailable for new API keys). To use another model from [AI Studio](https://aistudio.google.com/), set `GEMINI_MODEL` in `.env.local`.

Do **not** commit `.env.local` or paste API keys into app source files.

---

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

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

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) with **Inter** for UI text.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
