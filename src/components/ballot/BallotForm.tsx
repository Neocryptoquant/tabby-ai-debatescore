import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { toast } from 'sonner';
import { Team } from '@/types/tournament';
import { Gavel, Save, CheckCircle, Users, Star, MessageSquare } from 'lucide-react';

// Schema for speaker scores
const speakerScoreSchema = z.object({
  id: z.string().optional(),
  speaker_name: z.string().min(1, "Speaker name is required"),
  score: z.number().min(50).max(100),
  content_score: z.number().min(1).max(10).optional(),
  style_score: z.number().min(1).max(10).optional(),
  strategy_score: z.number().min(1).max(10).optional(),
  feedback: z.string().optional(),
});

// Schema for team results
const teamResultSchema = z.object({
  id: z.string(),
  name: z.string(),
  position: z.string(),
  rank: z.number().min(1).max(4),
  points: z.number().min(0).max(3),
  speaker_scores: z.array(speakerScoreSchema),
});

// Schema for the entire ballot
const ballotSchema = z.object({
  teams: z.array(teamResultSchema),
  general_feedback: z.string().optional(),
  debate_quality: z.number().min(1).max(10).optional(),
  notes_to_tab: z.string().optional(),
});

type BallotFormData = z.infer<typeof ballotSchema>;

interface BallotFormProps {
  drawId: string;
  judgeId: string;
  roundId: string;
  tournamentId: string;
  format: string;
  teams: Team[];
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function BallotForm({
  drawId,
  judgeId,
  roundId,
  tournamentId,
  format = 'bp',
  teams,
  onSubmit,
  onCancel,
  isLoading = false
}: BallotFormProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentTab, setCurrentTab] = useState('teams');
  
  // Initialize form with default values
  const form = useForm<BallotFormData>({
    resolver: zodResolver(ballotSchema),
    defaultValues: {
      teams: [],
      general_feedback: '',
      debate_quality: 5,
      notes_to_tab: '',
    }
  });
  
  const { register, handleSubmit, watch, setValue, formState: { errors } } = form;
  
  // Initialize form data based on teams and format
  useEffect(() => {
    if (!teams || teams.length === 0) return;
    
    // Map teams to positions based on format
    const teamPositions = format === 'bp' 
      ? ['OG', 'OO', 'CG', 'CO'] 
      : ['Proposition', 'Opposition'];
    
    const formTeams = teams.map((team, index) => {
      // Only use positions up to the number of teams we have
      const position = index < teamPositions.length ? teamPositions[index] : 'Unknown';
      
      // Create speaker entries based on format
      const speakersPerTeam = format === 'wsdc' ? 3 : 2;
      const speakerScores = [];
      
      // Add speaker 1
      if (team.speaker_1) {
        speakerScores.push({
          speaker_name: team.speaker_1,
          score: 75,
          content_score: 5,
          style_score: 5,
          strategy_score: 5,
          feedback: ''
        });
      }
      
      // Add speaker 2
      if (team.speaker_2) {
        speakerScores.push({
          speaker_name: team.speaker_2,
          score: 75,
          content_score: 5,
          style_score: 5,
          strategy_score: 5,
          feedback: ''
        });
      }
      
      // Add speaker 3 (for WSDC)
      if (speakersPerTeam >= 3 && team.speaker_3) {
        speakerScores.push({
          speaker_name: team.speaker_3,
          score: 75,
          content_score: 5,
          style_score: 5,
          strategy_score: 5,
          feedback: ''
        });
      }
      
      return {
        id: team.id,
        name: team.name,
        position,
        rank: index + 1, // Default rank based on position
        points: 3 - index, // Default points based on rank
        speaker_scores: speakerScores
      };
    });
    
    setValue('teams', formTeams);
  }, [teams, format, setValue]);
  
  const handleFormSubmit = async (data: BallotFormData, isDraft: boolean = false) => {
    try {
      setIsSubmitting(true);
      
      // Prepare ballot data
      const ballotData = {
        draw_id: drawId,
        judge_id: judgeId,
        round_id: roundId,
        status: isDraft ? 'draft' : 'submitted',
        submission_time: isDraft ? null : new Date().toISOString(),
        
        // Team results
        team_rankings: data.teams.map(team => ({
          team_id: team.id,
          position: team.position,
          rank: team.rank,
          points: team.points
        })),
        
        // For BP format, map to the correct fields
        gov_team_id: data.teams.find(t => t.position === 'OG' || t.position === 'Proposition')?.id,
        opp_team_id: data.teams.find(t => t.position === 'OO' || t.position === 'Opposition')?.id,
        cg_team_id: data.teams.find(t => t.position === 'CG')?.id,
        co_team_id: data.teams.find(t => t.position === 'CO')?.id,
        
        // Points
        gov_team_points: data.teams.find(t => t.position === 'OG' || t.position === 'Proposition')?.points,
        opp_team_points: data.teams.find(t => t.position === 'OO' || t.position === 'Opposition')?.points,
        cg_team_points: data.teams.find(t => t.position === 'CG')?.points,
        co_team_points: data.teams.find(t => t.position === 'CO')?.points,
        
        // Feedback
        general_feedback: data.general_feedback,
        debate_quality_score: data.debate_quality,
        notes: data.notes_to_tab
      };
      
      // Call the onSubmit callback
      await onSubmit(ballotData);
      
      toast.success(isDraft ? 'Ballot saved as draft' : 'Ballot submitted successfully');
    } catch (error) {
      console.error('Error submitting ballot:', error);
      toast.error('Failed to submit ballot');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleSaveAsDraft = () => {
    form.handleSubmit((data) => handleFormSubmit(data, true))();
  };
  
  const handleFinalSubmit = () => {
    form.handleSubmit((data) => handleFormSubmit(data, false))();
  };
  
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <LoadingSpinner size="lg" text="Loading ballot form..." centered />
        </CardContent>
      </Card>
    );
  }
  
  return (
    <form onSubmit={form.handleSubmit(handleFinalSubmit)}>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gavel className="h-5 w-5" />
            {format.toUpperCase()} Ballot
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={currentTab} onValueChange={setCurrentTab}>
            <TabsList className="grid grid-cols-3 mb-6">
              <TabsTrigger value="teams" className="flex items-center gap-1.5">
                <Users className="h-4 w-4" />
                <span>Team Results</span>
              </TabsTrigger>
              <TabsTrigger value="speakers" className="flex items-center gap-1.5">
                <Star className="h-4 w-4" />
                <span>Speaker Scores</span>
              </TabsTrigger>
              <TabsTrigger value="feedback" className="flex items-center gap-1.5">
                <MessageSquare className="h-4 w-4" />
                <span>Feedback</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="teams" className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Team Rankings</h3>
                <p className="text-sm text-gray-500">
                  Rank the teams from 1st to {teams.length}th place. Points will be calculated automatically.
                </p>
                
                {/* Team rankings */}
                <div className="space-y-4">
                  {form.watch('teams')?.map((team, index) => (
                    <div key={team.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h4 className="font-medium">{team.name}</h4>
                          <Badge variant="outline">{team.position}</Badge>
                        </div>
                        <div className="flex items-center gap-4">
                          <div>
                            <Label htmlFor={`teams.${index}.rank`}>Rank</Label>
                            <Select
                              value={team.rank.toString()}
                              onValueChange={(value) => {
                                setValue(`teams.${index}.rank`, parseInt(value));
                                // Update points based on rank
                                const points = 4 - parseInt(value);
                                setValue(`teams.${index}.points`, Math.max(0, points));
                              }}
                            >
                              <SelectTrigger className="w-20">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {Array.from({ length: teams.length }, (_, i) => (
                                  <SelectItem key={i + 1} value={(i + 1).toString()}>
                                    {i + 1}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor={`teams.${index}.points`}>Points</Label>
                            <Input
                              id={`teams.${index}.points`}
                              type="number"
                              className="w-20"
                              {...register(`teams.${index}.points` as any, { valueAsNumber: true })}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="speakers" className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Speaker Scores</h3>
                <p className="text-sm text-gray-500">
                  Score each speaker from 50 to 100. The average is typically around 75.
                </p>
                
                {/* Speaker scores by team */}
                {form.watch('teams')?.map((team, teamIndex) => (
                  <div key={team.id} className="space-y-4">
                    <h4 className="font-medium flex items-center gap-2">
                      <Badge variant="outline">{team.position}</Badge>
                      {team.name}
                    </h4>
                    
                    <div className="space-y-3">
                      {team.speaker_scores.map((speaker, speakerIndex) => (
                        <div key={speakerIndex} className="p-4 border rounded-lg">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                              <Label htmlFor={`teams.${teamIndex}.speaker_scores.${speakerIndex}.speaker_name`}>
                                Speaker Name
                              </Label>
                              <Input
                                id={`teams.${teamIndex}.speaker_scores.${speakerIndex}.speaker_name`}
                                {...register(`teams.${teamIndex}.speaker_scores.${speakerIndex}.speaker_name` as any)}
                              />
                            </div>
                            <div>
                              <Label htmlFor={`teams.${teamIndex}.speaker_scores.${speakerIndex}.score`}>
                                Overall Score
                              </Label>
                              <Input
                                id={`teams.${teamIndex}.speaker_scores.${speakerIndex}.score`}
                                type="number"
                                min={50}
                                max={100}
                                step={1}
                                {...register(`teams.${teamIndex}.speaker_scores.${speakerIndex}.score` as any, { valueAsNumber: true })}
                              />
                            </div>
                          </div>
                          
                          {/* Detailed scoring criteria */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div>
                              <Label htmlFor={`teams.${teamIndex}.speaker_scores.${speakerIndex}.content_score`}>
                                Content (1-10)
                              </Label>
                              <Input
                                id={`teams.${teamIndex}.speaker_scores.${speakerIndex}.content_score`}
                                type="number"
                                min={1}
                                max={10}
                                step={0.5}
                                {...register(`teams.${teamIndex}.speaker_scores.${speakerIndex}.content_score` as any, { valueAsNumber: true })}
                              />
                            </div>
                            <div>
                              <Label htmlFor={`teams.${teamIndex}.speaker_scores.${speakerIndex}.style_score`}>
                                Style (1-10)
                              </Label>
                              <Input
                                id={`teams.${teamIndex}.speaker_scores.${speakerIndex}.style_score`}
                                type="number"
                                min={1}
                                max={10}
                                step={0.5}
                                {...register(`teams.${teamIndex}.speaker_scores.${speakerIndex}.style_score` as any, { valueAsNumber: true })}
                              />
                            </div>
                            <div>
                              <Label htmlFor={`teams.${teamIndex}.speaker_scores.${speakerIndex}.strategy_score`}>
                                Strategy (1-10)
                              </Label>
                              <Input
                                id={`teams.${teamIndex}.speaker_scores.${speakerIndex}.strategy_score`}
                                type="number"
                                min={1}
                                max={10}
                                step={0.5}
                                {...register(`teams.${teamIndex}.speaker_scores.${speakerIndex}.strategy_score` as any, { valueAsNumber: true })}
                              />
                            </div>
                          </div>
                          
                          {/* Speaker feedback */}
                          <div>
                            <Label htmlFor={`teams.${teamIndex}.speaker_scores.${speakerIndex}.feedback`}>
                              Feedback for Speaker
                            </Label>
                            <Textarea
                              id={`teams.${teamIndex}.speaker_scores.${speakerIndex}.feedback`}
                              rows={3}
                              placeholder="Provide constructive feedback for this speaker..."
                              {...register(`teams.${teamIndex}.speaker_scores.${speakerIndex}.feedback` as any)}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="feedback" className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">General Feedback</h3>
                
                <div>
                  <Label htmlFor="debate_quality">Debate Quality (1-10)</Label>
                  <Input
                    id="debate_quality"
                    type="number"
                    min={1}
                    max={10}
                    {...register('debate_quality', { valueAsNumber: true })}
                  />
                </div>
                
                <div>
                  <Label htmlFor="general_feedback">Overall Debate Feedback</Label>
                  <Textarea
                    id="general_feedback"
                    rows={4}
                    placeholder="Provide general feedback about the debate..."
                    {...register('general_feedback')}
                  />
                </div>
                
                <div>
                  <Label htmlFor="notes_to_tab">Notes to Tab (not shared with teams)</Label>
                  <Textarea
                    id="notes_to_tab"
                    rows={3}
                    placeholder="Private notes for the tab team..."
                    {...register('notes_to_tab')}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={onCancel} type="button">
            Cancel
          </Button>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={handleSaveAsDraft}
              disabled={isSubmitting}
              type="button"
            >
              Save as Draft
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-green-600 hover:bg-green-700"
            >
              {isSubmitting ? (
                <LoadingSpinner size="sm" className="mr-2" />
              ) : (
                <CheckCircle className="h-4 w-4 mr-2" />
              )}
              Submit Ballot
            </Button>
          </div>
        </CardFooter>
      </Card>
    </form>
  );
}