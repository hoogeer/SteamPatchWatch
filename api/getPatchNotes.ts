// /api/getPatchNotes.ts

import { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { appid } = req.query;

  if (!appid) {
    return res.status(400).json({ error: "Missing appid parameter" });
  }

  try {
    const steamRes = await fetch(
      `https://store.steampowered.com/events/ajaxgetadjacentpartnerevents/?appid=${appid}&count_before=0&count_after=2`
    );
    const data = await steamRes.json();

    if (data.success && Array.isArray(data.events)) {
      return res.status(200).json({ patchNotes: data.events });
    } else {
      return res.status(200).json({ patchNotes: [] });
    }
  } catch (error) {
    console.error("Failed to fetch patch notes:", error);
    return res.status(500).json({ error: "Failed to fetch patch notes" });
  }
}
