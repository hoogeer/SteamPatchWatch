import type { VercelRequest, VercelResponse } from "@vercel/node";

// This API endpoints gets a list of games owned by a Steam user.
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const steamid = req.query.steamid as string;
  const apiKeyParam = req.query.key as string | undefined;
  const apiKey = apiKeyParam || process.env.STEAM_API_KEY;

  if (!steamid || !apiKey) {
    return res.status(400).json({ error: "Missing steamid or API key" });
  }

  try {
    const response = await fetch(
      `https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/?key=${apiKey}&steamid=${steamid}&include_appinfo=true`
    );
    if (!response.ok) {
      let text = await response.text();
      // Remove HTML tags if present
      text = text.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
      console.error("Steam API error response:", text);
      return res
        .status(response.status)
        .json({ error: "Steam API returned error", details: text });
    }
    const data = await response.json();
    res.status(200).json(data);
  } catch (err: unknown) {
    let message: string;
    if (
      err &&
      typeof err === "object" &&
      "message" in err &&
      typeof (err as { message?: unknown }).message === "string"
    ) {
      message = (err as { message: string }).message;
    } else {
      message = String(err);
    }
    res
      .status(500)
      .json({ error: "Steam API request failed.", details: message });
  }
}
