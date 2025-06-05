
import { useTournamentData } from "@/hooks/useTournamentData";
import { TeamsTab } from "./TeamsTab";
import { useState } from "react";
import { toast } from "sonner";

interface TeamsTabContainerProps {
  tournamentId: string;
}

export const TeamsTabContainer = ({ tournamentId }: TeamsTabContainerProps) => {
  const { teams, addTeam, deleteTeam, isLoading, refetch } = useTournamentData(tournamentId);
  const [isSaving, setIsSaving] = useState(false);

  const transformedTeams = teams.map(team => ({
    id: team.id,
    name: team.name,
    institution: team.institution || 'No Institution',
    speaker_1: team.speaker_1 || 'TBD',
    speaker_2: team.speaker_2 || 'TBD'
  }));

  const handleAddTeam = async (data: any) => {
    setIsSaving(true);
    try {
      await addTeam({
        name: data.name,
        institution: data.institution || '',
        speaker_1: data.speaker_1 || '',
        speaker_2: data.speaker_2 || ''
      });
      toast.success('Team added successfully!');
    } catch (error) {
      console.error('Error adding team:', error);
      toast.error('Failed to add team');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditTeam = (team: any) => {
    toast.info('Edit functionality coming soon!');
    console.log('Edit team:', team);
  };

  const handleDeleteTeam = async (teamId: string) => {
    try {
      await deleteTeam(teamId);
      toast.success('Team deleted successfully!');
    } catch (error) {
      console.error('Error deleting team:', error);
      toast.error('Failed to delete team');
    }
  };

  const handleBulkImport = () => {
    toast.info('Use the CSV upload in the Overview tab for bulk import');
  };

  const generateTeamStats = () => {
    toast.info('Team stats generation coming soon!');
    console.log('Generate team stats');
  };

  return (
    <TeamsTab
      transformedTeams={transformedTeams}
      isLoading={isLoading}
      isSaving={isSaving}
      handleAddTeam={handleAddTeam}
      handleEditTeam={handleEditTeam}
      handleDeleteTeam={handleDeleteTeam}
      handleBulkImport={handleBulkImport}
      generateTeamStats={generateTeamStats}
      teams={teams}
    />
  );
};
