
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Gamepad2, Search, Settings, User, Key, AlertCircle, CheckCircle2 } from 'lucide-react';
import SteamUserForm from './SteamUserForm';
import GameLibrary from './GameLibrary';
import PatchNotesPanel from './PatchNotesPanel';
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

const Dashboard = () => {
  const [steamUser, setSteamUser] = useState<SteamUser | null>(null);
  const [games, setGames] = useState<GameData[]>([]);
  const [selectedGame, setSelectedGame] = useState<GameData | null>(null);
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
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-3">
            <div className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl">
              <Gamepad2 className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-blue-600 bg-clip-text text-transparent">
              SteamPatchWatch
            </h1>
          </div>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Track patch notes and major updates for your Steam games. Stay updated with the latest changes to your favorite titles.
          </p>
        </div>

        {/* Steam User Form */}
        {!steamUser && (
          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-white">
                <User className="h-5 w-5" />
                <span>Connect Your Steam Account</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <SteamUserForm onSubmit={handleUserSubmit} loading={loading} />
              
              {error && (
                <Alert className="mt-4 border-red-500/50 bg-red-500/10">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-red-400">
                    {error}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        )}

        {/* User Profile & Games */}
        {steamUser && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* User Profile */}
            <div className="lg:col-span-1">
              <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm sticky top-4">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-white">
                    <CheckCircle2 className="h-5 w-5 text-green-400" />
                    <span>Connected Profile</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <img 
                      src={steamUser.avatarfull} 
                      alt={steamUser.personaname}
                      className="w-16 h-16 rounded-full border-2 border-blue-500"
                    />
                    <div>
                      <h3 className="font-semibold text-white">{steamUser.personaname}</h3>
                      <p className="text-sm text-slate-400">Steam Profile</p>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-slate-700">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Games Found:</span>
                      <Badge variant="secondary" className="bg-blue-600/20 text-blue-400">
                        {games.length}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-slate-400">Total Playtime:</span>
                      <Badge variant="secondary" className="bg-purple-600/20 text-purple-400">
                        {formatPlaytime(games.reduce((sum, game) => sum + game.playtime_forever, 0))}
                      </Badge>
                    </div>
                  </div>

                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full mt-4"
                    onClick={() => {
                      setSteamUser(null);
                      setGames([]);
                      setSelectedGame(null);
                    }}
                  >
                    Disconnect
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Games Library */}
            <div className="lg:col-span-2">
              <GameLibrary 
                games={games}
                selectedGame={selectedGame}
                onGameSelect={setSelectedGame}
                formatPlaytime={formatPlaytime}
              />
            </div>
          </div>
        )}

        {/* Patch Notes Panel */}
        {selectedGame && (
          <PatchNotesPanel 
            game={selectedGame}
            onClose={() => setSelectedGame(null)}
          />
        )}
      </div>
    </div>
  );
};

export default Dashboard;
