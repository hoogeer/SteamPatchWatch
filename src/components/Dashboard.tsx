import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Gamepad2, Search, Settings, User, Key, AlertCircle, CheckCircle2, Zap, Star, Home, Library, TrendingUp } from 'lucide-react';
import SteamUserForm from './SteamUserForm';
import GameLibrary from './GameLibrary';
import PatchNotesPanel from './PatchNotesPanel';
import RecentPatchFeed from './RecentPatchFeed';
import SpecificPatchNoteModal from './SpecificPatchNoteModal';
import { useToast } from '@/hooks/use-toast';
import { MinHeap } from '@/utils/MinHeap';

interface SteamUser {
  steamid: string;
  personaname: string;
  avatar: string;
  avatarmedium: string;
  avatarfull: string;
  profileurl: string;
  communityvisibilitystate: number;
  profilestate?: number;
  commentpermission?: number;
  avatarhash?: string;
  lastlogoff?: number;
  personastate?: number;
  primaryclanid?: string;
  timecreated?: number;
  personastateflags?: number;
}

interface GameData {
  appid: number;
  name: string;
  playtime_forever: number;
  img_icon_url: string;
  has_community_visible_stats?: boolean;
  RecentPatchNotes?: RecentPatchNote[];
}

interface RecentPatchNote {
  gameAppId?: number;
  gameName: string;
  gameIcon: string;
  gid: string;
  appid: number;
  event_name: string;
  rtime32_start_time: number;
  rtime32_end_time: number;
  event_type: number;
  event_notes: string;
  jsondata: string;
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

const Dashboard = () => {
  const [steamUser, setSteamUser] = useState<SteamUser | null>(null);
  const [games, setGames] = useState<GameData[]>([]);
  const [selectedGame, setSelectedGame] = useState<GameData | null>(null);
  const [selectedPatchNote, setSelectedPatchNote] = useState<RecentPatchNote | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const [apiKey, setApiKey] = useState<string | undefined>(undefined);
  const [recentPatches, setRecentPatches] = useState<RecentPatchNote[]>([]);
  const fetchGamesAbortController = React.useRef<AbortController | null>(null);

const handleUserSubmit = async (steamId: string, apiKeyInput?: string) => {
  setApiKey(apiKeyInput);
  setLoading(true);
  setError(null);

  // Abort any previous fetches
  if (fetchGamesAbortController.current) {
    fetchGamesAbortController.current.abort();
  }
  fetchGamesAbortController.current = new AbortController();
  const abortSignal = fetchGamesAbortController.current.signal;

  try {
    // 1. Resolve vanity URL if needed
    let resolvedSteamId = steamId;
    if (!isSteamId64(steamId)) {
      const vanityId = await resolveVanityUrl(steamId, apiKey || "");
      if (!vanityId) {
        throw new Error('Failed to resolve Steam ID');
      }
      resolvedSteamId = vanityId;
    }

    // 2. Fetch user profile
    const profileRes = await fetch(`/api/getProfile?steamid=${encodeURIComponent(resolvedSteamId)}${apiKey ? `&key=${encodeURIComponent(apiKey)}` : ''}`);
    const profileData = await profileRes.json();
    if (!profileRes.ok || !profileData.player) {
      // Improved error handling for Steam API errors
      if (profileData.error && profileData.details) {
        throw new Error(`${profileData.error}: ${profileData.details}`);
      } else if (profileData.error) {
        throw new Error(profileData.error);
      } else {
        throw new Error('Failed to fetch Steam profile');
      }
    }
    const user = profileData.player;

    setSteamUser(user);
    
    toast({
      title: "Success!",
      description: `Connected to ${user.personaname}'s Steam account`,
    });

    // 3. Fetch games with retry and abort support
    let gamesRes, gamesData;
    let gamesFetchAttempts = 0;
    const maxGamesFetchRetries = 5; // Optional: limit retries to avoid infinite loop
    while (true) {
      try {
        gamesRes = await fetch(
          `/api/getGames?steamid=${encodeURIComponent(resolvedSteamId)}${apiKey ? `&key=${encodeURIComponent(apiKey)}` : ''}`,
          { signal: abortSignal }
        );
        gamesData = await gamesRes.json();
        if (gamesRes.ok && gamesData.response?.games) {
          break; // Success
        } else {
          throw new Error(gamesData.error || 'Failed to fetch games');
        }
      } catch (err) {
        if (abortSignal.aborted) {
          // Cancelled, exit loop
          return;
        }
        gamesFetchAttempts++;
        toast({
          title: "Retrying...",
          description: `Failed to fetch games. Retrying in 5 seconds... (${gamesFetchAttempts})`,
          variant: "destructive",
        });
        if (gamesFetchAttempts >= maxGamesFetchRetries) {
          throw new Error(gamesData?.error || 'Failed to fetch games after multiple attempts');
        }
        await new Promise((resolve) => setTimeout(resolve, 5000));
      }
    }
    const gamesList = gamesData.response.games.map((game: GameData) => ({
      appid: game.appid,
      name: game.name,
      playtime_forever: game.playtime_forever,
      img_icon_url: game.img_icon_url,
      has_community_visible_stats: game.has_community_visible_stats,
    }));

    setGames(gamesList.sort((a, b) => b.playtime_forever - a.playtime_forever));

  } catch (err: unknown) {
    const errorMessage =
      err && typeof err === "object" && "message" in err && typeof (err as { message?: unknown }).message === "string"
        ? (err as { message: string }).message
        : 'Failed to fetch Steam data. Please check your Steam ID and API key.';
    setError(errorMessage);
    toast({
      title: "Error",
      description: errorMessage,
      variant: "destructive",
    });
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  if (games.length > 0 && apiKey !== undefined) {
    fetchMajorUpdates();
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [games, apiKey]);

const fetchMajorUpdates = async () => {
  try {
    const topGames = [...games];
    const heap = new MinHeap(75); // Keep only top 100 most recent
    const seen = new Set<string>();
    let completed = 0;
    await Promise.all(
      topGames.map(async (game) => {
        const notes = await fetchPatchNotes(game.appid, 3, "13,14", game.name, game.img_icon_url, game.appid);
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
        //setMajorUpdatesProgress(completed);
      })
    );
    setRecentPatches(heap.getSortedDesc());
  } catch {
    setError("Failed to load major updates.");
  }
};

const fetchPatchNotes = async (
    appid: number,
    amount_of_events = 3,
    event_type_filter = "13,14",
    gameName?: string,
    gameIcon?: string,
    gameAppId?: number
  ): Promise<RecentPatchNote[]> => {
  try {
    const url = apiKey
      ? `/api/getPatchNotes?appid=${appid}&amount_of_events=${amount_of_events}&event_type_filter=${event_type_filter}&key=${encodeURIComponent(
          apiKey
        )}`
      : `/api/getPatchNotes?appid=${appid}&amount_of_events=${amount_of_events}&event_type_filter=${event_type_filter}`;
    const res = await fetch(url);
    const data = await res.json();
    // Attach gameName and gameIcon to each patch note
    return (data.patchNotes || []).map((note: RecentPatchNote) => ({
      ...note,
      gameName: gameName ?? "",
      gameIcon: gameIcon ?? "",
      gameAppId: gameAppId ?? 0,
      appid,
    }));
  }
  catch {
    console.error(`Failed to fetch patch note for appid ${appid}.`);
    return [];
  }
};

async function resolveVanityUrl(
    username: string,
    apiKey: string
  ): Promise<string | null> {
    try {
      const url = apiKey
        ? `/api/getSteamId?username=${encodeURIComponent(
            username
          )}&apiKey=${encodeURIComponent(apiKey)}`
        : `/api/getSteamId?username=${encodeURIComponent(username)}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.steamid) {
        return data.steamid;
      }
    } catch {
      // ignore
    }
    return null;
  }

  function isSteamId64(input: string) {
    return /^\d{17}$/.test(input);
  }

  const formatPlaytime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    return `${hours.toLocaleString()} hours`;
  };

  const handleGoHome = () => {
    if (fetchGamesAbortController.current) {
      fetchGamesAbortController.current.abort();
    }
    setSteamUser(null);
    setGames([]);
    setSelectedGame(null);
    setSelectedPatchNote(null);
    setError(null);
  };

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-6">
          <div className="flex items-center justify-center space-x-4">
            <div className="p-4 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-2xl neon-glow float-animation">
              <Gamepad2 className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent gradient-shift">
              SteamPatchWatch
            </h1>
          </div>
          {/* Only show description when no user is connected */}
          {!steamUser && (
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-pink-500/20 rounded-2xl blur-xl"></div>
              <p className="relative text-xl text-gray-200 max-w-3xl mx-auto p-6 glass-effect rounded-2xl">
                Experience the next generation of patch tracking. Monitor updates for your Steam games with our sleek, modern interface featuring real-time notifications and detailed patch analysis.
              </p>
            </div>
          )}
        </div>

        {/* User Connected Content - Moved closer to title */}
        {steamUser && (
          <>
            {/* Home Button - Moved up */}
            <div className="flex justify-end">
              <Button 
                variant="outline" 
                size="sm" 
                className="glass-effect border-cyan-400/50 text-cyan-300 hover:bg-cyan-500/20 font-medium"
                onClick={handleGoHome}
              >
                <Home className="h-4 w-4 mr-2" />
                Home
              </Button>
            </div>

            {/* Tabbed Content - Now responsive to browser height */}
            <div className="relative h-[calc(100vh-300px)] min-h-[500px]">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-cyan-500/10 rounded-3xl blur-xl"></div>
              <div className="relative glass-effect border-purple-500/30 backdrop-blur-xl rounded-3xl p-6 h-full flex flex-col">
                <Tabs defaultValue="updates" className="w-full flex flex-col h-full">
                  <TabsList className="grid w-full grid-cols-2 glass-effect bg-slate-800/50 border-slate-600 flex-shrink-0">
                    <TabsTrigger 
                      value="updates" 
                      className="data-[state=active]:bg-purple-600/50 data-[state=active]:text-white text-slate-300"
                    >
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Recent Updates
                    </TabsTrigger>
                    <TabsTrigger 
                      value="library" 
                      className="data-[state=active]:bg-purple-600/50 data-[state=active]:text-white text-slate-300"
                    >
                      <Library className="h-4 w-4 mr-2" />
                      Game Library
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="updates" className="mt-6 flex-1 overflow-hidden">
                    <RecentPatchFeed 
                      games={games} 
                      recentPatches={recentPatches}
                      onGameSelect={setSelectedGame}
                      onPatchSelect={setSelectedPatchNote}
                      apiKey={apiKey}
                    />
                  </TabsContent>
                  
                  <TabsContent value="library" className="mt-6 flex-1 overflow-hidden">
                    <GameLibrary 
                      games={games}
                      selectedGame={selectedGame}
                      onGameSelect={setSelectedGame}
                      formatPlaytime={formatPlaytime}
                    />
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </>
        )}

        {/* Steam User Form */}
        {!steamUser && (
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-cyan-500/10 rounded-3xl blur-xl"></div>
            <Card className="relative glass-effect border-purple-500/30 backdrop-blur-xl slide-in">
              <CardHeader>
                <CardTitle className="flex items-center space-x-3 text-white">
                  <div className="p-2 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-lg">
                    <User className="h-5 w-5" />
                  </div>
                  <span className="text-2xl font-bold">Connect Your Steam Universe</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <SteamUserForm onSubmit={handleUserSubmit} loading={loading} />
                
                {error && (
                  <Alert className="mt-4 border-red-400/50 bg-red-500/10 glass-effect">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-red-300">
                      {error}
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Patch Notes Panel */}
        {selectedGame && (
          <PatchNotesPanel 
            game={selectedGame}
            onClose={() => setSelectedGame(null)}
            apiKey={apiKey}
          />
        )}

        {/* Specific Patch Note Modal */}
        {selectedPatchNote && (
          <SpecificPatchNoteModal 
            patchNote={selectedPatchNote}
            onClose={() => setSelectedPatchNote(null)}
          />
        )}
      </div>
    </div>
  );
};

export default Dashboard;
