import React, { useState, useEffect } from 'react';
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

const BP_POSITIONS = [
  { key: 'OG', label: 'Opening Government', color: 'bg-blue-100 text-blue-900' },
  { key: 'OO', label: 'Opening Opposition', color: 'bg-red-100 text-red-900' },
  { key: 'CG', label: 'Closing Government', color: 'bg-green-100 text-green-900' },
  { key: 'CO', label: 'Closing Opposition', color: 'bg-yellow-100 text-yellow-900' },
];
const BP_POINTS = [3, 2, 1, 0];

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
  const [editingBallot, setEditingBallot] = useState<any>(null);
  const [teamTotals, setTeamTotals] = useState<number[]>([0,0,0,0]);
  const [teamRanks, setTeamRanks] = useState<number[]>([1,2,3,4]);
  
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
  const watchedJudgeId = watch('judge_id');
  
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
  
  // Check for existing ballot on draw/judge change
  useEffect(() => {
    const checkExistingBallot = async () => {
      if (!watchedDrawId || !watchedJudgeId) return;
      const { data, error } = await supabase
        .from('ballots')
        .select('*')
        .eq('draw_id', watchedDrawId)
        .eq('judge_id', watchedJudgeId)
        .single();
      if (data) {
        setEditingBallot(data);
        // Only set values for keys that exist in the form
        const formKeys = Object.keys(form.getValues());
        Object.entries(data).forEach(([key, value]) => {
          if (formKeys.includes(key)) setValue(key as any, value);
        });
        // TODO: fetch and populate speaker_scores if needed
      } else {
        setEditingBallot(null);
      }
    };
    checkExistingBallot();
  }, [watchedDrawId, watchedJudgeId]);

  // Real-time update for teamTotals and teamRanks
  useEffect(() => {
    if (selectedFormat !== 'bp' || !selectedDraw) return;
    const scores = watch('speaker_scores');
    // Calculate total speaker scores for each team
    const totals = [0,1,2,3].map(idx => {
      const s1 = scores?.[idx*2]?.score || 0;
      const s2 = scores?.[idx*2+1]?.score || 0;
      return s1 + s2;
    });
    setTeamTotals(totals);
    // Calculate ranks (descending order)
    const sorted = [...totals].map((val, i) => ({val, i}))
      .sort((a,b) => b.val - a.val)
      .map((item, rank) => ({...item, rank: rank+1}));
    const ranks = Array(4).fill(0);
    sorted.forEach(item => { ranks[item.i] = item.rank; });
    setTeamRanks(ranks);
  }, [selectedFormat, selectedDraw, watch('speaker_scores')]);
  
  // For real-time updates and caching, add useEffect to save speaker_scores to localStorage
  useEffect(() => {
    if (selectedFormat === 'bp' && selectedDraw) {
      const scores = watch('speaker_scores');
      if (scores && Array.isArray(scores)) {
        localStorage.setItem(`bp_speaker_scores_${selectedDraw.id}`, JSON.stringify(scores));
      }
    }
  }, [watch('speaker_scores'), selectedFormat, selectedDraw]);

  // On draw change, restore speaker_scores from cache if available
  useEffect(() => {
    if (selectedFormat === 'bp' && selectedDraw) {
      const cached = localStorage.getItem(`bp_speaker_scores_${selectedDraw.id}`);
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed)) setValue('speaker_scores', parsed);
        } catch {}
      }
    }
  }, [selectedFormat, selectedDraw, setValue]);
  
  const handleFormSubmit = async (data: BallotEntryFormData) => {
    if (!selectedDraw) {
      toast.error('Please select a room/draw');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      let ballotId = editingBallot?.id;
      let ballotData;
      const ballotPayload = {
        tournament_id: tournamentId,
        round_id: data.round_id,
        draw_id: data.draw_id,
        judge_id: data.judge_id,
        gov_team_rank: teamRanks[0],
        opp_team_rank: teamRanks[1],
        cg_team_rank: teamRanks[2],
        co_team_rank: teamRanks[3],
        gov_team_points: data.gov_team_points,
        opp_team_points: data.opp_team_points,
        cg_team_points: data.cg_team_points,
        co_team_points: data.co_team_points,
        feedback: data.feedback,
        notes: data.notes,
        status: 'submitted',
        submission_time: new Date().toISOString(),
      };

      if (editingBallot) {
        const { data: updated, error } = await supabase
          .from('ballots')
          .update(ballotPayload)
          .eq('id', ballotId)
          .select()
          .single();
        if (error) throw error;
        ballotData = updated;
      } else {
        const { data: inserted, error } = await supabase
          .from('ballots')
          .insert(ballotPayload)
          .select()
          .single();
        if (error) throw error;
        ballotData = inserted;
      }
      
      // Insert speaker scores
      if (data.speaker_scores && data.speaker_scores.length > 0) {
        const validSpeakerScoresData = data.speaker_scores.map((score, index) => ({
          ballot_id: ballotData.id,
          team_id: getTeamIdForSpeakerIndex(index),
          speaker_position: getSpeakerPositionForIndex(index),
          speaker_name: score.speaker_name,
          score: score.score,
          content_score: score.content_score,
          delivery_score: score.delivery_score,
          strategy_score: score.strategy_score,
          feedback: score.feedback
        })).filter(s => s.team_id && s.team_id !== '');
        
        const { error: scoresError } = await supabase
          .from('speaker_scores')
          .insert(validSpeakerScoresData);
        
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
  
  // Replace rank number with ordinal string in the rank summary
  const ordinal = (n: number) => {
    if (n === 1) return '1st';
    if (n === 2) return '2nd';
    if (n === 3) return '3rd';
    if (n === 4) return '4th';
    return `${n}th`;
  };
  
  return (
    <Card className="w-full max-w-5xl mx-auto shadow-lg border-2 border-gray-100">
      <CardHeader className="bg-gray-50 rounded-t-lg">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-2xl font-bold">
            <Gavel className="h-6 w-6" />
            Manual Ballot Entry
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-8 p-8">
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                  {/* Filter draws by selected round and deduplicate by room name */}
                  {[...new Map(
                    draws
                      .filter(draw => draw.round_id === watch('round_id'))
                      .map(draw => [draw.room, draw])
                  ).values()].map(draw => (
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
          
          {/* BP Team Results - Always show 4 teams for BP */}
          {selectedFormat === 'bp' && selectedDraw && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold mb-2">Speaker Scores</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {BP_POSITIONS.map((pos, idx) => {
                  const teamId = selectedDraw[`${pos.key.toLowerCase()}_team_id` as keyof Draw] as string | undefined;
                  const team = teams.find(t => t.id === teamId);
                  const speakerIndices = [idx * 2, idx * 2 + 1];
                  return (
                    <div key={pos.key} className={`rounded-lg shadow p-4 border-2 ${pos.color} flex flex-col gap-2`}>
                      <div className="font-bold text-lg mb-1">{pos.label} Speakers</div>
                      {speakerIndices.map((sIdx) => (
                        <div key={sIdx} className="mb-4">
                          <Label className="text-xs">Speaker Name</Label>
                          <Input
                            className="mb-1"
                            {...register(`speaker_scores.${sIdx}.speaker_name` as any)}
                          />
                          <Label className="text-xs">Overall Score (50-100)</Label>
                          <Input
                            type="number"
                            min={50}
                            max={100}
                            className="mb-1"
                            {...register(`speaker_scores.${sIdx}.score` as any, { valueAsNumber: true })}
                          />
                          <Label className="text-xs">Feedback</Label>
                          <Textarea
                            rows={2}
                            className="mb-2"
                            {...register(`speaker_scores.${sIdx}.feedback` as any)}
                          />
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          
          {/* BP Team Rank Summary - visually at bottom */}
          {selectedFormat === 'bp' && selectedDraw && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-2">Team Rankings (Auto-calculated)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {BP_POSITIONS.map((pos, idx) => {
                  const teamId = selectedDraw[`${pos.key.toLowerCase()}_team_id` as keyof Draw] as string | undefined;
                  const team = teams.find(t => t.id === teamId);
                  return (
                    <div key={pos.key} className={`rounded-lg shadow p-4 border-2 ${pos.color} flex flex-col items-center`}>
                      <div className="font-bold text-lg mb-1">{pos.label}</div>
                      <div className="text-sm text-gray-700 mb-2">{team ? team.name : <span className="italic text-gray-400">TBD</span>}</div>
                      <div className="text-2xl font-bold mb-1">{teamTotals[idx]}</div>
                      <div className="text-lg font-semibold">Rank: <span className="text-blue-700">{ordinal(teamRanks[idx])}</span></div>
                    </div>
                  );
                })}
              </div>
              <div className="text-center text-gray-500 mt-2">Ranks are based on total speaker scores. Please confirm before submitting.</div>
            </div>
          )}
          
          {/* Other formats fallback */}
          {selectedFormat !== 'bp' && (
            <></>
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
          <div className="flex justify-end space-x-2 mt-8">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2 rounded-lg">
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
