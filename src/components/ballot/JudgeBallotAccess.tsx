import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Judge, Round } from '@/types/tournament';
import { Gavel, Link, Copy, RefreshCw, Mail, QrCode } from 'lucide-react';

interface JudgeBallotAccessProps {
  tournamentId: string;
  judges: Judge[];
  rounds: Round[];
  className?: string;
}

export function JudgeBallotAccess({
  tournamentId,
  judges,
  rounds,
  className
}: JudgeBallotAccessProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedJudgeId, setSelectedJudgeId] = useState<string>('');
  const [selectedRoundId, setSelectedRoundId] = useState<string>('');
  const [accessLinks, setAccessLinks] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<'individual' | 'bulk'>('individual');
  const [emailStatus, setEmailStatus] = useState<Record<string, 'idle' | 'sending' | 'sent' | 'error'>>({});
  
  const baseUrl = window.location.origin;
  
  const generateBallotLink = async () => {
    if (!selectedJudgeId || !selectedRoundId) {
      toast.error('Please select both a judge and a round');
      return;
    }
    
    setIsGenerating(true);
    try {
      // Generate a simple token for now
      const token = `${selectedJudgeId}-${selectedRoundId}-${Date.now()}`;
      const accessLink = `${baseUrl}/ballot/${token}`;
      
      // Update the access links state
      setAccessLinks(prev => ({
        ...prev,
        [`${selectedJudgeId}-${selectedRoundId}`]: accessLink
      }));
      
      toast.success('Ballot access link generated successfully');
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
      const newAccessLinks: Record<string, string> = {};
      
      // Generate links for all judge-round combinations
      for (const judge of judges) {
        for (const round of rounds) {
          // Generate a simple token
          const token = `${judge.id}-${round.id}-${Date.now()}`;
          const accessLink = `${baseUrl}/ballot/${token}`;
          
          // Add to the new access links
          newAccessLinks[`${judge.id}-${round.id}`] = accessLink;
        }
      }
      
      // Update the access links state
      setAccessLinks(prev => ({
        ...prev,
        ...newAccessLinks
      }));
      
      toast.success(`Generated ${Object.keys(newAccessLinks).length} ballot access links`);
    } catch (error) {
      console.error('Error generating all ballot links:', error);
      toast.error('Failed to generate all ballot links');
    } finally {
      setIsGenerating(false);
    }
  };
  
  const copyLinkToClipboard = (link: string) => {
    navigator.clipboard.writeText(link);
    toast.success('Link copied to clipboard');
  };
  
  const sendEmailToJudge = async (judgeId: string, roundId: string, link: string) => {
    const judge = judges.find(j => j.id === judgeId);
    const round = rounds.find(r => r.id === roundId);
    
    if (!judge || !round) {
      toast.error('Judge or round not found');
      return;
    }
    
    // Set sending status
    setEmailStatus(prev => ({
      ...prev,
      [`${judgeId}-${roundId}`]: 'sending'
    }));
    
    try {
      // In a real implementation, you would call an edge function to send the email
      // For now, we'll just simulate it
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Set sent status
      setEmailStatus(prev => ({
        ...prev,
        [`${judgeId}-${roundId}`]: 'sent'
      }));
      
      toast.success(`Email sent to ${judge.name}`);
    } catch (error) {
      console.error('Error sending email:', error);
      
      // Set error status
      setEmailStatus(prev => ({
        ...prev,
        [`${judgeId}-${roundId}`]: 'error'
      }));
      
      toast.error('Failed to send email');
    }
  };
  
  const getJudgeName = (judgeId: string) => {
    return judges.find(j => j.id === judgeId)?.name || 'Unknown Judge';
  };
  
  const getRoundName = (roundId: string) => {
    const round = rounds.find(r => r.id === roundId);
    return round ? `Round ${round.round_number}` : 'Unknown Round';
  };
  
  const getEmailStatus = (judgeId: string, roundId: string) => {
    return emailStatus[`${judgeId}-${roundId}`] || 'idle';
  };
  
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gavel className="h-5 w-5" />
          Judge Ballot Access
        </CardTitle>
        <CardDescription>
          Generate secure links for judges to submit their ballots
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)}>
          <TabsList className="grid grid-cols-2 mb-6">
            <TabsTrigger value="individual">Individual Links</TabsTrigger>
            <TabsTrigger value="bulk">Bulk Generation</TabsTrigger>
          </TabsList>
          
          <TabsContent value="individual" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="judge-select">Select Judge</Label>
                <select
                  id="judge-select"
                  className="w-full p-2 border rounded-md"
                  value={selectedJudgeId}
                  onChange={(e) => setSelectedJudgeId(e.target.value)}
                >
                  <option value="">Select a judge...</option>
                  {judges.map((judge) => (
                    <option key={judge.id} value={judge.id}>
                      {judge.name} {judge.institution ? `(${judge.institution})` : ''}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <Label htmlFor="round-select">Select Round</Label>
                <select
                  id="round-select"
                  className="w-full p-2 border rounded-md"
                  value={selectedRoundId}
                  onChange={(e) => setSelectedRoundId(e.target.value)}
                >
                  <option value="">Select a round...</option>
                  {rounds.map((round) => (
                    <option key={round.id} value={round.id}>
                      Round {round.round_number} - {round.motion.substring(0, 30)}...
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <Button
              onClick={generateBallotLink}
              disabled={isGenerating || !selectedJudgeId || !selectedRoundId}
              className="w-full"
            >
              {isGenerating ? (
                <LoadingSpinner size="sm" className="mr-2" />
              ) : (
                <Link className="h-4 w-4 mr-2" />
              )}
              Generate Access Link
            </Button>
            
            {accessLinks[`${selectedJudgeId}-${selectedRoundId}`] && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">Access Link</h4>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyLinkToClipboard(accessLinks[`${selectedJudgeId}-${selectedRoundId}`])}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                </div>
                <div className="p-2 bg-white border rounded-md text-sm break-all">
                  {accessLinks[`${selectedJudgeId}-${selectedRoundId}`]}
                </div>
                <div className="mt-4 flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => sendEmailToJudge(
                      selectedJudgeId,
                      selectedRoundId,
                      accessLinks[`${selectedJudgeId}-${selectedRoundId}`]
                    )}
                    disabled={getEmailStatus(selectedJudgeId, selectedRoundId) === 'sending'}
                  >
                    {getEmailStatus(selectedJudgeId, selectedRoundId) === 'sending' ? (
                      <LoadingSpinner size="sm" className="mr-2" />
                    ) : (
                      <Mail className="h-4 w-4 mr-2" />
                    )}
                    Email to Judge
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(accessLinks[`${selectedJudgeId}-${selectedRoundId}`], '_blank')}
                  >
                    <QrCode className="h-4 w-4 mr-2" />
                    Open Link
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="bulk" className="space-y-6">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Bulk Link Generation</h4>
              <p className="text-sm text-blue-800 mb-4">
                Generate ballot access links for all judges and rounds at once. This is useful for setting up an entire tournament.
              </p>
              <Button
                onClick={generateAllLinks}
                disabled={isGenerating}
                className="w-full"
              >
                {isGenerating ? (
                  <LoadingSpinner size="sm" className="mr-2" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                Generate All Links
              </Button>
            </div>
            
            {Object.keys(accessLinks).length > 0 && (
              <div className="space-y-4">
                <h4 className="font-medium">Generated Links</h4>
                <div className="max-h-96 overflow-y-auto space-y-2">
                  {Object.entries(accessLinks).map(([key, link]) => {
                    const [judgeId, roundId] = key.split('-');
                    return (
                      <div key={key} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <div className="font-medium">{getJudgeName(judgeId)}</div>
                            <div className="text-sm text-gray-500">{getRoundName(roundId)}</div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => copyLinkToClipboard(link)}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => sendEmailToJudge(judgeId, roundId, link)}
                              disabled={getEmailStatus(judgeId, roundId) === 'sending'}
                            >
                              {getEmailStatus(judgeId, roundId) === 'sending' ? (
                                <LoadingSpinner size="sm" />
                              ) : getEmailStatus(judgeId, roundId) === 'sent' ? (
                                <Badge variant="outline" className="bg-green-100 text-green-800">Sent</Badge>
                              ) : (
                                <Mail className="h-3 w-3" />
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="text-sm text-gray-500">
          Links are valid for 48 hours
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setAccessLinks({})}
          disabled={Object.keys(accessLinks).length === 0}
        >
          Clear All Links
        </Button>
      </CardFooter>
    </Card>
  );
}