
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, User, Key, Info, ExternalLink } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface SteamUserFormProps {
  onSubmit: (steamId: string, apiKey?: string) => void;
  loading: boolean;
}

const SteamUserForm: React.FC<SteamUserFormProps> = ({ onSubmit, loading }) => {
  const [steamId, setSteamId] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [showApiKeyHelp, setShowApiKeyHelp] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (steamId.trim() && apiKey.trim()) {
      onSubmit(steamId.trim(), apiKey.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        {/* Steam ID Input */}
        <div className="space-y-2">
          <Label htmlFor="steamId" className="text-slate-200 flex items-center space-x-2">
            <User className="h-4 w-4" />
            <span>Steam ID or Vanity URL</span>
          </Label>
          <Input
            id="steamId"
            type="text"
            placeholder="Enter SteamID64 or vanity username (e.g., 'johndoe')"
            value={steamId}
            onChange={(e) => setSteamId(e.target.value)}
            required
            className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-500"
          />
          <p className="text-sm text-slate-400">
            You can find your Steam ID from your profile URL or use your custom vanity name
          </p>
        </div>

        {/* API Key Input */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="apiKey" className="text-slate-200 flex items-center space-x-2">
              <Key className="h-4 w-4" />
              <span>Steam API Key</span>
            </Label>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowApiKeyHelp(!showApiKeyHelp)}
              className="text-blue-400 hover:text-blue-300"
            >
              <Info className="h-4 w-4 mr-1" />
              Why needed?
            </Button>
          </div>
          <Input
            id="apiKey"
            type="password"
            placeholder="Your Steam Web API Key (required for accessing Steam data)"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            required
            className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-500"
          />
        </div>

        {/* API Key Help */}
        {showApiKeyHelp && (
          <Alert className="border-blue-500/50 bg-blue-500/10">
            <Info className="h-4 w-4" />
            <AlertDescription className="text-blue-200 space-y-2">
              <p>
                An API key is required for:
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Accessing profile data</li>
                <li>Getting detailed playtime statistics</li>
                <li>Viewing recently played games</li>
                <li>Fetching patch notes and updates</li>
              </ul>
              <div className="flex items-center space-x-1 text-sm">
                <span>Get your free API key:</span>
                <a 
                  href="https://steamcommunity.com/dev/apikey" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 underline flex items-center"
                >
                  steamcommunity.com/dev/apikey
                  <ExternalLink className="h-3 w-3 ml-1" />
                </a>
              </div>
            </AlertDescription>
          </Alert>
        )}
      </div>

      {/* Submit Button */}
      <Button 
        type="submit" 
        disabled={loading || !steamId.trim() || !apiKey.trim()} 
        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Connecting to Steam...
          </>
        ) : (
          'Connect Steam Account'
        )}
      </Button>

      {/* Privacy Notice */}
      <Card className="bg-slate-700/30 border-slate-600">
        <CardContent className="p-4">
          <div className="flex items-start space-x-2">
            <Info className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-slate-300">
              <p className="font-medium text-slate-200 mb-1">Privacy & Security</p>
              <p>
                All Steam API calls are securely proxied through our backend to protect your API key and avoid CORS issues. 
                Your API key is never stored and is only used for the current session.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </form>
  );
};

export default SteamUserForm;
