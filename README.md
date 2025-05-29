# SteamPatchWatch

SteamPatchWatch is a modern Vite + React app that helps you track patch notes and major updates for your Steam games. It supports both SteamID64 and vanity usernames, robust error handling, and user-supplied Steam API keys. All Steam API calls are securely proxied through the backend to avoid CORS issues and protect your API key.

## Features

- Enter your SteamID64 or vanity username to fetch your games
- Optionally provide your own Steam API key for private data (playtime, etc.)
- Patch notes and major updates for your most played games
- Clickable, expandable/collapsible patch note cards with images and dates
- Loading/progress indicators and robust error handling
- All Steam API calls are proxied through the backend for security and CORS
- Responsive, accessible, and modern UI

## Live Demo

Try the deployed app here: [https://steam-patch-watch.vercel.app/](https://steam-patch-watch.vercel.app/)

## Getting Started

### Prerequisites

- Node.js 18+
- (Optional) Your own Steam API key ([get one here](https://steamcommunity.com/dev/apikey))

### Setup

1. Clone the repo:
   ```sh
   git clone https://github.com/yourusername/SteamPatchWatch.git
   cd SteamPatchWatch
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Create a `.env` file in the root with your Steam API key:

   ```env
   STEAM_API_KEY=your_steam_api_key_here
   ```

   > **Note:** Do NOT use `VITE_STEAM_API_KEY` unless you want your key exposed to the frontend. Only `STEAM_API_KEY` is needed for backend security.

4. Start the dev server:
   ```sh
   npm run dev
   ```
5. Open [http://localhost:5173](http://localhost:5173) in your browser.

### Deployment (Vercel)

- Set the environment variable `STEAM_API_KEY` in your Vercel project settings.
- Deploy as a Vite app with Vercel serverless functions for API routes.

## Security

- Your Steam API key is never exposed to the frontend unless you explicitly enter it in the UI.
- All Steam API requests are made from the backend to avoid CORS and protect your credentials.

## Development

- Uses [Vite](https://vitejs.dev/) for fast dev/build
- [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Tailwind CSS](https://tailwindcss.com/)
- ESLint and Prettier for code quality
- [bbcodejs](https://www.npmjs.com/package/bbcodejs) for robust BBCode parsing

## Advanced ESLint Configuration

If you want stricter linting, see the commented examples in `eslint.config.js` or below:

```js
export default tseslint.config({
  extends: [
    ...tseslint.configs.recommendedTypeChecked,
    ...tseslint.configs.strictTypeChecked,
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    parserOptions: {
      project: ["./tsconfig.node.json", "./tsconfig.app.json"],
      tsconfigRootDir: import.meta.dirname,
    },
  },
});
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules.

## License

MIT
