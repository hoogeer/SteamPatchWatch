import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  Loader2, 
  FileText, 
  ExternalLink,
  Zap,
  TrendingUp,
  Clock
} from 'lucide-react';

interface GameData {
  appid: number;
  name: string;
  playtime_forever: number;
  img_icon_url: string;
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

interface RecentPatchFeedProps {
  games: GameData[];
  onGameSelect: (game: GameData) => void;
  onPatchSelect: (patchNote: RecentPatchNote) => void;
}

const RecentPatchFeed: React.FC<RecentPatchFeedProps> = ({ games, onGameSelect, onPatchSelect }) => {
  const [recentPatches, setRecentPatches] = useState<RecentPatchNote[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecentPatches = async () => {
      if (games.length === 0) return;
      
      setLoading(true);
      
      // Simulate API call with mock data for recent patches across all games
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockRecentPatches: RecentPatchNote[] = [
        {
          id: 'cs2-major-1',
          gameAppId: 730,
          gameName: 'Counter-Strike 2',
          gameIcon: 'c4b7e93b-3e5f-4b5e-9f2e-8a7d6c5b4a3f',
          title: 'Winter Update 2024',
          date: '2024-01-15',
          version: '2.4.0',
          type: 'major',
          summary: 'New winter maps, weapon balancing, and performance improvements.',
          size: '2.3 GB',
          fullContent: `# Winter Update 2024\n\n## New Maps\n- de_winter: A snowy variant of the classic map\n- Winter collection featuring festive themes\n\n## Weapon Balancing\n- AK-47: Reduced recoil by 5%\n- M4A4: Increased damage falloff\n- AWP: Adjusted scope-in time\n\n## Performance Improvements\n- Optimized rendering for winter effects\n- Reduced memory usage by 15%\n- Fixed several crash issues`
        },
        {
          id: 'dota-content-1',
          gameAppId: 570,
          gameName: 'Dota 2',
          gameIcon: 'a2c4f8d9-7e1b-4c6a-8f3e-5d9a7b2c1e8f',
          title: 'New Hero: Kez',
          date: '2024-01-12',
          version: '7.37',
          type: 'major',
          summary: 'Introducing Kez, the latest hero with unique dual-weapon mechanics.',
          size: '1.1 GB',
          fullContent: `# New Hero: Kez\n\n## Hero Overview\nKez is a versatile melee hero who can switch between two weapon modes:\n\n### Katana Mode\n- High mobility and burst damage\n- Perfect for initiation and escape\n\n### Sai Mode\n- Defensive capabilities and sustain\n- Ideal for team fights and protection\n\n## Abilities\n1. **Falcon Rush** - Dash forward dealing damage\n2. **Echo Slam** - AoE disable in both modes\n3. **Kazurai Katana** - Weapon mastery passive\n4. **Shodo Sai** - Defensive stance ultimate`
        },
        {
          id: 'apex-major-1',
          gameAppId: 1172470,
          gameName: 'Apex Legends',
          gameIcon: 'f7b3d5a1-9c8e-4f2a-b6d7-3a9c8f5e2b1d',
          title: 'Season 19: Ignite',
          date: '2024-01-10',
          version: '19.0.0',
          type: 'major',
          summary: 'New legend Conduit, map updates to Kings Canyon, and ranked changes.',
          size: '8.2 GB',
          fullContent: `# Season 19: Ignite\n\n## New Legend: Conduit\n**Tactical:** Energy Barricade - Deploy an energy wall\n**Passive:** Savvy - Scan nearby enemies through walls\n**Ultimate:** Arc Flash - Team-wide speed and shield boost\n\n## Kings Canyon Updates\n- Reworked Artillery area\n- New rotation paths\n- Updated loot distribution\n\n## Ranked Changes\n- New tier: Apex Predator Master\n- Adjusted RP requirements\n- Improved matchmaking algorithms`
        },
        {
          id: 'gta-hotfix-1',
          gameAppId: 271590,
          gameName: 'Grand Theft Auto V',
          gameIcon: 'e8a9f2d3-4c7b-5e1f-9a8d-6f3e8a9c2b5d',
          title: 'GTA Online Security Update',
          date: '2024-01-08',
          version: '1.67.1',
          type: 'hotfix',
          summary: 'Security improvements and bug fixes for GTA Online.',
          size: '245 MB',
          fullContent: `# GTA Online Security Update\n\n## Security Improvements\n- Enhanced anti-cheat measures\n- Improved player reporting system\n- Fixed exploits in several missions\n\n## Bug Fixes\n- Resolved connection issues in public lobbies\n- Fixed vehicle duplication glitch\n- Corrected payout calculations for heists\n\n## Stability\n- Reduced crash frequency by 30%\n- Improved server stability during peak hours`
        },
        {
          id: 'cs2-hotfix-1',
          gameAppId: 730,
          gameName: 'Counter-Strike 2',
          gameIcon: 'c4b7e93b-3e5f-4b5e-9f2e-8a7d6c5b4a3f',
          title: 'Balance Hotfix',
          date: '2024-01-08',
          version: '2.3.2',
          type: 'hotfix',
          summary: 'Quick fixes for gameplay balance issues reported by the community.',
          size: '150 MB',
          fullContent: `# Balance Hotfix\n\n## Weapon Adjustments\n- Desert Eagle: Reduced one-shot headshot range\n- Galil AR: Slightly increased accuracy\n- Zeus: Fixed animation bug\n\n## Map Fixes\n- Mirage: Fixed pixel walk spots\n- Inferno: Adjusted smoke lineups\n- Dust2: Corrected collision issues\n\n## Gameplay\n- Fixed bomb defuse kit pickup bug\n- Improved server tick rate consistency\n- Resolved spectator mode issues`
        }
      ];
      
      // Filter patches to only include games that are in the user's library
      const userGameIds = new Set(games.map(game => game.appid));
      const filteredPatches = mockRecentPatches
        .filter(patch => userGameIds.has(patch.gameAppId))
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      setRecentPatches(filteredPatches);
      setLoading(false);
    };

    fetchRecentPatches();
  }, [games]);

  const getTypeIcon = (type: RecentPatchNote['type']) => {
    switch (type) {
      case 'major': return <Zap className="h-4 w-4" />;
      case 'minor': return <TrendingUp className="h-4 w-4" />;
      case 'hotfix': return <Clock className="h-4 w-4" />;
      case 'content': return <FileText className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: RecentPatchNote['type']) => {
    switch (type) {
      case 'major': return 'bg-purple-600/20 text-purple-400 border-purple-500/30';
      case 'minor': return 'bg-blue-600/20 text-blue-400 border-blue-500/30';
      case 'hotfix': return 'bg-red-600/20 text-red-400 border-red-500/30';
      case 'content': return 'bg-green-600/20 text-green-400 border-green-500/30';
      default: return 'bg-gray-600/20 text-gray-400 border-gray-500/30';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays} days ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getGameIconUrl = (appid: number, iconHash: string) => {
    if (!iconHash) return '/placeholder.svg';
    return `https://media.steampowered.com/steamcommunity/public/images/apps/${appid}/${iconHash}.jpg`;
  };

  const handlePatchClick = (patch: RecentPatchNote) => {
    onPatchSelect(patch);
  };

  if (games.length === 0) {
    return null;
  }

  return (
    <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-white">
          <TrendingUp className="h-5 w-5" />
          <span>Recent Major Updates</span>
          <Badge variant="secondary" className="bg-purple-600/20 text-purple-400">
            Latest
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center space-y-4">
              <Loader2 className="h-6 w-6 animate-spin mx-auto text-blue-400" />
              <p className="text-slate-400 text-sm">Loading recent updates...</p>
            </div>
          </div>
        ) : recentPatches.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <FileText className="h-8 w-8 mx-auto mb-3 opacity-50" />
            <p>No recent major updates found for your games</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {recentPatches.map((patch) => (
              <Card 
                key={patch.id}
                className="bg-slate-700/30 border-slate-600 hover:bg-slate-700/50 hover:border-slate-500 transition-all duration-200 cursor-pointer"
                onClick={() => handlePatchClick(patch)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    {/* Game Icon */}
                    <img
                      src={getGameIconUrl(patch.gameAppId, patch.gameIcon)}
                      alt={patch.gameName}
                      className="w-10 h-10 rounded object-cover flex-shrink-0"
                      onError={(e) => {
                        e.currentTarget.src = '/placeholder.svg';
                      }}
                    />

                    {/* Patch Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="font-medium text-white text-sm truncate">
                              {patch.title}
                            </h4>
                            <Badge className={getTypeColor(patch.type)} variant="secondary">
                              {getTypeIcon(patch.type)}
                              <span className="ml-1 capitalize">{patch.type}</span>
                            </Badge>
                          </div>
                          
                          <p className="text-xs text-slate-400 mb-1">{patch.gameName}</p>
                          <p className="text-sm text-slate-300 leading-relaxed">{patch.summary}</p>
                          
                          <div className="flex items-center space-x-3 mt-2 text-xs text-slate-400">
                            <span className="flex items-center space-x-1">
                              <Calendar className="h-3 w-3" />
                              <span>{formatDate(patch.date)}</span>
                            </span>
                            <span>v{patch.version}</span>
                            {patch.size && (
                              <span className="flex items-center space-x-1">
                                <ExternalLink className="h-3 w-3" />
                                <span>{patch.size}</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        
        {recentPatches.length > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-600">
            <p className="text-xs text-slate-400 text-center">
              Click on any update to view the detailed patch notes
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentPatchFeed;
