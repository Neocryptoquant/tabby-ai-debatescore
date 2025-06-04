
import { useState } from 'react';
import { Share2, Eye, EyeOff, Copy, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { usePublicAccess } from '@/hooks/usePublicAccess';
import { toast } from 'sonner';

interface PublicAccessPanelProps {
  tournamentId: string;
}

export const PublicAccessPanel = ({ tournamentId }: PublicAccessPanelProps) => {
  const { publicAccess, isLoading, generatePublicLink, updatePublicAccess, getPublicUrl } = usePublicAccess(tournamentId);
  const [showSpeakerScores, setShowSpeakerScores] = useState(false);

  const handleGenerateLink = async () => {
    await generatePublicLink(showSpeakerScores);
  };

  const handleCopyLink = () => {
    const url = getPublicUrl();
    if (url) {
      navigator.clipboard.writeText(url);
      toast.success('Public link copied to clipboard!');
    }
  };

  const handleToggleActive = (active: boolean) => {
    updatePublicAccess({ is_active: active });
  };

  const handleToggleSpeakerScores = (show: boolean) => {
    updatePublicAccess({ show_speaker_scores: show });
  };

  const publicUrl = getPublicUrl();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Share2 className="h-5 w-5" />
          Public Access
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!publicAccess ? (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Generate a public link to share tournament results with attendees and spectators.
            </p>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="speaker-scores"
                checked={showSpeakerScores}
                onCheckedChange={setShowSpeakerScores}
              />
              <Label htmlFor="speaker-scores" className="text-sm">
                Show speaker scores (only enable after tournament completion)
              </Label>
            </div>

            <Button onClick={handleGenerateLink} disabled={isLoading} className="w-full">
              <Share2 className="h-4 w-4 mr-2" />
              Generate Public Link
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Public Link</Label>
              <div className="flex gap-2">
                <Input
                  value={publicUrl || ''}
                  readOnly
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCopyLink}
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => window.open(publicUrl || '', '_blank')}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="active-toggle" className="text-sm">
                  Public access active
                </Label>
                <Switch
                  id="active-toggle"
                  checked={publicAccess.is_active}
                  onCheckedChange={handleToggleActive}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="scores-toggle" className="text-sm">
                  Show speaker scores
                </Label>
                <Switch
                  id="scores-toggle"
                  checked={publicAccess.show_speaker_scores}
                  onCheckedChange={handleToggleSpeakerScores}
                />
              </div>
            </div>

            <div className="text-xs text-gray-500 space-y-1">
              <p>• Public link shows team standings and tournament progress</p>
              <p>• Speaker scores are only shown when enabled (recommended after completion)</p>
              <p>• Updates automatically as rounds are completed</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
