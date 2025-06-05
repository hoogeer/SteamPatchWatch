export function parseBBCode(bbcode: string): string {
  return (
    bbcode.replace(/\[img\](.*?)\[\/img\]/gi, (_, url) => {
        const fixedUrl = url.replace(
          "{STEAM_CLAN_IMAGE}",
          "https://clan.cloudflare.steamstatic.com/images"
        );
        return `<img src="${fixedUrl}" alt="Image" style="max-width:100%; margin-top: 1rem;" />`;
      })

      // Headings
      .replace(/\[h1\](.*?)\[\/h1\]/gi, "<h1>$1</h1>")
      .replace(/\[h2\](.*?)\[\/h2\]/gi, "<h2>$1</h2>")
      .replace(/\[h3\](.*?)\[\/h3\]/gi, "<h3>$1</h3>")

      // Text formatting
      .replace(/\[b\](.*?)\[\/b\]/gi, "<strong>$1</strong>")
      .replace(/\[i\](.*?)\[\/i\]/gi, "<em>$1</em>")
      .replace(/\[u\](.*?)\[\/u\]/gi, "<u>$1</u>")
      .replace(/\[s\](.*?)\[\/s\]/gi, "<s>$1</s>")

      // Centering
      .replace(
        /\[center\](.*?)\[\/center\]/gis,
        '<div style="text-align:center;">$1</div>'
      )

      // Links & images
      .replace(
        /\[url=(.*?)\](.*?)\[\/url\]/gi,
        '<a href="$1" target="_blank" rel="noopener noreferrer" style="color:#3b82f6; text-decoration:underline;">$2</a>'
      )
      .replace(
        /\[img\](.*?)\[\/img\]/gi,
        '<img src="$1" alt="Image" style="max-width:100%;" />'
      )

      // Lists
      // Handles [list] and [*] inside properly
      .replace(/\[list\](.*?)\[\/list\]/gis, (_, content) => {
        const items = content
          .split(/\[\*\]/)
          .filter((item: string) => item.trim() !== "")
          .map((item: string) => `<li>${item.trim()}</li>`)
          .join("");
        return `<ul>${items}</ul>`;
      })

      // Quotes
      .replace(
        /\[quote\](.*?)\[\/quote\]/gis,
        '<blockquote style="border-left: 4px solid #999; padding-left: 1em; color: #ccc;">$1</blockquote>'
      )
      .replace(
        /\[quote=(.*?)\](.*?)\[\/quote\]/gis,
        "<blockquote><strong>$1 said:</strong><br>$2</blockquote>"
      )

      // Colors and font sizes (basic sanitization)
      .replace(
        /\[color=(#[0-9a-f]{3,6}|[a-z]+)\](.*?)\[\/color\]/gi,
        '<span style="color:$1;">$2</span>'
      )
      .replace(
        /\[size=(\d+)\](.*?)\[\/size\]/gi,
        '<span style="font-size:$1px;">$2</span>'
      )

      // Line breaks
      .replace(/\n/g, "<br />")

      // YouTube preview embedding
      .replace(
        /\[previewyoutube=([\w-]{11})(?:;[^\]]*)?\]\s*\[\/previewyoutube\]/gi,
        (_, id) => {
          if (!/^[-\w]{11}$/.test(id)) return '';
          return `<div class="youtube-embed" style="margin:1em 0; text-align:center;"><iframe width="560" height="315" src="https://www.youtube.com/embed/${id}" title="YouTube video preview" frameborder="0" allowfullscreen style="max-width:100%; aspect-ratio:16/9; border-radius:12px;"></iframe></div>`;
        }
      )

      // Paragraphs
      .replace(/\[p\](.*?)\[\/p\]/gis, '<p>$1</p>')
  );
}
const BBCodeHelper = { parseBBCode };

export default BBCodeHelper;