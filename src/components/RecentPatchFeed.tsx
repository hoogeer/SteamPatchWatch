
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MinHeap } from '@/utils/MinHeap';
import { 
  Calendar, 
  Loader2, 
  FileText, 
  TrendingUp
} from 'lucide-react';

interface GameData {
  appid: number;
  name: string;
  playtime_forever: number;
  img_icon_url: string;
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

interface RecentPatchFeedProps {
  games: GameData[];
  recentPatches: RecentPatchNote[];
  onGameSelect: (game: GameData) => void;
  onPatchSelect: (patchNote: RecentPatchNote) => void;
  apiKey?: string;
}

const RecentPatchFeed: React.FC<RecentPatchFeedProps> = ({ games, recentPatches, onGameSelect, onPatchSelect, apiKey}) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecentPatches = async () => {
      if (games.length === 0) return;
      
      setLoading(true);

      setLoading(false);
    };

    fetchRecentPatches();
  }, [games]);

  const formatDate = (dateInput: string | number) => {
    // If input is a number, treat it as a Unix timestamp (seconds)
    const date = typeof dateInput === 'number'
      ? new Date(dateInput * 1000)
      : new Date(dateInput);
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
    <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm h-full flex flex-col">
      <CardHeader className="flex-shrink-0">
        <CardTitle className="flex items-center space-x-2 text-white">
          <TrendingUp className="h-5 w-5" />
          <span>Recent Updates</span>
          <Badge variant="secondary" className="bg-purple-600/20 text-purple-400">
            Latest
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col min-h-0">
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
            <p>No recent updates found for your games</p>
          </div>
        ) : (
          <div className="space-y-3 flex-1 overflow-y-auto min-h-80">
            {recentPatches.map((patch) => (
              <Card 
                key={patch.gid}
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
                          <h4 className="font-medium text-white text-sm truncate mb-1">
                            {patch.announcement_body?.headline || patch.event_name}
                          </h4>
                          
                          <p className="text-xs text-slate-400 mb-1">{patch.gameName}</p>
                          
                          <div className="flex items-center space-x-3 mt-2 text-xs text-slate-400">
                            <span className="flex items-center space-x-1">
                              <Calendar className="h-3 w-3" />
                              <span>{formatDate(patch.announcement_body.posttime)}</span>
                            </span>
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
          <div className="mt-4 pt-4 border-t border-slate-600 flex-shrink-0">
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
