
import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Judge, Round, Draw } from '@/types/tournament';
import { CheckCircle, XCircle, AlertTriangle, Clock, Eye, Flag } from 'lucide-react';
import { format } from 'date-fns';

interface BallotStatusTableProps {
  ballots: any[];
  judges?: Judge[];
  rounds?: Round[];
  draws?: Draw[];
  onConfirm?: (ballotId: string) => Promise<void>;
  onDiscard?: (ballotId: string) => Promise<void>;
  onCompleteRound?: (roundId: string) => Promise<void>;
}

export function BallotStatusTable({
  ballots,
  judges = [],
  rounds = [],
  draws = [],
  onConfirm,
  onDiscard,
  onCompleteRound
}: BallotStatusTableProps) {
  const [selectedRound, setSelectedRound] = useState<string>('all');
  
  // Filter ballots by selected round
  const filteredBallots = selectedRound === 'all'
    ? ballots
    : ballots.filter(ballot => ballot.draw?.round_id === selectedRound);
  
  // Group ballots by round
  const ballotsByRound = filteredBallots.reduce((acc, ballot) => {
    const roundId = ballot.draw?.round_id;
    if (!roundId) return acc;
    if (!acc[roundId]) {
      acc[roundId] = [];
    }
    acc[roundId].push(ballot);
    return acc;
  }, {} as Record<string, any[]>);
  
  // Get round completion status
  const getRoundStatus = (roundId: string) => {
    const round = rounds.find(r => r.id === roundId);
    if (!round) return 'unknown';
    return round.status;
  };
  
  // Get round completion percentage
  const getRoundCompletionPercentage = (roundId: string) => {
    const roundDraws = draws.filter(d => d.round_id === roundId);
    const roundBallots = ballots.filter(b => b.draw?.round_id === roundId);
    
    const submittedBallots = roundBallots.filter(b => 
      b.status === 'submitted' || b.status === 'confirmed'
    );
    
    if (roundDraws.length === 0) return 0;
    return Math.round((submittedBallots.length / roundDraws.length) * 100);
  };
  
  // Get status badge for a ballot
  const getBallotStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-green-100 text-green-800">Confirmed</Badge>;
      case 'submitted':
        return <Badge className="bg-blue-100 text-blue-800">Submitted</Badge>;
      case 'draft':
        return <Badge className="bg-yellow-100 text-yellow-800">Draft</Badge>;
      case 'discarded':
        return <Badge className="bg-red-100 text-red-800">Discarded</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">Unknown</Badge>;
    }
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return format(new Date(dateString), 'MMM d, yyyy h:mm a');
  };
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Ballot Status</h3>
        <Select value={selectedRound} onValueChange={setSelectedRound}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by round" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Rounds</SelectItem>
            {rounds.map((round) => (
              <SelectItem key={round.id} value={round.id}>
                Round {round.round_number}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {Object.entries(ballotsByRound).length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <AlertTriangle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-700">No Ballots Found</h3>
          <p className="text-gray-500 mt-2">
            {selectedRound === 'all'
              ? 'No ballots have been submitted yet'
              : 'No ballots found for the selected round'}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(ballotsByRound).map(([roundId, roundBallots]) => {
            const round = rounds.find(r => r.id === roundId);
            if (!round) return null;
            
            const completionPercentage = getRoundCompletionPercentage(roundId);
            const roundStatus = getRoundStatus(roundId);
            
            return (
              <div key={roundId} className="border rounded-lg overflow-hidden">
                <div className="bg-gray-50 p-4 flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Round {round.round_number}</h4>
                    <div className="text-sm text-gray-500 mt-1">
                      {round.motion.substring(0, 50)}...
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div>
                      <div className="text-sm text-gray-600">Completion</div>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-gray-200 rounded-full">
                          <div
                            className="h-full bg-blue-500 rounded-full"
                            style={{ width: `${completionPercentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">{completionPercentage}%</span>
                      </div>
                    </div>
                    <div>
                      {roundStatus === 'completed' ? (
                        <Badge className="bg-green-100 text-green-800">Completed</Badge>
                      ) : roundStatus === 'active' ? (
                        <Badge className="bg-blue-100 text-blue-800">Active</Badge>
                      ) : (
                        <Badge className="bg-yellow-100 text-yellow-800">Upcoming</Badge>
                      )}
                    </div>
                    {roundStatus === 'active' && completionPercentage === 100 && onCompleteRound && (
                      <Button
                        size="sm"
                        onClick={() => onCompleteRound(roundId)}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Complete Round
                      </Button>
                    )}
                  </div>
                </div>
                
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Room</TableHead>
                      <TableHead>Judge</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {roundBallots.map((ballot) => (
                      <TableRow key={ballot.id}>
                        <TableCell>{ballot.draw?.room || 'N/A'}</TableCell>
                        <TableCell>
                          {ballot.judge?.name || 'Unknown Judge'}
                          {ballot.judge?.institution && (
                            <div className="text-xs text-gray-500">{ballot.judge.institution}</div>
                          )}
                        </TableCell>
                        <TableCell>{getBallotStatusBadge(ballot.status)}</TableCell>
                        <TableCell>
                          {ballot.submission_time
                            ? formatDate(ballot.submission_time)
                            : 'Not submitted'}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(`/ballots/${ballot.id}`, '_blank')}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            
                            {ballot.status === 'submitted' && onConfirm && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="bg-green-50 text-green-700 hover:bg-green-100"
                                onClick={() => onConfirm(ballot.id)}
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                            )}
                            
                            {(ballot.status === 'draft' || ballot.status === 'submitted') && onDiscard && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="bg-red-50 text-red-700 hover:bg-red-100"
                                onClick={() => onDiscard(ballot.id)}
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
