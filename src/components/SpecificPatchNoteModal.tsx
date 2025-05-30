
import React from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  ExternalLink, 
  Zap, 
  TrendingUp, 
  Clock, 
  FileText,
  X,
  Sparkles,
  Star
} from 'lucide-react';

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

interface SpecificPatchNoteModalProps {
  patchNote: RecentPatchNote;
  onClose: () => void;
}

const SpecificPatchNoteModal: React.FC<SpecificPatchNoteModalProps> = ({ 
  patchNote, 
  onClose 
}) => {
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
      case 'major': return 'bg-gradient-to-r from-purple-500 to-pink-500 text-white';
      case 'minor': return 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white';
      case 'hotfix': return 'bg-gradient-to-r from-red-500 to-orange-500 text-white';
      case 'content': return 'bg-gradient-to-r from-green-500 to-teal-500 text-white';
      default: return 'bg-gradient-to-r from-gray-500 to-gray-600 text-white';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric',
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getGameIconUrl = (appid: number, iconHash: string) => {
    if (!iconHash) return '/placeholder.svg';
    return `https://media.steampowered.com/steamcommunity/public/images/apps/${appid}/${iconHash}.jpg`;
  };

  const formatContent = (content: string) => {
    // Simple markdown-like formatting with enhanced styling
    return content
      .split('\n')
      .map((line, index) => {
        if (line.startsWith('# ')) {
          return <h1 key={index} className="text-3xl font-bold text-white mt-8 mb-6 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">{line.slice(2)}</h1>;
        }
        if (line.startsWith('## ')) {
          return <h2 key={index} className="text-2xl font-semibold text-cyan-300 mt-6 mb-4 flex items-center"><Star className="h-5 w-5 mr-2" />{line.slice(3)}</h2>;
        }
        if (line.startsWith('### ')) {
          return <h3 key={index} className="text-xl font-medium text-purple-300 mt-4 mb-3 flex items-center"><Sparkles className="h-4 w-4 mr-2" />{line.slice(4)}</h3>;
        }
        if (line.startsWith('- ')) {
          return <li key={index} className="text-gray-300 ml-6 mb-2 flex items-start"><span className="text-cyan-400 mr-2">•</span>{line.slice(2)}</li>;
        }
        if (line.trim() === '') {
          return <br key={index} />;
        }
        return <p key={index} className="text-gray-300 mb-3 leading-relaxed">{line}</p>;
      });
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="glass-effect border-purple-500/50 text-white max-w-4xl max-h-[85vh] overflow-y-auto backdrop-blur-xl">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 via-cyan-600/10 to-pink-600/10 rounded-lg blur-xl"></div>
        <div className="relative">
          <DialogHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4 flex-1">
                <div className="relative">
                  <img
                    src={getGameIconUrl(patchNote.gameAppId, patchNote.gameIcon)}
                    alt={patchNote.gameName}
                    className="w-16 h-16 rounded-xl object-cover border-2 border-cyan-400/50"
                    onError={(e) => {
                      e.currentTarget.src = '/placeholder.svg';
                    }}
                  />
                  <div className="absolute -top-1 -right-1 p-1 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full">
                    <Sparkles className="h-3 w-3 text-white" />
                  </div>
                </div>
                <div className="flex-1">
                  <DialogTitle className="text-left text-2xl font-bold text-white mb-3 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                    {patchNote.title}
                  </DialogTitle>
                  <div className="flex items-center space-x-4 mb-4">
                    <span className="text-cyan-300 font-medium text-lg">{patchNote.gameName}</span>
                    <Badge className={`${getTypeColor(patchNote.type)} px-3 py-1 font-bold shadow-lg`}>
                      {getTypeIcon(patchNote.type)}
                      <span className="ml-2 capitalize">{patchNote.type}</span>
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-6 text-sm text-gray-400">
                    <span className="flex items-center space-x-2 glass-effect px-3 py-1 rounded-lg">
                      <Calendar className="h-4 w-4 text-cyan-400" />
                      <span className="text-cyan-300">{formatDate(patchNote.date)}</span>
                    </span>
                    <span className="glass-effect px-3 py-1 rounded-lg text-purple-300 font-medium">Version {patchNote.version}</span>
                    {patchNote.size && (
                      <span className="flex items-center space-x-2 glass-effect px-3 py-1 rounded-lg">
                        <ExternalLink className="h-4 w-4 text-green-400" />
                        <span className="text-green-300">{patchNote.size}</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </DialogHeader>

          <div className="mt-8">
            <div className="glass-effect border border-purple-500/30 rounded-2xl p-8">
              {patchNote.fullContent ? (
                <div className="prose prose-invert max-w-none">
                  {formatContent(patchNote.fullContent)}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="p-6 glass-effect rounded-2xl inline-block">
                    <FileText className="h-16 w-16 mx-auto mb-6 text-purple-400" />
                    <h3 className="text-2xl font-bold text-purple-300 mb-4">
                      Detailed Content Unavailable
                    </h3>
                    <p className="text-gray-400 max-w-md mx-auto text-lg leading-relaxed">
                      {patchNote.summary}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-purple-500/30">
            <Button 
              onClick={onClose}
              className="w-full bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white font-bold py-3 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <X className="h-5 w-5 mr-2" />
              Close Patch Notes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SpecificPatchNoteModal;
