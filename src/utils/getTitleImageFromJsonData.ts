// src/utils/getTitleImageFromJsonData.ts
/**
 * Extracts a title/capsule image URL from Steam event jsondata.
 * Handles Steam CDN, Imgur, and fallback cases.
 */
export function getTitleImageFromJsonData(
  jsondata: string | undefined,
  clanid?: string | number
): string | null {
  if (!jsondata) return null;
  try {
    const obj = JSON.parse(jsondata);
    // Try localized_title_image first
    let arr = obj.localized_title_image;
    if (Array.isArray(arr) && arr[0]) {
      const hash = arr[0];
      if (/^https?:\/\//.test(hash)) {
        return hash;
      }
      if (clanid && /^[a-f0-9]{40}\.(png|jpg|jpeg)$/i.test(hash)) {
        return `https://clan.cloudflare.steamstatic.com/images/${clanid}/${hash}`;
      }
      if (/^[0-9]+\/[a-f0-9]{40}\.(png|jpg|jpeg)$/i.test(hash)) {
        return `https://clan.cloudflare.steamstatic.com/images/${hash}`;
      }
      if (/^[a-f0-9]{40}\.(png|jpg|jpeg)$/i.test(hash)) {
        return `https://clan.cloudflare.steamstatic.com/images/${hash}`;
      }
      if (/^[a-f0-9]{32}\.(png|jpg|jpeg)$/i.test(hash)) {
        return `https://media.steampowered.com/steamcommunity/public/images/clans/${hash}`;
      }
      if (/^[a-zA-Z0-9]+\.(png|jpg|jpeg|gif)$/i.test(hash)) {
        return `https://i.imgur.com/${hash}`;
      }
      return `https://clan.cloudflare.steamstatic.com/images/${hash}`;
    }
    // If localized_title_image is empty, try localized_capsule_image
    arr = obj.localized_capsule_image;
    if (Array.isArray(arr) && arr[0]) {
      const hash = arr[0];
      if (/^https?:\/\//.test(hash)) {
        return hash;
      }
      if (clanid && /^[a-f0-9]{40}\.(png|jpg|jpeg)$/i.test(hash)) {
        return `https://clan.cloudflare.steamstatic.com/images/${clanid}/${hash}`;
      }
      if (/^[0-9]+\/[a-f0-9]{40}\.(png|jpg|jpeg)$/i.test(hash)) {
        return `https://clan.cloudflare.steamstatic.com/images/${hash}`;
      }
      if (/^[a-f0-9]{40}\.(png|jpg|jpeg)$/i.test(hash)) {
        return `https://clan.cloudflare.steamstatic.com/images/${hash}`;
      }
      if (/^[a-f0-9]{32}\.(png|jpg|jpeg)$/i.test(hash)) {
        return `https://media.steampowered.com/steamcommunity/public/images/clans/${hash}`;
      }
      if (/^[a-zA-Z0-9]+\.(png|jpg|jpeg|gif)$/i.test(hash)) {
        return `https://i.imgur.com/${hash}`;
      }
      return `https://clan.cloudflare.steamstatic.com/images/${hash}`;
    }
  } catch {
    // ignore
  }
  return null;
}
