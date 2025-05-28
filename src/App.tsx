/* eslint-disable @typescript-eslint/no-unused-expressions */
import { useEffect, useState, useRef } from "react";

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
    clanid?: string | number;
  };
}

interface MajorUpdateNote extends PatchNote {
  gameName: string;
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
  const [recentMajorUpdates, setRecentMajorUpdates] = useState<
    MajorUpdateNote[]
  >([]);
  const [majorUpdatesLoading, setMajorUpdatesLoading] = useState(false);
  const [majorUpdatesError, setMajorUpdatesError] = useState("");
  const [majorUpdatesPage, setMajorUpdatesPage] = useState(0);
  const [majorUpdatesProgress, setMajorUpdatesProgress] = useState(0);
  const [patchNotesLoading, setPatchNotesLoading] = useState(false);
  const MAJOR_UPDATES_PER_PAGE = 20;
  const majorUpdatesListRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    if (steamId) {
      fetchGames(steamId);
    }
  }, [steamId]);

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
        console.log(
          "Fetched games:",
          data.response?.games ? data.response.games.length : 0
        );
        const filteredGames = data.response.games.filter(
          (g: Game) => g.playtime_forever > 0
        );
        console.log("Fetched games after filter:", filteredGames.length);
        setGames(filteredGames);
        localStorage.setItem("steamid", id);
      } else {
        setError("No games found or invalid Steam ID.");
      }
    } catch (err) {
      const message =
        err &&
        typeof err === "object" &&
        "message" in err &&
        typeof (err as { message?: unknown }).message === "string"
          ? (err as { message: string }).message
          : String(err);
      setError("Failed to fetch games. Error; " + message);
      console.error("Error fetching games:", err);
    }
    setLoading(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchGames(steamId);
  };

  const fetchPatchNotes = async (
    appid: number,
    amount_of_events = 3,
    event_type_filter = "13,14"
  ): Promise<PatchNote[]> => {
    try {
      const res = await fetch(
        `/api/getPatchNotes?appid=${appid}&amount_of_events=${amount_of_events}&event_type_filter=${event_type_filter}`
      );
      const data = await res.json();
      return data.patchNotes || [];
    } catch {
      console.error(`Failed to fetch patch note for appid ${appid}.`);
      return [];
    }
  };

  // Min-heap implementation for top N most recent patch notes by posttime
  class MinHeap {
    heap: MajorUpdateNote[] = [];
    maxSize: number;
    constructor(maxSize: number) {
      this.maxSize = maxSize;
    }
    push(note: MajorUpdateNote) {
      if (this.heap.length < this.maxSize) {
        this.heap.push(note);
        this.bubbleUp(this.heap.length - 1);
      } else if (this.compare(note, this.heap[0]) > 0) {
        this.heap[0] = note;
        this.bubbleDown(0);
      }
    }
    compare(a: MajorUpdateNote, b: MajorUpdateNote) {
      const at = a.announcement_body?.posttime || 0;
      const bt = b.announcement_body?.posttime || 0;
      return at - bt;
    }
    bubbleUp(idx: number) {
      while (idx > 0) {
        const parent = Math.floor((idx - 1) / 2);
        if (this.compare(this.heap[idx], this.heap[parent]) < 0) {
          [this.heap[idx], this.heap[parent]] = [
            this.heap[parent],
            this.heap[idx],
          ];
          idx = parent;
        } else break;
      }
    }
    bubbleDown(idx: number) {
      const n = this.heap.length;
      while (true) {
        let smallest = idx;
        const left = 2 * idx + 1;
        const right = 2 * idx + 2;
        if (left < n && this.compare(this.heap[left], this.heap[smallest]) < 0)
          smallest = left;
        if (
          right < n &&
          this.compare(this.heap[right], this.heap[smallest]) < 0
        )
          smallest = right;
        if (smallest !== idx) {
          [this.heap[idx], this.heap[smallest]] = [
            this.heap[smallest],
            this.heap[idx],
          ];
          idx = smallest;
        } else break;
      }
    }
    getSortedDesc(): MajorUpdateNote[] {
      // Return sorted descending (newest first)
      return [...this.heap].sort(
        (a, b) =>
          (b.announcement_body?.posttime || 0) -
          (a.announcement_body?.posttime || 0)
      );
    }
  }

  // Helper to extract the imgur from jsondata
  function getTitleImageFromJsonData(
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
        // Steam CDN with subfolder (e.g. <clanid>/<hash>)
        if (clanid && /^[a-f0-9]{40}\.(png|jpg|jpeg)$/i.test(hash)) {
          return `https://clan.cloudflare.steamstatic.com/images/${clanid}/${hash}`;
        }
        if (/^[0-9]+\/[a-f0-9]{40}\.(png|jpg|jpeg)$/i.test(hash)) {
          return `https://clan.cloudflare.steamstatic.com/images/${hash}`;
        }
        // 40 hex chars, no folder, fallback to old logic
        if (/^[a-f0-9]{40}\.(png|jpg|jpeg)$/i.test(hash)) {
          return `https://clan.cloudflare.steamstatic.com/images/${hash}`;
        }
        // 32 hex chars, Valve CDN
        if (/^[a-f0-9]{32}\.(png|jpg|jpeg)$/i.test(hash)) {
          return `https://media.steampowered.com/steamcommunity/public/images/clans/${hash}`;
        }
        // Imgur-style
        if (/^[a-zA-Z0-9]+\.(png|jpg|jpeg|gif)$/i.test(hash)) {
          return `https://i.imgur.com/${hash}`;
        }
        // Fallback: try Steam CDN
        return `https://clan.cloudflare.steamstatic.com/images/${hash}`;
      }
      // If localized_title_image is empty, try localized_capsule_image
      arr = obj.localized_capsule_image;
      if (Array.isArray(arr) && arr[0]) {
        const hash = arr[0];
        if (/^https?:\/\//.test(hash)) {
          return hash;
        }
        // Steam CDN with subfolder (e.g. <clanid>/<hash>)
        if (clanid && /^[a-f0-9]{40}\.(png|jpg|jpeg)$/i.test(hash)) {
          return `https://clan.cloudflare.steamstatic.com/images/${clanid}/${hash}`;
        }
        if (/^[0-9]+\/[a-f0-9]{40}\.(png|jpg|jpeg)$/i.test(hash)) {
          return `https://clan.cloudflare.steamstatic.com/images/${hash}`;
        }
        // 40 hex chars, no folder, fallback to old logic
        if (/^[a-f0-9]{40}\.(png|jpg|jpeg)$/i.test(hash)) {
          return `https://clan.cloudflare.steamstatic.com/images/${hash}`;
        }
        // 32 hex chars, Valve CDN
        if (/^[a-f0-9]{32}\.(png|jpg|jpeg)$/i.test(hash)) {
          return `https://media.steampowered.com/steamcommunity/public/images/clans/${hash}`;
        }
        // Imgur-style
        if (/^[a-zA-Z0-9]+\.(png|jpg|jpeg|gif)$/i.test(hash)) {
          return `https://i.imgur.com/${hash}`;
        }
        // Fallback: try Steam CDN
        return `https://clan.cloudflare.steamstatic.com/images/${hash}`;
      }
    } catch {
      // ignore
    }
    return null;
  }

  const handlePatchTabClick = async () => {
    setActiveTab(2);
    if (hasFetchedPatches || games.length === 0 || patchNotesLoading) return;
    setPatchNotesLoading(true);

    const topGames = [...games]
      .sort((a, b) => b.playtime_forever - a.playtime_forever)
      .slice(0, 40);

    const patched = await Promise.all(
      topGames.map(async (game) => {
        const patchNotes = await fetchPatchNotes(game.appid);
        return { ...game, patchNotes };
      })
    );

    setPatchNotes(patched);
    setHasFetchedPatches(true);
    setPatchNotesLoading(false);
    console.log("Patch notes fetched:", patched);
  };

  const handleMajorUpdatesTabClick = async () => {
    setMajorUpdatesError("");
    setRecentMajorUpdates([]); // Clear the list immediately for visual refresh
    setMajorUpdatesLoading(true);
    setMajorUpdatesProgress(0);
    try {
      const topGames = [...games];
      const heap = new MinHeap(100); // Keep only top 100 most recent
      const seen = new Set<string>(); // Track by gid+appid
      let completed = 0;
      await Promise.all(
        topGames.map(async (game) => {
          const notes = await fetchPatchNotes(game.appid, 3, "13,14");
          notes.forEach((note) => {
            if (note.announcement_body && note.announcement_body.posttime) {
              const key = `${note.gid}_${note.appid}`;
              if (!seen.has(key)) {
                seen.add(key);
                heap.push({ ...note, gameName: game.name });
              }
            }
          });
          completed++;
          setMajorUpdatesProgress(completed);
        })
      );
      setRecentMajorUpdates(heap.getSortedDesc());
    } catch {
      setMajorUpdatesError("Failed to load major updates.");
    }
    setMajorUpdatesLoading(false);
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
          <button
            onClick={() => setActiveTab(1)}
            disabled={games.length === 0 || loading}
          >
            Games List
          </button>
          <button
            onClick={handlePatchTabClick}
            disabled={games.length === 0 || loading || patchNotesLoading}
          >
            Patch Notes
          </button>
          <button
            onClick={() => setActiveTab(3)}
            disabled={games.length === 0 || loading}
          >
            Recent Major Updates
          </button>
        </div>

        {patchNotesLoading && <p>Loading patch notes...</p>}

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
            <h2>Latest Patch Notes (Top 40 Played Games)</h2>
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
                      {game.patchNotes.map((note) => {
                        const patchDate = note.announcement_body?.posttime
                          ? new Date(
                              note.announcement_body.posttime * 1000
                            ).toLocaleString()
                          : note.rtime32_start_time
                          ? new Date(
                              note.rtime32_start_time * 1000
                            ).toLocaleString()
                          : null;
                        const expanded = expandedNotes.has(note.gid);
                        return (
                          <div key={note.gid} className="mb-4">
                            <div
                              style={{
                                position: "relative",
                                textAlign: "center",
                                cursor: "pointer",
                              }}
                              onClick={() => toggleNote(note.gid)}
                              tabIndex={0}
                              role="button"
                              aria-pressed={expanded}
                            >
                              <div style={{ position: "relative" }}>
                                {/* Event name overlay */}
                                <div
                                  style={{
                                    position: "absolute",
                                    top: 0,
                                    left: 0,
                                    width: "100%",
                                    height: "100%",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    zIndex: 2,
                                    pointerEvents: "none",
                                    color: "#fff",
                                    fontWeight: "bold",
                                    fontSize: "1.5rem",
                                    textShadow:
                                      "0 2px 8px #000, 0 0 2px #000, 0 0 8px #000",
                                  }}
                                >
                                  {note.event_name}
                                </div>
                                {getTitleImageFromJsonData(
                                  note.jsondata,
                                  note.announcement_body?.clanid
                                ) && (
                                  <img
                                    src={
                                      getTitleImageFromJsonData(
                                        note.jsondata,
                                        note.announcement_body?.clanid
                                      ) as string
                                    }
                                    alt="Patch Title"
                                    style={{
                                      maxWidth: "100%",
                                      margin: "1rem auto 0 auto",
                                      display: "block",
                                    }}
                                  />
                                )}
                                {/* Date overlay at bottom of image */}
                                <div
                                  style={{
                                    position: "absolute",
                                    left: 0,
                                    bottom: 0,
                                    width: "100%",
                                    background: "rgba(0,0,0,0.5)",
                                    color: "#fff",
                                    fontSize: "0.95rem",
                                    padding: "2px 0",
                                    zIndex: 3,
                                    textAlign: "center",
                                  }}
                                >
                                  {patchDate}
                                </div>
                              </div>
                            </div>
                            {expanded && (
                              <div
                                className="bg-[#3a3c42] text-white rounded-md p-4 shadow-sm border border-gray-600 transition"
                                style={{ marginTop: 8 }}
                              >
                                <div
                                  className="text-sm"
                                  dangerouslySetInnerHTML={{
                                    __html: parseBBCode(
                                      note.announcement_body?.body ||
                                        "No body text."
                                    ),
                                  }}
                                />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 3 && (
          <div>
            <h2>Recent Major Updates (All Games)</h2>
            <button
              onClick={handleMajorUpdatesTabClick}
              disabled={majorUpdatesLoading}
              style={{ marginBottom: 16 }}
            >
              Fetch patches
            </button>
            {majorUpdatesLoading && (
              <p>
                Loading... {majorUpdatesProgress} / {games.length} games
              </p>
            )}
            {majorUpdatesError && (
              <p style={{ color: "red" }}>{majorUpdatesError}</p>
            )}
            <ul
              ref={majorUpdatesListRef}
              style={{
                listStyle: "none",
                padding: 0,
                maxWidth: 600,
                margin: "auto",
                minHeight: 200,
                maxHeight: 1000,
                overflowY: "auto",
                paddingLeft: 16,
                paddingRight: 16,
                resize: "vertical",
              }}
            >
              {recentMajorUpdates
                .slice(
                  majorUpdatesPage * MAJOR_UPDATES_PER_PAGE,
                  (majorUpdatesPage + 1) * MAJOR_UPDATES_PER_PAGE
                )
                .map((note) => {
                  const patchDate = note.announcement_body?.posttime
                    ? new Date(
                        note.announcement_body.posttime * 1000
                      ).toLocaleString()
                    : note.rtime32_start_time
                    ? new Date(note.rtime32_start_time * 1000).toLocaleString()
                    : null;
                  const expanded = expandedNotes.has(note.gid);
                  return (
                    <li
                      key={note.gid}
                      style={{
                        padding: "1rem 0",
                        borderBottom: "1px solid #ccc",
                      }}
                    >
                      <div
                        style={{
                          position: "relative",
                          textAlign: "center",
                          cursor: "pointer",
                        }}
                        onClick={() => toggleNote(note.gid)}
                        tabIndex={0}
                        role="button"
                        aria-pressed={expanded}
                      >
                        <div style={{ position: "relative" }}>
                          {/* Event name overlay */}
                          <div
                            style={{
                              position: "absolute",
                              top: 0,
                              left: 0,
                              width: "100%",
                              height: "100%",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              zIndex: 2,
                              pointerEvents: "none",
                              color: "#fff",
                              fontWeight: "bold",
                              fontSize: "1.5rem",
                              textShadow:
                                "0 2px 8px #000, 0 0 2px #000, 0 0 8px #000",
                            }}
                          >
                            {note.event_name}
                          </div>
                          {getTitleImageFromJsonData(
                            note.jsondata,
                            note.announcement_body?.clanid
                          ) && (
                            <img
                              src={
                                getTitleImageFromJsonData(
                                  note.jsondata,
                                  note.announcement_body?.clanid
                                ) as string
                              }
                              alt="Patch Title"
                              style={{
                                maxWidth: "100%",
                                margin: "1rem auto 0 auto",
                                display: "block",
                              }}
                            />
                          )}
                          {/* Date overlay at bottom of image */}
                          <div
                            style={{
                              position: "absolute",
                              left: 0,
                              bottom: 0,
                              width: "100%",
                              background: "rgba(0,0,0,0.5)",
                              color: "#fff",
                              fontSize: "0.95rem",
                              padding: "2px 0",
                              zIndex: 3,
                              textAlign: "center",
                            }}
                          >
                            {patchDate}
                          </div>
                        </div>
                      </div>
                      {expanded && (
                        <div
                          className="bg-[#3a3c42] text-white rounded-md p-4 shadow-sm border border-gray-600 transition"
                          style={{ marginTop: 8 }}
                        >
                          <div
                            className="text-sm"
                            dangerouslySetInnerHTML={{
                              __html: parseBBCode(
                                note.announcement_body?.body ||
                                  note.event_notes ||
                                  "No body text."
                              ),
                            }}
                          />
                        </div>
                      )}
                    </li>
                  );
                })}
            </ul>
            <div
              style={{
                marginTop: 16,
                display: "flex",
                justifyContent: "center",
                gap: 8,
              }}
            >
              <button
                onClick={() => {
                  setMajorUpdatesPage((p) => Math.max(0, p - 1));
                  if (majorUpdatesListRef.current)
                    majorUpdatesListRef.current.scrollTop = 0;
                }}
                disabled={majorUpdatesPage === 0}
              >
                Previous
              </button>
              <span>
                Page {majorUpdatesPage + 1} /{" "}
                {Math.ceil(
                  recentMajorUpdates.length / MAJOR_UPDATES_PER_PAGE
                ) || 1}
              </span>
              <button
                onClick={() => {
                  setMajorUpdatesPage((p) =>
                    p + 1 <
                    Math.ceil(
                      recentMajorUpdates.length / MAJOR_UPDATES_PER_PAGE
                    )
                      ? p + 1
                      : p
                  );
                  if (majorUpdatesListRef.current)
                    majorUpdatesListRef.current.scrollTop = 0;
                }}
                disabled={
                  majorUpdatesPage + 1 >=
                  Math.ceil(recentMajorUpdates.length / MAJOR_UPDATES_PER_PAGE)
                }
              >
                Next
              </button>
            </div>
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
