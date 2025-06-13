
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Judge, Round } from '@/types/tournament';
import { Link, Copy, Clock, UserCheck } from 'lucide-react';

interface JudgeBallotAccessProps {
  tournamentId: string;
  judges: Judge[];
  rounds: Round[];
}

export function JudgeBallotAccess({
  tournamentId,
  judges,
  rounds
}: JudgeBallotAccessProps) {
  const [selectedJudge, setSelectedJudge] = useState<string>('');
  const [selectedRound, setSelectedRound] = useState<string>('');
  const [hoursValid, setHoursValid] = useState<number>(24);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedLinks, setGeneratedLinks] = useState<Array<{
    judgeId: string;
    judgeName: string;
    roundId: string;
    roundNumber: number;
    ballotUrl: string;
    shortCode: string;
    expiresIn: number;
    generatedAt: Date;
  }>>([]);

  const generateBallotLink = async (judgeId?: string, roundId?: string) => {
    const targetJudgeId = judgeId || selectedJudge;
    const targetRoundId = roundId || selectedRound;

    if (!targetJudgeId || !targetRoundId) {
      toast.error('Please select both a judge and a round');
      return;
    }

    setIsGenerating(true);
    try {
      // Call the edge function to generate ballot session
      const { data, error } = await supabase.functions.invoke('generate-ballot-session', {
        body: {
          judgeId: targetJudgeId,
          roundId: targetRoundId,
          tournamentId,
          hoursValid
        }
      });

      if (error) throw error;

      const judge = judges.find(j => j.id === targetJudgeId);
      const round = rounds.find(r => r.id === targetRoundId);

      if (judge && round) {
        const newLink = {
          judgeId: targetJudgeId,
          judgeName: judge.name,
          roundId: targetRoundId,
          roundNumber: round.round_number,
          ballotUrl: data.ballotUrl,
          shortCode: data.shortCode,
          expiresIn: data.expiresIn,
          generatedAt: new Date()
        };

        setGeneratedLinks(prev => [newLink, ...prev]);
        toast.success(`Ballot link generated for ${judge.name}`);
      }
    } catch (error) {
      console.error('Error generating ballot link:', error);
      toast.error('Failed to generate ballot link');
    } finally {
      setIsGenerating(false);
    }
  };

  const generateAllLinks = async () => {
    if (rounds.length === 0 || judges.length === 0) {
      toast.error('No rounds or judges available');
      return;
    }

    setIsGenerating(true);
    try {
      const promises = judges.map(judge => 
        rounds.map(round => 
          generateBallotLink(judge.id, round.id)
        )
      ).flat();

      await Promise.allSettled(promises);
      toast.success('Generated ballot links for all judge-round combinations');
    } catch (error) {
      console.error('Error generating all links:', error);
      toast.error('Failed to generate all ballot links');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Link copied to clipboard');
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      toast.error('Failed to copy link');
    }
  };

  const getExpiryTime = (generatedAt: Date, hoursValid: number) => {
    const expiry = new Date(generatedAt.getTime() + hoursValid * 60 * 60 * 1000);
    return expiry.toLocaleDateString() + ' ' + expiry.toLocaleTimeString();
  };

  const isExpired = (generatedAt: Date, hoursValid: number) => {
    const expiry = new Date(generatedAt.getTime() + hoursValid * 60 * 60 * 1000);
    return new Date() > expiry;
  };

  return (
    <div className="space-y-6">
      {/* Generate Individual Links */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5" />
            Generate Judge Ballot Access
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="judge">Judge</Label>
              <Select value={selectedJudge} onValueChange={setSelectedJudge}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a judge..." />
                </SelectTrigger>
                <SelectContent>
                  {judges.map((judge) => (
                    <SelectItem key={judge.id} value={judge.id}>
                      {judge.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="round">Round</Label>
              <Select value={selectedRound} onValueChange={setSelectedRound}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a round..." />
                </SelectTrigger>
                <SelectContent>
                  {rounds.map((round) => (
                    <SelectItem key={round.id} value={round.id}>
                      Round {round.round_number}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="hours">Valid for (hours)</Label>
              <Input
                id="hours"
                type="number"
                min={1}
                max={168}
                value={hoursValid}
                onChange={(e) => setHoursValid(parseInt(e.target.value) || 24)}
              />
            </div>
            
            <div className="flex items-end">
              <Button 
                onClick={() => generateBallotLink()}
                disabled={isGenerating || !selectedJudge || !selectedRound}
                className="w-full"
              >
                {isGenerating ? (
                  <LoadingSpinner size="sm" className="mr-2" />
                ) : (
                  <Link className="h-4 w-4 mr-2" />
                )}
                Generate Link
              </Button>
            </div>
          </div>
          
          <div className="pt-4">
            <Button 
              onClick={generateAllLinks}
              disabled={isGenerating || judges.length === 0 || rounds.length === 0}
              variant="outline"
              className="w-full"
            >
              {isGenerating ? (
                <LoadingSpinner size="sm" className="mr-2" />
              ) : (
                <Link className="h-4 w-4 mr-2" />
              )}
              Generate Links for All Judge-Round Combinations
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Generated Links */}
      {generatedLinks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Link className="h-5 w-5" />
              Generated Ballot Links
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {generatedLinks.map((link, index) => (
                <div key={index} className="p-4 border rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{link.judgeName}</div>
                      <div className="text-sm text-gray-500">Round {link.roundNumber}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={isExpired(link.generatedAt, link.expiresIn) ? "destructive" : "secondary"}>
                        <Clock className="h-3 w-3 mr-1" />
                        {isExpired(link.generatedAt, link.expiresIn) ? 'Expired' : 'Active'}
                      </Badge>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(link.ballotUrl)}
                      >
                        <Copy className="h-4 w-4 mr-1" />
                        Copy
                      </Button>
                    </div>
                  </div>
                  
                  <div className="text-sm bg-gray-50 p-2 rounded font-mono break-all">
                    {link.ballotUrl}
                  </div>
                  
                  <div className="text-xs text-gray-500">
                    Expires: {getExpiryTime(link.generatedAt, link.expiresIn)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
