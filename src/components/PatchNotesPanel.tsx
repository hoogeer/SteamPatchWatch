
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

interface GameData {
  appid: number;
  name: string;
  playtime_forever: number;
  img_icon_url: string;
}

interface PatchNote {
  id: string;
  title: string;
  date: string;
  version: string;
  type: 'major' | 'minor' | 'hotfix' | 'content';
  summary: string;
  content: string;
  imageUrl?: string;
  downloadUrl?: string;
  size?: string;
}

interface PatchNotesPanelProps {
  game: GameData;
  onClose: () => void;
}

const PatchNotesPanel: React.FC<PatchNotesPanelProps> = ({ game, onClose }) => {
  const [patchNotes, setPatchNotes] = useState<PatchNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedNotes, setExpandedNotes] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchPatchNotes = async () => {
      setLoading(true);
      
      // Simulate API call with mock data
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      const mockPatchNotes: PatchNote[] = [
        {
          id: '1',
          title: 'Major Winter Update 2024',
          date: '2024-01-15',
          version: '2.4.0',
          type: 'major',
          summary: 'Introducing new winter maps, weapon balancing, and performance improvements.',
          content: `This major update brings exciting new content and improvements:

🗺️ **NEW MAPS**
• Winter Palace - A snow-covered tactical map perfect for close-quarters combat
• Frozen Harbor - Large-scale battles in an icy port environment
• Arctic Base - Underground facility with multiple levels

⚖️ **WEAPON BALANCING**
• Assault Rifle damage reduced by 5%
• Sniper rifle scope time decreased by 0.2s
• Shotgun spread pattern improved for better consistency

🔧 **PERFORMANCE IMPROVEMENTS**
• Reduced loading times by up to 30%
• Fixed memory leaks affecting long gaming sessions
• Optimized rendering for better FPS on older hardware

🐛 **BUG FIXES**
• Fixed player models clipping through certain walls
• Resolved audio desync issues in multiplayer
• Fixed achievement unlock problems`,
          imageUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&h=400&fit=crop',
          downloadUrl: '#',
          size: '2.3 GB'
        },
        {
          id: '2',
          title: 'Balance Hotfix',
          date: '2024-01-08',
          version: '2.3.2',
          type: 'hotfix',
          summary: 'Quick fixes for gameplay balance issues reported by the community.',
          content: `Emergency hotfix addressing critical balance issues:

⚡ **QUICK FIXES**
• Fixed overpowered weapon damage in last update
• Adjusted spawn points on newly released maps
• Resolved server stability issues during peak hours

🎯 **WEAPON ADJUSTMENTS**
• SMG damage reduced by 8%
• Pistol accuracy improved at medium range
• Fixed reload animation timing issues

🛡️ **STABILITY**
• Improved anti-cheat detection
• Fixed rare crash when loading certain maps
• Better connection handling for high-latency players`,
          size: '150 MB'
        },
        {
          id: '3',
          title: 'Holiday Content Pack',
          date: '2023-12-20',
          version: '2.3.0',
          type: 'content',
          summary: 'Festive skins, holiday-themed maps, and special event modes.',
          content: `Get into the holiday spirit with new festive content:

🎄 **HOLIDAY CONTENT**
• 15 new festive weapon skins
• Holiday-themed player emotes and victory dances
• Special snow effects on all maps during event period

🎮 **EVENT MODES**
• Snowball Fight - Special limited-time game mode
• Present Hunt - Find hidden gifts across maps for rewards
• Holiday Mayhem - Faster respawns and special weapons

🎁 **REWARDS**
• Complete daily challenges for exclusive holiday items
• Special holiday crates with rare cosmetics
• Login rewards throughout the event period`,
          imageUrl: 'https://images.unsplash.com/photo-1512389098783-66b81f86e199?w=800&h=400&fit=crop',
          size: '1.8 GB'
        }
      ];
      
      setPatchNotes(mockPatchNotes);
      setLoading(false);
    };

    fetchPatchNotes();
  }, [game.appid]);

  const toggleExpanded = (noteId: string) => {
    const newExpanded = new Set(expandedNotes);
    if (newExpanded.has(noteId)) {
      newExpanded.delete(noteId);
    } else {
      newExpanded.add(noteId);
    }
    setExpandedNotes(newExpanded);
  };

  const getTypeIcon = (type: PatchNote['type']) => {
    switch (type) {
      case 'major': return <Zap className="h-4 w-4" />;
      case 'minor': return <Wrench className="h-4 w-4" />;
      case 'hotfix': return <Bug className="h-4 w-4" />;
      case 'content': return <Plus className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: PatchNote['type']) => {
    switch (type) {
      case 'major': return 'bg-purple-600/20 text-purple-400 border-purple-500/30';
      case 'minor': return 'bg-blue-600/20 text-blue-400 border-blue-500/30';
      case 'hotfix': return 'bg-red-600/20 text-red-400 border-red-500/30';
      case 'content': return 'bg-green-600/20 text-green-400 border-green-500/30';
      default: return 'bg-gray-600/20 text-gray-400 border-gray-500/30';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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
                const isExpanded = expandedNotes.has(note.id);
                return (
                  <Card key={note.id} className="bg-slate-700/30 border-slate-600">
                    <Collapsible>
                      <CollapsibleTrigger asChild>
                        <CardHeader 
                          className="cursor-pointer hover:bg-slate-700/20 transition-colors"
                          onClick={() => toggleExpanded(note.id)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <Badge className={getTypeColor(note.type)}>
                                {getTypeIcon(note.type)}
                                <span className="ml-1 capitalize">{note.type}</span>
                              </Badge>
                              <div>
                                <h3 className="font-semibold text-white">{note.title}</h3>
                                <div className="flex items-center space-x-4 text-sm text-slate-400 mt-1">
                                  <span className="flex items-center space-x-1">
                                    <Calendar className="h-3 w-3" />
                                    <span>{formatDate(note.date)}</span>
                                  </span>
                                  <span>Version {note.version}</span>
                                  {note.size && (
                                    <span className="flex items-center space-x-1">
                                      <Download className="h-3 w-3" />
                                      <span>{note.size}</span>
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            {isExpanded ? (
                              <ChevronUp className="h-5 w-5 text-slate-400" />
                            ) : (
                              <ChevronDown className="h-5 w-5 text-slate-400" />
                            )}
                          </div>
                          <p className="text-slate-300 text-left mt-2">{note.summary}</p>
                        </CardHeader>
                      </CollapsibleTrigger>

                      <CollapsibleContent>
                        <CardContent className="pt-0 pb-4">
                          {note.imageUrl && (
                            <img
                              src={note.imageUrl}
                              alt={note.title}
                              className="w-full h-48 object-cover rounded-lg mb-4"
                            />
                          )}
                          
                          <div className="prose prose-invert max-w-none">
                            <pre className="whitespace-pre-wrap text-sm text-slate-300 font-sans leading-relaxed">
                              {note.content}
                            </pre>
                          </div>

                          {note.downloadUrl && (
                            <div className="mt-4 pt-4 border-t border-slate-600">
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-blue-400 border-blue-500/50 hover:bg-blue-500/10"
                                onClick={() => window.open(note.downloadUrl, '_blank')}
                              >
                                <ExternalLink className="h-4 w-4 mr-2" />
                                View Full Patch Notes
                              </Button>
                            </div>
                          )}
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
