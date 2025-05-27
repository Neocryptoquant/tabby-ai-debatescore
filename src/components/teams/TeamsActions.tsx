
import { useState } from "react";
import { toast } from "sonner";

/**
 * Custom hook for team management actions
 * Provides handlers for team operations with proper state management
 */
export const useTeamsActions = (teams: any[], addTeam: any, deleteTeam: any) => {
  const [isSaving, setIsSaving] = useState(false);

  /**
   * Handles adding a new team with proper error handling and loading states
   */
  const handleAddTeam = async (data: any) => {
    setIsSaving(true);
    try {
      await addTeam({
        name: data.name,
        institution: data.institution,
        speaker_1: data.speaker1_name,
        speaker_2: data.speaker2_name
      });
    } catch (error) {
      // Error already handled in the hook with enhanced feedback
      console.error('Failed to add team:', error);
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * Placeholder for team editing functionality
   */
  const handleEditTeam = (team: any) => {
    toast.info("📝 Edit functionality coming soon!", {
      description: "Team editing will be available in the next update"
    });
    console.log('Edit team:', team);
  };

  /**
   * Handles team deletion with confirmation
   */
  const handleDeleteTeam = async (teamId: string) => {
    await deleteTeam(teamId);
  };

  /**
   * Placeholder for bulk import functionality
   */
  const handleBulkImport = () => {
    toast.info("📁 Bulk import feature coming soon!", {
      description: "CSV import will be available in the next update"
    });
  };

  /**
   * Placeholder for team statistics generation
   */
  const generateTeamStats = () => {
    toast.info("📊 Team statistics feature coming soon!", {
      description: "Advanced analytics will be available soon"
    });
  };

  // Transform teams data to match the TeamsList component interface
  const transformedTeams = teams.map(team => ({
    id: team.id,
    name: team.name,
    institution: team.institution || '',
    speaker1_name: team.speaker_1 || '',
    speaker2_name: team.speaker_2 || '',
    speaker3_name: '',
    speaker4_name: ''
  }));

  return {
    isSaving,
    handleAddTeam,
    handleEditTeam,
    handleDeleteTeam,
    handleBulkImport,
    generateTeamStats,
    transformedTeams
  };
};
