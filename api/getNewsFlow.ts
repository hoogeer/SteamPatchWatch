import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const url =
    "https://store.steampowered.com/events/ajaxgetbesteventsforuser?recency=30&only_game_updates=1&include_steam_blog=0";

  try {
    const { sessionid, steamLoginSecure, rawCookie, browserid, steamCountry } =
      req.body || {};
    let cookieHeader = rawCookie || "";
    if (!cookieHeader && sessionid && steamLoginSecure) {
      cookieHeader = `sessionid=${sessionid}; steamLoginSecure=${steamLoginSecure}`;
      if (browserid) cookieHeader += `; browserid=${browserid}`;
      if (steamCountry) cookieHeader += `; steamCountry=${steamCountry}`;
    }

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36",
        Accept: "application/json",
        Referer: "https://store.steampowered.com/",
        "X-Requested-With": "XMLHttpRequest",
        Cookie: cookieHeader,
      },
    });

    if (!response.ok) {
      return res
        .status(response.status)
        .json({ error: "Failed to fetch Steam events" });
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
