import React from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  FileText,
  X,
  Sparkles,
  Star
} from 'lucide-react';
import BBCodeHelper from '@/utils/BBCodeHelper';

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

interface SpecificPatchNoteModalProps {
  patchNote: RecentPatchNote;
  onClose: () => void;
}

const SpecificPatchNoteModal: React.FC<SpecificPatchNoteModalProps> = ({ 
  patchNote, 
  onClose 
}) => {
const formatDate = (dateValue: string | number) => {
  const ms = typeof dateValue === "number" && dateValue < 1e12
    ? dateValue * 1000
    : Number(dateValue);
  const date = new Date(ms);
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
    // Parse Steam BBCode tags
    const lines = content.split('\n');
    const result: React.ReactNode[] = [];
    let listItems: React.ReactNode[] = [];
    let inList = false;
    let inOrderedList = false;

    lines.forEach((line, index) => {
      const processedLine = line;
      
      // Handle list items
      if (processedLine.includes('[list]')) {
        inList = true;
        return;
      }
      if (processedLine.includes('[/list]')) {
        if (listItems.length > 0) {
          result.push(
            <ul key={`list-${index}`} className="list-disc ml-6 mb-4 space-y-1">
              {listItems}
            </ul>
          );
          listItems = [];
        }
        inList = false;
        return;
      }
      if (processedLine.includes('[olist]')) {
        inOrderedList = true;
        return;
      }
      if (processedLine.includes('[/olist]')) {
        if (listItems.length > 0) {
          result.push(
            <ol key={`olist-${index}`} className="list-decimal ml-6 mb-4 space-y-1">
              {listItems}
            </ol>
          );
          listItems = [];
        }
        inOrderedList = false;
        return;
      }

      // Handle list items
      if ((inList || inOrderedList) && processedLine.trim().startsWith('[*]')) {
        const itemText = processedLine.replace(/^\s*\[\*\]\s*/, '');
        listItems.push(
          <li key={`item-${index}`} className="text-gray-300">
            {parseBBCodeInline(itemText)}
          </li>
        );
        return;
      }

      // Handle headers
      if (processedLine.includes('[h1]')) {
        const headerText = processedLine.replace(/\[h1\](.*?)\[\/h1\]/g, '$1');
        result.push(
          <h1 key={index} className="text-3xl font-bold text-white mt-8 mb-6 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
            {parseBBCodeInline(headerText)}
          </h1>
        );
        return;
      }
      if (processedLine.includes('[h2]')) {
        const headerText = processedLine.replace(/\[h2\](.*?)\[\/h2\]/g, '$1');
        result.push(
          <h2 key={index} className="text-2xl font-semibold text-cyan-300 mt-6 mb-4 flex items-center">
            <Star className="h-5 w-5 mr-2" />
            {parseBBCodeInline(headerText)}
          </h2>
        );
        return;
      }
      if (processedLine.includes('[h3]')) {
        const headerText = processedLine.replace(/\[h3\](.*?)\[\/h3\]/g, '$1');
        result.push(
          <h3 key={index} className="text-xl font-medium text-purple-300 mt-4 mb-3 flex items-center">
            <Sparkles className="h-4 w-4 mr-2" />
            {parseBBCodeInline(headerText)}
          </h3>
        );
        return;
      }

      // Handle horizontal rule
      if (processedLine.includes('[hr][/hr]')) {
        result.push(<hr key={index} className="border-purple-500/30 my-6" />);
        return;
      }

      // Handle code blocks
      if (processedLine.includes('[code]')) {
        const codeText = processedLine.replace(/\[code\](.*?)\[\/code\]/g, '$1');
        result.push(
          <pre key={index} className="bg-gray-900/50 border border-purple-500/30 rounded-lg p-4 mb-4 overflow-x-auto">
            <code className="text-cyan-300 font-mono">{codeText}</code>
          </pre>
        );
        return;
      }

      // Handle quotes
      if (processedLine.includes('[quote=')) {
        const quoteMatch = processedLine.match(/\[quote=([^\]]+)\](.*?)\[\/quote\]/);
        if (quoteMatch) {
          const [, author, quoteText] = quoteMatch;
          result.push(
            <blockquote key={index} className="border-l-4 border-cyan-400 pl-4 mb-4 glass-effect p-4 rounded-r-lg">
              <p className="text-gray-300 mb-2">{parseBBCodeInline(quoteText)}</p>
              <cite className="text-cyan-400 text-sm">Originally posted by {author}</cite>
            </blockquote>
          );
          return;
        }
      }

      // Handle empty lines
      if (processedLine.trim() === '') {
        result.push(<br key={index} />);
        return;
      }

      // Handle regular paragraphs with inline formatting
      result.push(
        <p key={index} className="text-gray-300 mb-3 leading-relaxed">
          {parseBBCodeInline(processedLine)}
        </p>
      );
    });

    return result;
  };

  const parseBBCodeInline = (text: string): React.ReactNode => {
    // Handle inline formatting tags
    let result: React.ReactNode = text;

    // Bold
      result = parseTag(result as string, 'b', (content) => 
    <strong className="font-bold text-white">{content}</strong>
  );

    // Italic
    result = parseTag(result as string, 'i', (content) => 
      <em className="italic">{content}</em>
    );

    // Underline
    result = parseTag(result as string, 'u', (content) => 
      <u className="underline">{content}</u>
    );

    // Strikethrough
    result = parseTag(result as string, 'strike', (content) => 
      <s className="line-through">{content}</s>
    );

    // Spoiler
    result = parseTag(result as string, 'spoiler', (content) => 
      <span className="bg-gray-600 text-gray-600 hover:text-white transition-colors cursor-pointer rounded px-1">
        {content}
      </span>
    );
    
    // [img] tag with Steam clan image replacement
    if (typeof result === "string") {
      const imgRegex = /\[img\](.*?)\[\/img\]/gi;
      result = result.replace(imgRegex, (_, url) => {
        const fixedUrl = url.replace(
          "{STEAM_CLAN_IMAGE}",
          "https://clan.cloudflare.steamstatic.com/images"
        );
        return `<img src="${fixedUrl}" alt="Image" style="max-width:100%; margin-top: 1rem;" />`;
      });
    }

    // URLs
    result = parseUrlTag(result as string);

    // No parse (remove tags but keep content)
    result = parseTag(result as string, 'noparse', (content) => content);

    return result;
  };

  const parseTag = (text: string, tag: string, render: (content: string) => React.ReactNode): React.ReactNode => {
    const regex = new RegExp(`\\[${tag}\\](.*?)\\[\\/${tag}\\]`, 'g');
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(text.slice(lastIndex, match.index));
      }
      parts.push(render(match[1]));
      lastIndex = regex.lastIndex;
    }

    if (lastIndex < text.length) {
      parts.push(text.slice(lastIndex));
    }

    // Always return a fragment so further parseTag calls can process the result recursively
    return <>{parts}</>;
  };

  const parseUrlTag = (text: string): React.ReactNode => {
    const regex = /\[url=([^\]]+)\](.*?)\[\/url\]/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(text)) !== null) {
      // Add text before the tag
      if (match.index > lastIndex) {
        parts.push(text.slice(lastIndex, match.index));
      }
      // Add the link
      parts.push(
        <a 
          key={match.index}
          href={match[1].startsWith('http') ? match[1] : `https://${match[1]}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-cyan-400 hover:text-cyan-300 underline"
        >
          {match[2]}
        </a>
      );
      lastIndex = regex.lastIndex;
    }

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(text.slice(lastIndex));
    }

    return parts.length > 1 ? <>{parts}</> : text;
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
                    {patchNote.gameName}
                  </DialogTitle>
                  <div className="flex items-center space-x-4 mb-4">
                    <span className="text-cyan-300 font-medium text-lg">{patchNote.announcement_body.headline}</span>
                  </div>
                  <div className="flex items-center space-x-6 text-sm text-gray-400">
                    <span className="flex items-center space-x-2 glass-effect px-3 py-1 rounded-lg">
                      <Calendar className="h-4 w-4 text-cyan-400" />
                      <span className="text-cyan-300">{formatDate(patchNote.announcement_body.posttime)}</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </DialogHeader>

          <div className="mt-8">
            <div className="glass-effect border border-purple-500/30 rounded-2xl p-8">
              {patchNote.announcement_body.body ? (
                <div
                  className="prose prose-invert max-w-none"
                  dangerouslySetInnerHTML={{
                    __html: BBCodeHelper.parseBBCode(
                      patchNote.announcement_body?.body ||
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
                    {patchNote.announcement_body?.headline}
                  </p>
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
