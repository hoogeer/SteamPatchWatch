import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const steamid = req.query.steamid as string;
  const apiKey = process.env.STEAM_API_KEY;

  if (!steamid || !apiKey) {
    return res.status(400).json({ error: "Missing steamid or API key" });
  }

  try {
    const response = await fetch(
      `https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/?key=${apiKey}&steamid=${steamid}&include_appinfo=true`
    );
    const data = await response.json();
    res.status(200).json(data);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Steam API request failed. Error: " + err.message });
  }
}
