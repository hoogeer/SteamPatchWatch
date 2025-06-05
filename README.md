# SteamPatchWatch

A modern Steam patch notes viewer and tracker built with Vite, React, TypeScript, shadcn-ui, and Tailwind CSS.

## Features

- **Steam Login & Game Library**: Connect with your Steam ID and view your owned games.
- **Patch Notes Feed**: See recent patch notes for your games, fetched live from the Steam API.
- **Rich Patch Note Rendering**: Patch notes are parsed from Steam's BBCode and displayed with headings, lists, links, images, and embedded YouTube previews.
- **Collapsible Patch Cards**: Expand/collapse patch notes for easy browsing.
- **Dark Mode & Responsive UI**: Beautiful, readable interface for desktop and mobile.
- **Retry & Error Handling**: Automatic retry for Steam API rate limits, with user-friendly error toasts.

## Live Demo

The app is deployed and available at:

👉 [https://steam-patch-watch.vercel.app/](https://steam-patch-watch.vercel.app/)

## Getting Started

### Prerequisites
- Node.js & npm (recommended: use [nvm](https://github.com/nvm-sh/nvm#installing-and-updating))
- A Steam API key (for full functionality)

### Local Development

```sh
# Clone the repository
git clone https://github.com/hoogeer/SteamPatchWatch
cd SteamPatchWatch

# Install dependencies
npm install

# Start the development server
npm run dev
```

Open http://localhost:5173 in your browser.

### Steam API Key
- You can use the app without a Steam API key, but some features may be limited or rate-limited.
- To get a key: https://steamcommunity.com/dev/apikey
- Enter your key in the app when prompted for best results.

## Deployment

- Deploy on [Vercel](https://vercel.com/) or any platform that supports Vite/React/Node.js API routes.
- Environment variable: `STEAM_API_KEY` (optional, for server-side API calls)

## Technologies Used
- Vite
- React
- TypeScript
- shadcn-ui
- Tailwind CSS

## Customization
- Patch note rendering is handled in `src/utils/BBCodeHelper.ts`.
- UI components are in `src/components/`.
- API routes (Steam integration) are in `api/`.

## License
MIT
