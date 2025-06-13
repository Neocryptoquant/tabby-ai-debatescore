
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Judge, Round, Draw, Team } from '@/types/tournament';
import { Gavel, X } from 'lucide-react';

// Schema for speaker scores
const speakerScoreSchema = z.object({
  speaker_name: z.string().min(1, "Speaker name is required"),
  score: z.number().min(50).max(100),
  content_score: z.number().min(1).max(10).optional(),
  delivery_score: z.number().min(1).max(10).optional(),
  strategy_score: z.number().min(1).max(10).optional(),
  feedback: z.string().optional(),
});

// Schema for the ballot entry
const ballotEntrySchema = z.object({
  round_id: z.string().min(1, "Round is required"),
  draw_id: z.string().min(1, "Room/Draw is required"),
  judge_id: z.string().min(1, "Judge is required"),
  
  // Team results
  gov_team_points: z.number().min(0).max(3),
  opp_team_points: z.number().min(0).max(3),
  cg_team_points: z.number().min(0).max(3).optional(),
  co_team_points: z.number().min(0).max(3).optional(),
  
  gov_team_rank: z.number().min(1).max(4),
  opp_team_rank: z.number().min(1).max(4),
  cg_team_rank: z.number().min(1).max(4).optional(),
  co_team_rank: z.number().min(1).max(4).optional(),
  
  // Speaker scores
  speaker_scores: z.array(speakerScoreSchema),
  
  // Feedback
  feedback: z.string().optional(),
  notes: z.string().optional(),
});

type BallotEntryFormData = z.infer<typeof ballotEntrySchema>;

interface BallotEntryFormProps {
  tournamentId: string;
  judges: Judge[];
  rounds: Round[];
  draws: Draw[];
  teams: Team[];
  onClose: () => void;
  onSuccess: () => void;
}

export function BallotEntryForm({
  tournamentId,
  judges,
  rounds,
  draws,
  teams,
  onClose,
  onSuccess
}: BallotEntryFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDraw, setSelectedDraw] = useState<Draw | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<'bp' | 'wsdc'>('bp');
  
  const form = useForm<BallotEntryFormData>({
    resolver: zodResolver(ballotEntrySchema),
    defaultValues: {
      round_id: '',
      draw_id: '',
      judge_id: '',
      gov_team_points: 0,
      opp_team_points: 0,
      cg_team_points: 0,
      co_team_points: 0,
      gov_team_rank: 1,
      opp_team_rank: 2,
      cg_team_rank: 3,
      co_team_rank: 4,
      speaker_scores: [],
      feedback: '',
      notes: ''
    }
  });
  
  const { register, handleSubmit, watch, setValue, formState: { errors } } = form;
  
  // Watch for draw selection to populate teams
  const watchedDrawId = watch('draw_id');
  
  React.useEffect(() => {
    if (watchedDrawId) {
      const draw = draws.find(d => d.id === watchedDrawId);
      if (draw) {
        setSelectedDraw(draw);
        
        // Initialize speaker scores based on the draw
        const speakerScores = [];
        
        // Get teams from the draw
        const govTeam = teams.find(t => t.id === draw.gov_team_id);
        const oppTeam = teams.find(t => t.id === draw.opp_team_id);
        const cgTeam = teams.find(t => t.id === draw.cg_team_id);
        const coTeam = teams.find(t => t.id === draw.co_team_id);
        
        // Add speakers for each team
        [govTeam, oppTeam, cgTeam, coTeam].forEach(team => {
          if (team) {
            if (team.speaker_1) {
              speakerScores.push({
                speaker_name: team.speaker_1,
                score: 75,
                content_score: 5,
                delivery_score: 5,
                strategy_score: 5,
                feedback: ''
              });
            }
            if (team.speaker_2) {
              speakerScores.push({
                speaker_name: team.speaker_2,
                score: 75,
                content_score: 5,
                delivery_score: 5,
                strategy_score: 5,
                feedback: ''
              });
            }
            if (team.speaker_3) {
              speakerScores.push({
                speaker_name: team.speaker_3,
                score: 75,
                content_score: 5,
                delivery_score: 5,
                strategy_score: 5,
                feedback: ''
              });
            }
          }
        });
        
        setValue('speaker_scores', speakerScores);
      }
    }
  }, [watchedDrawId, draws, teams, setValue]);
  
  const handleFormSubmit = async (data: BallotEntryFormData) => {
    if (!selectedDraw) {
      toast.error('Please select a room/draw');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Insert the ballot
      const { data: ballotData, error: ballotError } = await supabase
        .from('ballots')
        .insert({
          tournament_id: tournamentId,
          round_id: data.round_id,
          draw_id: data.draw_id,
          judge_id: data.judge_id,
          gov_team_id: selectedDraw.gov_team_id,
          opp_team_id: selectedDraw.opp_team_id,
          cg_team_id: selectedDraw.cg_team_id,
          co_team_id: selectedDraw.co_team_id,
          gov_team_points: data.gov_team_points,
          opp_team_points: data.opp_team_points,
          cg_team_points: data.cg_team_points,
          co_team_points: data.co_team_points,
          gov_team_rank: data.gov_team_rank,
          opp_team_rank: data.opp_team_rank,
          cg_team_rank: data.cg_team_rank,
          co_team_rank: data.co_team_rank,
          status: 'submitted',
          submission_time: new Date().toISOString(),
          feedback: data.feedback,
          notes: data.notes
        })
        .select()
        .single();
      
      if (ballotError) throw ballotError;
      
      // Insert speaker scores
      if (data.speaker_scores && data.speaker_scores.length > 0) {
        const speakerScoresData = data.speaker_scores.map((score, index) => ({
          ballot_id: ballotData.id,
          team_id: getTeamIdForSpeakerIndex(index),
          speaker_position: getSpeakerPositionForIndex(index),
          speaker_name: score.speaker_name,
          score: score.score,
          content_score: score.content_score,
          delivery_score: score.delivery_score,
          strategy_score: score.strategy_score,
          feedback: score.feedback
        }));
        
        const { error: scoresError } = await supabase
          .from('speaker_scores')
          .insert(speakerScoresData);
        
        if (scoresError) throw scoresError;
      }
      
      toast.success('Ballot submitted successfully!');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error submitting ballot:', error);
      toast.error('Failed to submit ballot');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Helper function to get team ID for speaker index
  const getTeamIdForSpeakerIndex = (index: number): string => {
    if (!selectedDraw) return '';
    
    const teamIds = [
      selectedDraw.gov_team_id,
      selectedDraw.opp_team_id,
      selectedDraw.cg_team_id,
      selectedDraw.co_team_id
    ].filter(Boolean);
    
    const teamIndex = Math.floor(index / 2); // 2 speakers per team typically
    return teamIds[teamIndex] || '';
  };
  
  // Helper function to get speaker position for index
  const getSpeakerPositionForIndex = (index: number): number => {
    return (index % 2) + 1; // 1 or 2
  };
  
  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Gavel className="h-5 w-5" />
            Manual Ballot Entry
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="round_id">Round</Label>
              <Select value={watch('round_id')} onValueChange={(value) => setValue('round_id', value)}>
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
              {errors.round_id && (
                <p className="text-sm text-red-500 mt-1">{errors.round_id.message}</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="draw_id">Room</Label>
              <Select value={watch('draw_id')} onValueChange={(value) => setValue('draw_id', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a room..." />
                </SelectTrigger>
                <SelectContent>
                  {draws.map((draw) => (
                    <SelectItem key={draw.id} value={draw.id}>
                      {draw.room}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.draw_id && (
                <p className="text-sm text-red-500 mt-1">{errors.draw_id.message}</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="judge_id">Judge</Label>
              <Select value={watch('judge_id')} onValueChange={(value) => setValue('judge_id', value)}>
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
              {errors.judge_id && (
                <p className="text-sm text-red-500 mt-1">{errors.judge_id.message}</p>
              )}
            </div>
          </div>
          
          {/* Team Results */}
          {selectedDraw && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Team Results</h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Government Team */}
                {selectedDraw.gov_team_id && (
                  <div className="space-y-2">
                    <Label>Government Team</Label>
                    <div className="space-y-2">
                      <div>
                        <Label htmlFor="gov_team_rank" className="text-sm">Rank</Label>
                        <Input
                          id="gov_team_rank"
                          type="number"
                          min={1}
                          max={4}
                          {...register('gov_team_rank', { valueAsNumber: true })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="gov_team_points" className="text-sm">Points</Label>
                        <Input
                          id="gov_team_points"
                          type="number"
                          min={0}
                          max={3}
                          {...register('gov_team_points', { valueAsNumber: true })}
                        />
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Opposition Team */}
                {selectedDraw.opp_team_id && (
                  <div className="space-y-2">
                    <Label>Opposition Team</Label>
                    <div className="space-y-2">
                      <div>
                        <Label htmlFor="opp_team_rank" className="text-sm">Rank</Label>
                        <Input
                          id="opp_team_rank"
                          type="number"
                          min={1}
                          max={4}
                          {...register('opp_team_rank', { valueAsNumber: true })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="opp_team_points" className="text-sm">Points</Label>
                        <Input
                          id="opp_team_points"
                          type="number"
                          min={0}
                          max={3}
                          {...register('opp_team_points', { valueAsNumber: true })}
                        />
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Closing Government Team */}
                {selectedDraw.cg_team_id && (
                  <div className="space-y-2">
                    <Label>Closing Government</Label>
                    <div className="space-y-2">
                      <div>
                        <Label htmlFor="cg_team_rank" className="text-sm">Rank</Label>
                        <Input
                          id="cg_team_rank"
                          type="number"
                          min={1}
                          max={4}
                          {...register('cg_team_rank', { valueAsNumber: true })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="cg_team_points" className="text-sm">Points</Label>
                        <Input
                          id="cg_team_points"
                          type="number"
                          min={0}
                          max={3}
                          {...register('cg_team_points', { valueAsNumber: true })}
                        />
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Closing Opposition Team */}
                {selectedDraw.co_team_id && (
                  <div className="space-y-2">
                    <Label>Closing Opposition</Label>
                    <div className="space-y-2">
                      <div>
                        <Label htmlFor="co_team_rank" className="text-sm">Rank</Label>
                        <Input
                          id="co_team_rank"
                          type="number"
                          min={1}
                          max={4}
                          {...register('co_team_rank', { valueAsNumber: true })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="co_team_points" className="text-sm">Points</Label>
                        <Input
                          id="co_team_points"
                          type="number"
                          min={0}
                          max={3}
                          {...register('co_team_points', { valueAsNumber: true })}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Speaker Scores */}
          {watch('speaker_scores')?.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Speaker Scores</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {watch('speaker_scores').map((speaker, index) => (
                  <div key={index} className="p-4 border rounded-lg space-y-3">
                    <div>
                      <Label htmlFor={`speaker_scores.${index}.speaker_name`}>Speaker Name</Label>
                      <Input
                        id={`speaker_scores.${index}.speaker_name`}
                        {...register(`speaker_scores.${index}.speaker_name` as any)}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`speaker_scores.${index}.score`}>Overall Score (50-100)</Label>
                      <Input
                        id={`speaker_scores.${index}.score`}
                        type="number"
                        min={50}
                        max={100}
                        {...register(`speaker_scores.${index}.score` as any, { valueAsNumber: true })}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`speaker_scores.${index}.feedback`}>Feedback</Label>
                      <Textarea
                        id={`speaker_scores.${index}.feedback`}
                        rows={2}
                        {...register(`speaker_scores.${index}.feedback` as any)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* General Feedback */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Feedback</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="feedback">General Feedback</Label>
                <Textarea
                  id="feedback"
                  rows={4}
                  placeholder="Provide general feedback about the debate..."
                  {...register('feedback')}
                />
              </div>
              <div>
                <Label htmlFor="notes">Private Notes</Label>
                <Textarea
                  id="notes"
                  rows={4}
                  placeholder="Private notes for the tab team..."
                  {...register('notes')}
                />
              </div>
            </div>
          </div>
          
          {/* Submit Button */}
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <LoadingSpinner size="sm" className="mr-2" />
              ) : (
                <Gavel className="h-4 w-4 mr-2" />
              )}
              Submit Ballot
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
