import { useEffect, useState } from "react";

interface Game {
  appid: number;
  name: string;
  playtime_forever: number;
  img_icon_url: string;
}

interface PatchNote {
  gid: string;
  appid: number;
  event_name: string;
  rtime32_start_time: number;
  rtime32_end_time: number;
  event_type: number;
  event_notes: string;
  jsondata: string; // raw JSON string, parse if needed
  announcement_body?: {
    gid: string;
    headline: string;
    body: string;
    posttime: number;
    updatetime: number;
    commentcount: number;
    tags: string[];
    voteupcount: number;
    votedowncount: number;
    forum_topic_id: string;
  };
}

interface GameWithNotes extends Game {
  patchNotes: PatchNote[];
}

function App() {
  const [steamId, setSteamId] = useState(
    () => localStorage.getItem("steamid") || ""
  );
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState(1);
  const [patchNotes, setPatchNotes] = useState<
    (Game & { patchNotes: PatchNote[] })[]
  >([]);
  const [hasFetchedPatches, setHasFetchedPatches] = useState(false);
  const [expandedNotes, setExpandedNotes] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (steamId) {
      fetchGames(steamId);
    }
  }, []);

  const toggleNote = (gid: string) => {
    setExpandedNotes((prev) => {
      const copy = new Set(prev);
      copy.has(gid) ? copy.delete(gid) : copy.add(gid);
      return copy;
    });
  };

  const fetchGames = async (id: string) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/getGames?steamid=${id}`);
      const data = await res.json();
      if (data.response?.games) {
        setGames(data.response.games);
        localStorage.setItem("steamid", id);
      } else {
        setError("No games found or invalid Steam ID.");
      }
    } catch (err) {
      setError("Failed to fetch games.");
    }
    setLoading(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchGames(steamId);
  };

  const fetchPatchNotes = async (appid: number): Promise<PatchNote[]> => {
    try {
      const res = await fetch(`/api/getPatchNotes?appid=${appid}`);
      const data = await res.json();
      return data.patchNotes || [];
    } catch (err) {
      console.error(`Failed to fetch patch note for appid ${appid}`);
      return []; // ✅ return empty array, not null
    }
  };

  const handlePatchTabClick = async () => {
    setActiveTab(2);
    if (hasFetchedPatches || games.length === 0) return;

    const topGames = [...games]
      .sort((a, b) => b.playtime_forever - a.playtime_forever)
      .slice(0, 10);

    const patched = await Promise.all(
      topGames.map(async (game) => {
        const patchNotes = await fetchPatchNotes(game.appid);
        return { ...game, patchNotes };
      })
    );

    setPatchNotes(patched);
    setHasFetchedPatches(true);
    console.log("Patch notes fetched:", patched);
  };

  return (
    <div
      style={{ fontFamily: "sans-serif", padding: "2rem", textAlign: "center" }}
    >
      <h1>🎮 SteamPatchWatch</h1>

      <form
        onSubmit={handleSubmit}
        style={{
          margin: "2rem auto",
          display: "flex",
          justifyContent: "center",
          gap: "0.5rem",
        }}
      >
        <input
          type="text"
          placeholder="Enter Steam ID"
          value={steamId}
          onChange={(e) => setSteamId(e.target.value)}
          style={{ padding: "0.5rem", width: "250px" }}
        />
        <button type="submit" style={{ padding: "0.5rem 1rem" }}>
          Fetch Games
        </button>
      </form>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      <div style={{ marginTop: "2rem" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "1rem",
            marginBottom: "1rem",
          }}
        >
          <button onClick={() => setActiveTab(1)}>Games List</button>
          <button onClick={handlePatchTabClick}>Patch Notes</button>
          <button onClick={() => setActiveTab(3)}>Favorites (coming)</button>
        </div>

        {activeTab === 1 && (
          <div>
            <h2>Games (Sorted by Playtime)</h2>
            <ul
              style={{
                listStyle: "none",
                padding: 0,
                maxWidth: "600px",
                margin: "auto",
              }}
            >
              {[...games]
                .sort((a, b) => b.playtime_forever - a.playtime_forever)
                .map((game) => (
                  <li
                    key={game.appid}
                    style={{
                      padding: "0.5rem 0",
                      borderBottom: "1px solid #ccc",
                    }}
                  >
                    {game.name} – {Math.round(game.playtime_forever / 60)} hrs
                  </li>
                ))}
            </ul>
          </div>
        )}

        {activeTab === 2 && (
          <div>
            <h2>Latest Patch Notes (Top 10 Games)</h2>
            <div
              style={{
                maxWidth: "600px",
                margin: "auto",
                textAlign: "left",
              }}
            >
              {patchNotes.map((game) => (
                <div key={game.appid} className="mb-8 border-b pb-4">
                  <h2 className="text-xl font-semibold mb-2">{game.name}</h2>

                  {game.patchNotes.length === 0 ? (
                    <p className="text-gray-400">No patch notes found.</p>
                  ) : (
                    <div className="space-y-4">
                      {game.patchNotes.map((note) => (
                        <div
                          key={note.gid}
                          onClick={() => toggleNote(note.gid)}
                          className="bg-[#3a3c42] text-white rounded-md p-4 shadow-sm border border-gray-600 cursor-pointer hover:bg-[#4b4d54] transition"
                        >
                          <h3 className="font-bold mb-1">{note.event_name}</h3>
                          {!expandedNotes.has(note.gid) ? (
                            <p className="text-sm italic text-gray-300">
                              Click to expand
                            </p>
                          ) : (
                            <div
                              className="text-sm"
                              dangerouslySetInnerHTML={{
                                __html: parseBBCode(
                                  note.announcement_body?.body ||
                                    "No body text."
                                ),
                              }}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        {activeTab === 3 && (
          <div>
            <h2>Favorites (coming soon)</h2>
          </div>
        )}
      </div>
    </div>
  );
}

function parseBBCode(bbcode: string): string {
  return (
    bbcode

      .replace(/\[img\](.*?)\[\/img\]/gi, (_, url) => {
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
        '<a href="$1" target="_blank" rel="noopener noreferrer">$2</a>'
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
  );
}

export default App;
