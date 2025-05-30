import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Gamepad2, Search, Settings, User, Key, AlertCircle, CheckCircle2, Zap, Star } from 'lucide-react';
import SteamUserForm from './SteamUserForm';
import GameLibrary from './GameLibrary';
import PatchNotesPanel from './PatchNotesPanel';
import RecentPatchFeed from './RecentPatchFeed';
import SpecificPatchNoteModal from './SpecificPatchNoteModal';
import { useToast } from '@/hooks/use-toast';

interface SteamUser {
  steamid: string;
  personaname: string;
  avatarfull: string;
  profileurl: string;
}

interface GameData {
  appid: number;
  name: string;
  playtime_forever: number;
  img_icon_url: string;
  has_community_visible_stats?: boolean;
}

interface RecentPatchNote {
  id: string;
  gameAppId: number;
  gameName: string;
  gameIcon: string;
  title: string;
  date: string;
  version: string;
  type: 'major' | 'minor' | 'hotfix' | 'content';
  summary: string;
  size?: string;
  fullContent?: string;
}

const Dashboard = () => {
  const [steamUser, setSteamUser] = useState<SteamUser | null>(null);
  const [games, setGames] = useState<GameData[]>([]);
  const [selectedGame, setSelectedGame] = useState<GameData | null>(null);
  const [selectedPatchNote, setSelectedPatchNote] = useState<RecentPatchNote | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleUserSubmit = async (steamId: string, apiKey?: string) => {
    console.log('Fetching Steam user data for:', steamId);
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API call - In a real app, this would be proxied through your backend
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock successful response
      const mockUser: SteamUser = {
        steamid: '76561198123456789',
        personaname: 'GamerTag123',
        avatarfull: 'https://avatars.steamstatic.com/b5bd56c1aa4644fccb9e7ac5baf1e8c7a5a1e8_full.jpg',
        profileurl: 'https://steamcommunity.com/profiles/76561198123456789/'
      };

      const mockGames: GameData[] = [
        {
          appid: 730,
          name: 'Counter-Strike 2',
          playtime_forever: 2847,
          img_icon_url: 'c4b7e93b-3e5f-4b5e-9f2e-8a7d6c5b4a3f',
          has_community_visible_stats: true
        },
        {
          appid: 570,
          name: 'Dota 2',
          playtime_forever: 1523,
          img_icon_url: 'a2c4f8d9-7e1b-4c6a-8f3e-5d9a7b2c1e8f'
        },
        {
          appid: 1172470,
          name: 'Apex Legends',
          playtime_forever: 987,
          img_icon_url: 'f7b3d5a1-9c8e-4f2a-b6d7-3a9c8f5e2b1d'
        },
        {
          appid: 271590,
          name: 'Grand Theft Auto V',
          playtime_forever: 654,
          img_icon_url: 'e8a9f2d3-4c7b-5e1f-9a8d-6f3e8a9c2b5d'
        }
      ];

      setSteamUser(mockUser);
      setGames(mockGames.sort((a, b) => b.playtime_forever - a.playtime_forever));
      
      toast({
        title: "Success!",
        description: `Connected to ${mockUser.personaname}'s Steam account`,
      });
    } catch (err) {
      const errorMessage = 'Failed to fetch Steam data. Please check your Steam ID and API key.';
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

  const formatPlaytime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    return `${hours.toLocaleString()} hours`;
  };

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
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
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-pink-500/20 rounded-2xl blur-xl"></div>
            <p className="relative text-xl text-gray-200 max-w-3xl mx-auto p-6 glass-effect rounded-2xl">
              Experience the next generation of patch tracking. Monitor updates for your Steam games with our sleek, modern interface featuring real-time notifications and detailed patch analysis.
            </p>
          </div>
        </div>

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

        {/* User Profile, Games, and Recent Updates */}
        {steamUser && (
          <>
            {/* Recent Patch Feed - Full width at top */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded-3xl blur-xl"></div>
              <div className="relative">
                <RecentPatchFeed 
                  games={games} 
                  onGameSelect={setSelectedGame}
                  onPatchSelect={setSelectedPatchNote}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* User Profile */}
              <div className="lg:col-span-1">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-3xl blur-xl"></div>
                  <Card className="relative glass-effect border-green-400/30 backdrop-blur-xl sticky top-4 slide-in">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-3 text-white">
                        <div className="p-2 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg">
                          <CheckCircle2 className="h-5 w-5" />
                        </div>
                        <span className="text-xl font-bold">Gaming Profile</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="flex items-center space-x-4">
                        <div className="relative">
                          <img 
                            src={steamUser.avatarfull} 
                            alt={steamUser.personaname}
                            className="w-20 h-20 rounded-full border-4 border-gradient-to-r from-cyan-400 to-purple-400 neon-glow"
                          />
                          <div className="absolute -bottom-2 -right-2 p-1 bg-gradient-to-r from-green-400 to-blue-400 rounded-full">
                            <Star className="h-4 w-4 text-white" />
                          </div>
                        </div>
                        <div>
                          <h3 className="font-bold text-xl text-white">{steamUser.personaname}</h3>
                          <p className="text-cyan-300 font-medium">Elite Gamer</p>
                        </div>
                      </div>
                      
                      <div className="space-y-4 pt-4 border-t border-purple-500/30">
                        <div className="flex items-center justify-between p-3 glass-effect rounded-xl">
                          <span className="text-gray-300 font-medium">Games Library:</span>
                          <Badge className="bg-gradient-to-r from-cyan-500 to-purple-500 text-white px-3 py-1 font-bold">
                            {games.length}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between p-3 glass-effect rounded-xl">
                          <span className="text-gray-300 font-medium">Total Hours:</span>
                          <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 font-bold">
                            {formatPlaytime(games.reduce((sum, game) => sum + game.playtime_forever, 0))}
                          </Badge>
                        </div>
                      </div>

                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full mt-6 glass-effect border-red-400/50 text-red-300 hover:bg-red-500/20 font-medium"
                        onClick={() => {
                          setSteamUser(null);
                          setGames([]);
                          setSelectedGame(null);
                          setSelectedPatchNote(null);
                        }}
                      >
                        <Zap className="h-4 w-4 mr-2" />
                        Disconnect
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Games Library */}
              <div className="lg:col-span-2">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-3xl blur-xl"></div>
                  <div className="relative">
                    <GameLibrary 
                      games={games}
                      selectedGame={selectedGame}
                      onGameSelect={setSelectedGame}
                      formatPlaytime={formatPlaytime}
                    />
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Patch Notes Panel */}
        {selectedGame && (
          <PatchNotesPanel 
            game={selectedGame}
            onClose={() => setSelectedGame(null)}
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
