
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ChevronLeft, Plus, Users, Trash2, Edit } from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import PageHeader from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useUserRole } from "@/hooks/useUserRole";

// Team interface for type safety
interface Team {
  id: string;
  name: string;
  institution: string;
  speaker1_name: string;
  speaker2_name: string;
  speaker3_name?: string;
  speaker4_name?: string;
  created_at: string;
}

const TournamentTeams = () => {
  const { id } = useParams<{ id: string }>();
  const { canEditTournaments } = useUserRole();
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);

  // Form state for team creation/editing
  const [formData, setFormData] = useState({
    name: "",
    institution: "",
    speaker1_name: "",
    speaker2_name: "",
    speaker3_name: "",
    speaker4_name: "",
  });

  // Load teams when component mounts
  useEffect(() => {
    if (id) {
      fetchTeams();
    }
  }, [id]);

  // Fetch teams from database (mock implementation for now)
  const fetchTeams = async () => {
    try {
      // TODO: Replace with actual database query once teams table is created
      console.log('Fetching teams for tournament:', id);
      
      // Mock data for demonstration
      const mockTeams: Team[] = [
        {
          id: "1",
          name: "Oxford A",
          institution: "Oxford University",
          speaker1_name: "John Smith",
          speaker2_name: "Jane Doe",
          speaker3_name: "Bob Wilson",
          speaker4_name: "",
          created_at: new Date().toISOString(),
        },
        {
          id: "2", 
          name: "Cambridge A",
          institution: "Cambridge University",
          speaker1_name: "Alice Johnson",
          speaker2_name: "Charlie Brown",
          speaker3_name: "",
          speaker4_name: "",
          created_at: new Date().toISOString(),
        },
      ];

      setTeams(mockTeams);
    } catch (error) {
      console.error('Error fetching teams:', error);
      toast.error("Failed to load teams");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Reset form to default state
  const resetForm = () => {
    setFormData({
      name: "",
      institution: "",
      speaker1_name: "",
      speaker2_name: "",
      speaker3_name: "",
      speaker4_name: "",
    });
    setEditingTeam(null);
  };

  // Handle team creation or update
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!canEditTournaments) {
      toast.error("You don't have permission to manage teams");
      return;
    }

    // Validate required fields
    if (!formData.name || !formData.institution || !formData.speaker1_name || !formData.speaker2_name) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingTeam) {
        // Update existing team
        console.log('Updating team:', editingTeam.id, formData);
        // TODO: Implement actual database update
        
        // Update local state for demonstration
        setTeams(prev => prev.map(team => 
          team.id === editingTeam.id 
            ? { ...team, ...formData }
            : team
        ));
        
        toast.success("Team updated successfully!");
      } else {
        // Create new team
        console.log('Creating new team:', formData);
        // TODO: Implement actual database insert
        
        // Add to local state for demonstration
        const newTeam: Team = {
          id: Date.now().toString(),
          ...formData,
          created_at: new Date().toISOString(),
        };
        
        setTeams(prev => [...prev, newTeam]);
        toast.success("Team created successfully!");
      }

      // Reset form and close dialog
      resetForm();
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error saving team:', error);
      toast.error("Failed to save team");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle team deletion
  const handleDelete = async (teamId: string) => {
    if (!canEditTournaments) {
      toast.error("You don't have permission to delete teams");
      return;
    }

    if (!confirm("Are you sure you want to delete this team?")) {
      return;
    }

    try {
      console.log('Deleting team:', teamId);
      // TODO: Implement actual database delete
      
      // Remove from local state for demonstration
      setTeams(prev => prev.filter(team => team.id !== teamId));
      toast.success("Team deleted successfully!");
    } catch (error) {
      console.error('Error deleting team:', error);
      toast.error("Failed to delete team");
    }
  };

  // Handle edit button click
  const handleEdit = (team: Team) => {
    setEditingTeam(team);
    setFormData({
      name: team.name,
      institution: team.institution,
      speaker1_name: team.speaker1_name,
      speaker2_name: team.speaker2_name,
      speaker3_name: team.speaker3_name || "",
      speaker4_name: team.speaker4_name || "",
    });
    setIsDialogOpen(true);
  };

  // Show loading state
  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-tabby-secondary"></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <PageHeader 
        title="Teams Management"
        description="Manage teams participating in this tournament"
        actions={
          <div className="flex flex-col sm:flex-row gap-2">
            <Link to={`/tournaments/${id}`}>
              <Button variant="outline">
                <ChevronLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            {canEditTournaments && (
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    className="bg-tabby-secondary hover:bg-tabby-secondary/90"
                    onClick={() => {
                      resetForm();
                      setIsDialogOpen(true);
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Team
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>
                      {editingTeam ? 'Edit Team' : 'Add New Team'}
                    </DialogTitle>
                    <DialogDescription>
                      {editingTeam ? 'Update team information' : 'Enter the team details below'}
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="name">Team Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        placeholder="e.g. Oxford A"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="institution">Institution *</Label>
                      <Input
                        id="institution"
                        value={formData.institution}
                        onChange={(e) => handleInputChange('institution', e.target.value)}
                        placeholder="e.g. Oxford University"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="speaker1">Speaker 1 Name *</Label>
                      <Input
                        id="speaker1"
                        value={formData.speaker1_name}
                        onChange={(e) => handleInputChange('speaker1_name', e.target.value)}
                        placeholder="First speaker name"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="speaker2">Speaker 2 Name *</Label>
                      <Input
                        id="speaker2"
                        value={formData.speaker2_name}
                        onChange={(e) => handleInputChange('speaker2_name', e.target.value)}
                        placeholder="Second speaker name"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="speaker3">Speaker 3 Name</Label>
                      <Input
                        id="speaker3"
                        value={formData.speaker3_name}
                        onChange={(e) => handleInputChange('speaker3_name', e.target.value)}
                        placeholder="Third speaker name (optional)"
                      />
                    </div>
                    <div>
                      <Label htmlFor="speaker4">Speaker 4 Name</Label>
                      <Input
                        id="speaker4"
                        value={formData.speaker4_name}
                        onChange={(e) => handleInputChange('speaker4_name', e.target.value)}
                        placeholder="Fourth speaker name (optional)"
                      />
                    </div>
                    <div className="flex justify-end gap-2 pt-4">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => {
                          resetForm();
                          setIsDialogOpen(false);
                        }}
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="submit"
                        disabled={isSubmitting}
                        className="bg-tabby-secondary hover:bg-tabby-secondary/90"
                      >
                        {isSubmitting ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            {editingTeam ? 'Updating...' : 'Adding...'}
                          </>
                        ) : (
                          editingTeam ? 'Update Team' : 'Add Team'
                        )}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </div>
        }
      />

      {/* Teams List */}
      <div className="space-y-4">
        {teams.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-700">No teams registered</h3>
              <p className="text-gray-500 mt-2 mb-6">Get started by adding the first team</p>
              {canEditTournaments && (
                <Button 
                  className="bg-tabby-secondary hover:bg-tabby-secondary/90"
                  onClick={() => {
                    resetForm();
                    setIsDialogOpen(true);
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Team
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {teams.map((team) => (
              <Card key={team.id}>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{team.name}</CardTitle>
                      <CardDescription>{team.institution}</CardDescription>
                    </div>
                    {canEditTournaments && (
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit(team)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(team.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="text-sm">
                      <span className="font-medium">Speaker 1:</span> {team.speaker1_name}
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Speaker 2:</span> {team.speaker2_name}
                    </div>
                    {team.speaker3_name && (
                      <div className="text-sm">
                        <span className="font-medium">Speaker 3:</span> {team.speaker3_name}
                      </div>
                    )}
                    {team.speaker4_name && (
                      <div className="text-sm">
                        <span className="font-medium">Speaker 4:</span> {team.speaker4_name}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default TournamentTeams;
