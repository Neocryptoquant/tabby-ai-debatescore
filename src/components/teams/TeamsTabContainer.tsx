import { useTournamentData } from "@/hooks/useTournamentData";
import { TeamsTab } from "./TeamsTab";
import { useState } from "react";
import { toast } from "sonner";
import { TeamForm } from "./TeamForm";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CSVUpload } from "./CSVUpload";
import { Team } from "@/types/tournament";

interface TeamsTabContainerProps {
  tournamentId: string;
}

export const TeamsTabContainer = ({ tournamentId }: TeamsTabContainerProps) => {
  const { teams, addTeam, updateTeam, deleteTeam, isLoading, refetch } = useTournamentData(tournamentId);
  const [isSaving, setIsSaving] = useState(false);
  const [editTeam, setEditTeam] = useState<Team | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCSVModalOpen, setIsCSVModalOpen] = useState(false);

  const transformedTeams = teams.map(team => ({
    ...team,
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

  const handleEditTeam = (team: Team) => {
    setEditTeam(team);
    setIsEditModalOpen(true);
  };

  const handleUpdateTeam = async (data: any) => {
    if (!editTeam) return;
    
    setIsSaving(true);
    try {
      await updateTeam(editTeam.id, {
        name: data.name,
        institution: data.institution,
        speaker_1: data.speaker_1,
        speaker_2: data.speaker_2
      });
      setIsEditModalOpen(false);
      setEditTeam(null);
      toast.success('Team updated successfully!');
    } catch (error) {
      console.error('Error updating team:', error);
      toast.error('Failed to update team');
    } finally {
      setIsSaving(false);
    }
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
    setIsCSVModalOpen(true);
  };

  const handleTeamsUploaded = async (teams: any[]) => {
    setIsSaving(true);
    let successCount = 0;
    let errorCount = 0;
    for (const team of teams) {
      try {
        await addTeam(team);
        successCount++;
      } catch (error) {
        errorCount++;
      }
    }
    setIsSaving(false);
    setIsCSVModalOpen(false);
    toast.success(`Imported ${successCount} teams${errorCount ? ", " + errorCount + " failed" : ""}`);
  };

  const generateTeamStats = () => {
    toast.info('Team stats generation coming soon!');
    console.log('Generate team stats');
  };

  return (
    <>
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
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Team</DialogTitle>
          </DialogHeader>
          {editTeam && (
            <TeamForm
              onSave={handleUpdateTeam}
              isLoading={isSaving}
              defaultValues={{
                name: editTeam.name,
                institution: editTeam.institution || '',
                speaker_1: editTeam.speaker_1 || '',
                speaker_2: editTeam.speaker_2 || ''
              }}
              isEditMode
            />
          )}
        </DialogContent>
      </Dialog>
      <Dialog open={isCSVModalOpen} onOpenChange={setIsCSVModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bulk Import Teams</DialogTitle>
          </DialogHeader>
          <CSVUpload onTeamsUploaded={handleTeamsUploaded} />
        </DialogContent>
      </Dialog>
    </>
  );
};
