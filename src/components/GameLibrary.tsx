
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Clock, Star, TrendingUp } from 'lucide-react';

interface GameData {
  appid: number;
  name: string;
  playtime_forever: number;
  img_icon_url: string;
  has_community_visible_stats?: boolean;
}

interface GameLibraryProps {
  games: GameData[];
  selectedGame: GameData | null;
  onGameSelect: (game: GameData) => void;
  formatPlaytime: (minutes: number) => string;
}

const GameLibrary: React.FC<GameLibraryProps> = ({ 
  games, 
  selectedGame, 
  onGameSelect, 
  formatPlaytime 
}) => {
  const [searchTerm, setSearchTerm] = React.useState('');

  const filteredGames = games.filter(game =>
    game.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getGameIconUrl = (appid: number, iconHash: string) => {
    if (!iconHash) return '/placeholder.svg';
    return `https://media.steampowered.com/steamcommunity/public/images/apps/${appid}/${iconHash}.jpg`;
  };

  const getPlaytimeCategory = (minutes: number) => {
    const hours = minutes / 60;
    if (hours >= 1000) return { label: 'Veteran', color: 'bg-purple-600/20 text-purple-400', icon: Star };
    if (hours >= 500) return { label: 'Expert', color: 'bg-blue-600/20 text-blue-400', icon: TrendingUp };
    if (hours >= 100) return { label: 'Experienced', color: 'bg-green-600/20 text-green-400', icon: Clock };
    return { label: 'Casual', color: 'bg-gray-600/20 text-gray-400', icon: Clock };
  };

  return (
    <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-white">
          <span className="flex items-center space-x-2">
            <Search className="h-5 w-5" />
            <span>Your Game Library</span>
          </span>
          <Badge variant="secondary" className="bg-blue-600/20 text-blue-400">
            {filteredGames.length} games
          </Badge>
        </CardTitle>
        
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search your games..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-500"
          />
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {filteredGames.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No games found matching "{searchTerm}"</p>
            </div>
          ) : (
            filteredGames.map((game) => {
              const category = getPlaytimeCategory(game.playtime_forever);
              const CategoryIcon = category.icon;
              const isSelected = selectedGame?.appid === game.appid;
              
              return (
                <Card 
                  key={game.appid}
                  className={`cursor-pointer transition-all duration-200 hover:scale-[1.02] slide-in ${
                    isSelected 
                      ? 'bg-blue-600/20 border-blue-500 shadow-lg shadow-blue-500/20' 
                      : 'bg-slate-700/30 border-slate-600 hover:bg-slate-700/50 hover:border-slate-500'
                  }`}
                  onClick={() => onGameSelect(game)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-4">
                      {/* Game Icon */}
                      <div className="relative">
                        <img
                          src={getGameIconUrl(game.appid, game.img_icon_url)}
                          alt={game.name}
                          className="w-12 h-12 rounded-lg object-cover"
                          onError={(e) => {
                            e.currentTarget.src = '/placeholder.svg';
                          }}
                        />
                        {isSelected && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          </div>
                        )}
                      </div>

                      {/* Game Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-white truncate">{game.name}</h3>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge className={category.color} variant="secondary">
                            <CategoryIcon className="h-3 w-3 mr-1" />
                            {category.label}
                          </Badge>
                          <span className="text-sm text-slate-400">
                            {formatPlaytime(game.playtime_forever)}
                          </span>
                        </div>
                      </div>

                      {/* Stats Badge */}
                      {game.has_community_visible_stats && (
                        <Badge variant="outline" className="border-green-500/50 text-green-400">
                          Stats
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        {selectedGame && (
          <div className="mt-4 p-4 bg-blue-600/10 border border-blue-500/30 rounded-lg">
            <div className="flex items-center space-x-2 text-blue-400">
              <TrendingUp className="h-4 w-4" />
              <span className="text-sm font-medium">
                Selected: {selectedGame.name}
              </span>
            </div>
            <p className="text-sm text-slate-400 mt-1">
              Click below to view patch notes and updates for this game
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default GameLibrary;
