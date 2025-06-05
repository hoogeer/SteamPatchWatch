import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  X, 
  Calendar, 
  Download, 
  ExternalLink, 
  ChevronDown, 
  ChevronUp, 
  Loader2,
  FileText,
  Zap,
  Bug,
  Wrench,
  Plus
} from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { MinHeap } from '@/utils/MinHeap';
import BBCodeHelper from '@/utils/BBCodeHelper';

interface GameData {
  appid: number;
  name: string;
  playtime_forever: number;
  img_icon_url: string;
  has_community_visible_stats?: boolean;
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

interface PatchNotesPanelProps {
  game: GameData;
  onClose: () => void;
  apiKey?: string;
}

const PatchNotesPanel: React.FC<PatchNotesPanelProps> = ({ game, onClose, apiKey }) => {
  const [patchNotes, setPatchNotes] = useState<RecentPatchNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedNotes, setExpandedNotes] = useState<Set<string>>(new Set());

  useEffect(() => {
    const getPatchNotes = async () => {
      setLoading(true);
      
      // Simulate API call with mock data
      const heap = new MinHeap(3);
      const seen = new Set<string>();
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
      
      setPatchNotes(heap.getSortedDesc());
      setLoading(false);
    };

    getPatchNotes();
  }, [game]);

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

  const toggleExpanded = (noteId: string) => {
    const newExpanded = new Set(expandedNotes);
    if (newExpanded.has(noteId)) {
      newExpanded.delete(noteId);
    } else {
      newExpanded.add(noteId);
    }
    setExpandedNotes(newExpanded);
  };

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

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] bg-slate-800 border-slate-700 overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-slate-800 to-slate-700 border-b border-slate-600">
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center space-x-3">
              <img
                src={`https://media.steampowered.com/steamcommunity/public/images/apps/${game.appid}/${game.img_icon_url}.jpg`}
                alt={game.name}
                className="w-8 h-8 rounded"
                onError={(e) => {
                  e.currentTarget.src = '/placeholder.svg';
                }}
              />
              <span>{game.name} - Patch Notes</span>
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-slate-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center space-y-4">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-400" />
                <p className="text-slate-400">Loading patch notes...</p>
              </div>
            </div>
          ) : patchNotes.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto text-slate-500 mb-4" />
              <p className="text-slate-400">No patch notes available for this game.</p>
            </div>
          ) : (
            <div className="max-h-[60vh] overflow-y-auto p-6 space-y-4">
              {patchNotes.map((note) => {
                const noteId = note.gid || note.appid.toString();
                const isExpanded = expandedNotes.has(noteId);
                return (
                  <Card key={noteId} className="bg-slate-700/30 border-slate-600">
                    <Collapsible open={isExpanded} onOpenChange={() => toggleExpanded(noteId)}>
                      <CollapsibleTrigger asChild>
                        <CardHeader 
                          className="cursor-pointer hover:bg-slate-700/20 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div>
                                <h3 className="font-semibold text-white">{note.announcement_body.headline}</h3>
                                <div className="flex items-center space-x-4 text-sm text-slate-400 mt-1">
                                  <span className="flex items-center space-x-1">
                                    <Calendar className="h-3 w-3" />
                                    <span>{formatDate(note.announcement_body.posttime)}</span>
                                  </span>
                                </div>
                              </div>
                            </div>
                            {isExpanded ? (
                              <ChevronUp className="h-5 w-5 text-slate-400" />
                            ) : (
                              <ChevronDown className="h-5 w-5 text-slate-400" />
                            )}
                          </div>
                        </CardHeader>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <CardContent className="pt-0 pb-4">
                          <div style={{ color: 'white' }} className="prose prose-invert max-w-none">
                            {note.announcement_body.body ? (
                              <div
                                className="prose prose-invert max-w-none"
                                dangerouslySetInnerHTML={{
                                  __html: BBCodeHelper.parseBBCode(
                                    note.announcement_body?.body ||
                                      "No body text."
                                  ),
                                }}
                              />
                            ) : (
                              <div className="p-6 glass-effect rounded-2xl inline-block">
                                <FileText className="h-16 w-16 mx-auto mb-6 text-purple-400" />
                                <h3 className="text-2xl font-bold text-purple-300 mb-4">
                                  Detailed Content Unavailable
                                </h3>
                                <p className="text-gray-400 max-w-md mx-auto text-lg leading-relaxed">
                                  {note.announcement_body?.headline}
                                </p>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </CollapsibleContent>
                    </Collapsible>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PatchNotesPanel;
