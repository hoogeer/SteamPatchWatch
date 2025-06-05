import { VercelRequest, VercelResponse } from "@vercel/node";

// This API endpoint fetches patch notes for a Steam user
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const steamid = req.query.steamid as string;
  const apiKeyParam = req.query.key as string | undefined;
  const apiKey = apiKeyParam || process.env.STEAM_API_KEY;

  if (!steamid) {
    return res.status(400).json({ error: "Missing appid parameter" });
  }
  try {
    const steamRes = await fetch(
      `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${apiKey}&steamids=${steamid}`
    );
    if (!steamRes.ok) {
      const text = await steamRes.text();
      console.error("Steam API error response:", text);
      return res
        .status(502)
        .json({ error: "Steam API returned error", details: text });
    }

    const data = await steamRes.json();

if ( data && data.response && Array.isArray(data.response.players)
    && data.response.players.length > 0) {

  const p = data.response.players[0];
  const steamUser = {
    steamid: p.steamid,
    personaname: p.personaname,
    avatar: p.avatar,
    avatarmedium: p.avatarmedium,
    avatarfull: p.avatarfull,
    profileurl: p.profileurl,
    communityvisibilitystate: p.communityvisibilitystate,
    profilestate: p.profilestate,
    commentpermission: p.commentpermission,
    avatarhash: p.avatarhash,
    lastlogoff: p.lastlogoff,
    personastate: p.personastate,
    primaryclanid: p.primaryclanid,
    timecreated: p.timecreated,
    personastateflags: p.personastateflags,
  };
  return res.status(200).json({ player: steamUser });
  } else {
    return res.status(404).json({ error: "Player not found" });
  }
  } catch (error) {
    console.error("Failed to fetch Profile: ", error);
    return res.status(500).json({ error: "Failed to fetch Profile: " });
  }
}
