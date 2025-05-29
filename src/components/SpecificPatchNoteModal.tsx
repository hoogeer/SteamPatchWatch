
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
  X 
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
      case 'major': return 'bg-purple-600/20 text-purple-400 border-purple-500/30';
      case 'minor': return 'bg-blue-600/20 text-blue-400 border-blue-500/30';
      case 'hotfix': return 'bg-red-600/20 text-red-400 border-red-500/30';
      case 'content': return 'bg-green-600/20 text-green-400 border-green-500/30';
      default: return 'bg-gray-600/20 text-gray-400 border-gray-500/30';
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
    // Simple markdown-like formatting
    return content
      .split('\n')
      .map((line, index) => {
        if (line.startsWith('# ')) {
          return <h1 key={index} className="text-2xl font-bold text-white mt-6 mb-4">{line.slice(2)}</h1>;
        }
        if (line.startsWith('## ')) {
          return <h2 key={index} className="text-xl font-semibold text-slate-200 mt-4 mb-3">{line.slice(3)}</h2>;
        }
        if (line.startsWith('### ')) {
          return <h3 key={index} className="text-lg font-medium text-slate-300 mt-3 mb-2">{line.slice(4)}</h3>;
        }
        if (line.startsWith('- ')) {
          return <li key={index} className="text-slate-300 ml-4">{line.slice(2)}</li>;
        }
        if (line.trim() === '') {
          return <br key={index} />;
        }
        return <p key={index} className="text-slate-300 mb-2">{line}</p>;
      });
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3 flex-1">
              <img
                src={getGameIconUrl(patchNote.gameAppId, patchNote.gameIcon)}
                alt={patchNote.gameName}
                className="w-12 h-12 rounded object-cover flex-shrink-0"
                onError={(e) => {
                  e.currentTarget.src = '/placeholder.svg';
                }}
              />
              <div className="flex-1">
                <DialogTitle className="text-left text-xl font-bold text-white mb-2">
                  {patchNote.title}
                </DialogTitle>
                <div className="flex items-center space-x-3 mb-3">
                  <span className="text-slate-400">{patchNote.gameName}</span>
                  <Badge className={getTypeColor(patchNote.type)} variant="secondary">
                    {getTypeIcon(patchNote.type)}
                    <span className="ml-1 capitalize">{patchNote.type}</span>
                  </Badge>
                </div>
                <div className="flex items-center space-x-4 text-sm text-slate-400">
                  <span className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(patchNote.date)}</span>
                  </span>
                  <span>Version {patchNote.version}</span>
                  {patchNote.size && (
                    <span className="flex items-center space-x-1">
                      <ExternalLink className="h-4 w-4" />
                      <span>{patchNote.size}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="mt-6">
          <div className="bg-slate-700/30 border border-slate-600 rounded-lg p-6">
            {patchNote.fullContent ? (
              <div className="prose prose-slate max-w-none">
                {formatContent(patchNote.fullContent)}
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 mx-auto mb-4 text-slate-500" />
                <h3 className="text-lg font-medium text-slate-300 mb-2">
                  Detailed patch notes unavailable
                </h3>
                <p className="text-slate-400 max-w-md mx-auto">
                  {patchNote.summary}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-600">
          <Button 
            onClick={onClose}
            variant="outline" 
            className="w-full"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SpecificPatchNoteModal;
