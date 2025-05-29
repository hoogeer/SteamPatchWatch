// Proxy endpoint to resolve a Steam vanity username to SteamID64 using the Steam Web API
// Accepts: ?username=USERNAME&key=APIKEY (key optional)
// Returns: { steamid: string } or { error: string }

import type { VercelRequest, VercelResponse } from "@vercel/node";

/**
 * API route to resolve a Steam vanity username to SteamID64, proxying the Steam API to avoid CORS issues.
 * Accepts: GET /api/getSteamId?username=USERNAME&apiKey=STEAM_API_KEY (apiKey optional)
 * Returns: { steamid: string } or { error: string }
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const username = req.query.username as string;
  const apiKey = (req.query.apiKey as string) || process.env.STEAM_API_KEY;

  if (!username) {
    res.status(400).json({ error: "Missing username parameter." });
    return;
  }
  if (!apiKey) {
    res.status(400).json({ error: "Missing Steam API key." });
    return;
  }

  const url = `https://api.steampowered.com/ISteamUser/ResolveVanityURL/v1/?key=${encodeURIComponent(
    apiKey
  )}&vanityurl=${encodeURIComponent(username)}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      res.status(502).json({ error: "Failed to contact Steam API." });
      return;
    }
    const data = await response.json();
    if (data?.response?.success === 1 && data.response.steamid) {
      res.status(200).json({ steamid: data.response.steamid });
    } else {
      res
        .status(404)
        .json({ error: data?.response?.message || "SteamID not found." });
    }
  } catch {
    res.status(500).json({ error: "Internal server error." });
  }
}
