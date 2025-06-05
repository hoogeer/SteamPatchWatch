import { VercelRequest, VercelResponse } from "@vercel/node";

// This API endpoint fetches patch notes for a specific Steam game.
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { appid, pAmountOfEvents, event_type_filter } = req.query;

  if (!appid) {
    return res.status(400).json({ error: "Missing appid parameter" });
  }

  const countAfter =
    typeof pAmountOfEvents === "string" ? parseInt(pAmountOfEvents, 10) : 3;
  const eventTypeFilter =
    typeof event_type_filter === "string" ? event_type_filter : "13,14";

  try {
    const steamRes = await fetch(
      `https://store.steampowered.com/events/ajaxgetadjacentpartnerevents/?appid=${appid}&count_before=0&count_after=${countAfter}&event_type_filter=${eventTypeFilter}`
    );
    if (!steamRes.ok) {
      const text = await steamRes.text();
      console.log("Steam API error response:", text);
      return res
        .status(502)
        .json({ error: "Steam API returned error", details: text });
    }
    
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
