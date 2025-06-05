import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Clock, Star, TrendingUp, Zap, GamepadIcon } from 'lucide-react';

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
    if (hours >= 1000) return { 
      label: 'Legendary', 
      color: 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white', 
      icon: Star,
      glow: 'shadow-lg shadow-yellow-500/50'
    };
    if (hours >= 500) return { 
      label: 'Master', 
      color: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white', 
      icon: TrendingUp,
      glow: 'shadow-lg shadow-purple-500/50'
    };
    if (hours >= 100) return { 
      label: 'Expert', 
      color: 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white', 
      icon: Zap,
      glow: 'shadow-lg shadow-blue-500/50'
    };
    return { 
      label: 'Casual', 
      color: 'bg-gradient-to-r from-green-500 to-teal-500 text-white', 
      icon: Clock,
      glow: 'shadow-lg shadow-green-500/50'
    };
  };

  return (
    <Card className="glass-effect border-blue-400/30 backdrop-blur-xl slide-in">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-white">
          <span className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg">
              <GamepadIcon className="h-6 w-6" />
            </div>
            <span className="text-2xl font-bold">Game Arsenal</span>
          </span>
          <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-4 py-2 text-lg font-bold">
            {filteredGames.length}
          </Badge>
        </CardTitle>
        
        {/* Search Input */}
        <div className="relative mt-4">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-cyan-400" />
          <Input
            placeholder="Search your gaming library..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-12 glass-effect border-cyan-400/50 text-white placeholder:text-gray-400 focus:border-cyan-400 text-lg py-3"
          />
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4 max-h-72 overflow-y-auto overflow-x-hidden">
          {filteredGames.length === 0 ? (
            <div className="text-center py-8">
              <div className="p-4 glass-effect rounded-2xl">
                <Search className="h-12 w-12 mx-auto mb-4 text-cyan-400 opacity-50" />
                <p className="text-gray-300 text-lg">No games found matching "{searchTerm}"</p>
              </div>
            </div>
          ) : (
            filteredGames.map((game) => {
              const category = getPlaytimeCategory(game.playtime_forever);
              const CategoryIcon = category.icon;
              const isSelected = selectedGame?.appid === game.appid;
              
              return (
                <div key={game.appid} className="relative pr-2">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-cyan-500/10 rounded-2xl blur-lg"></div>
                  <Card 
                    className={`relative cursor-pointer transition-all duration-300 hover:scale-[1.01] slide-in ${
                      isSelected 
                        ? 'glass-effect border-cyan-400 shadow-xl shadow-cyan-500/30 neon-glow' 
                        : 'glass-effect border-purple-400/30 hover:border-purple-400/60 hover:shadow-lg hover:shadow-purple-500/20'
                    }`}
                    onClick={() => onGameSelect(game)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-4">
                        {/* Game Icon */}
                        <div className="relative flex-shrink-0">
                          <img
                            src={getGameIconUrl(game.appid, game.img_icon_url)}
                            alt={game.name}
                            className="w-12 h-12 rounded-lg object-cover border-2 border-cyan-400/50"
                            onError={(e) => {
                              e.currentTarget.src = '/placeholder.svg';
                            }}
                          />
                          {isSelected && (
                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full flex items-center justify-center neon-glow">
                              <div className="w-2 h-2 bg-white rounded-full"></div>
                            </div>
                          )}
                        </div>

                        {/* Game Info */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-white truncate text-base">{game.name}</h3>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge className={`${category.color} ${category.glow} px-2 py-0.5 text-xs font-bold`}>
                              <CategoryIcon className="h-3 w-3 mr-1" />
                              {category.label}
                            </Badge>
                            <span className="text-cyan-300 font-medium text-sm">
                              {formatPlaytime(game.playtime_forever)}
                            </span>
                          </div>
                        </div>

                        {/* Stats Badge */}
                        {game.has_community_visible_stats && (
                          <Badge className="bg-gradient-to-r from-green-500 to-teal-500 text-white px-2 py-0.5 text-xs font-bold flex-shrink-0">
                            <Star className="h-2 w-2 mr-1" />
                            Stats
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              );
            })
          )}
        </div>

        {selectedGame && (
          <div className="mt-4 p-4 glass-effect border border-cyan-400/50 rounded-2xl">
            <div className="flex items-center space-x-3 text-cyan-300">
              <TrendingUp className="h-4 w-4" />
              <span className="font-bold text-base">
                Active Selection: {selectedGame.name}
              </span>
            </div>
            <p className="text-gray-300 mt-1 text-sm">
              Ready to explore patch notes and updates for this epic title
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default GameLibrary;
