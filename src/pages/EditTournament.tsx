
import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { ChevronLeft, Save, Loader2 } from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import PageHeader from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TournamentSettingsForm } from "@/components/forms/TournamentSettingsForm";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useUserRole } from "@/hooks/useUserRole";
import { BreakCategory } from "@/types/tournament";

// Tournament form data interface
interface TournamentFormData {
  name: string;
  format: string;
  start_date: string;
  end_date: string;
  location: string;
  description: string;
  team_count: number;
  round_count: number;
  motions_per_round: number;
  break_type: "finals" | "semis" | "quarters" | "none";
  status: "active" | "upcoming" | "completed";
}

// Tournament data from database interface - updated to match database schema
interface DatabaseTournament {
  id: string;
  name: string;
  format: string | null;
  start_date: string | null;
  end_date: string | null;
  location: string | null;
  description: string | null;
  team_count: number | null;
  round_count: number | null;
  motions_per_round: number | null;
  break_type: string | null;
  status: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

const EditTournament = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { canEditTournament } = useUserRole();
  const [tournament, setTournament] = useState<DatabaseTournament | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [breakCategories, setBreakCategories] = useState<BreakCategory[]>([]);

  // React Hook Form setup with proper typing
  const form = useForm<TournamentFormData>({
    defaultValues: {
      name: "",
      format: "bp",
      start_date: "",
      end_date: "",
      location: "",
      description: "",
      team_count: 16,
      round_count: 6,
      motions_per_round: 1,
      break_type: "none",
      status: "upcoming",
    },
  });

  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = form;

  // Load tournament data when component mounts
  useEffect(() => {
    if (id) {
      fetchTournament();
    }
  }, [id]);

  // Check permissions after tournament is loaded
  useEffect(() => {
    if (tournament && !canEditTournament(tournament.created_by)) {
      toast.error("You don't have permission to edit this tournament");
      navigate(`/tournaments/${id}`);
    }
  }, [tournament, canEditTournament, navigate, id]);

  // Fetch tournament from database
  const fetchTournament = async () => {
    try {
      console.log('Fetching tournament for edit:', id);
      
      const { data, error } = await supabase
        .from('tournaments')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching tournament:', error);
        toast.error("Failed to load tournament");
        navigate('/tournaments');
        return;
      }

      console.log('Tournament data loaded:', data);
      
      // Add break_type to the data with proper null handling
      const tournamentData: DatabaseTournament = {
        ...data,
        break_type: data.break_type || null
      };
      
      setTournament(tournamentData);

      // Populate form with tournament data, providing defaults for null values
      const formData: TournamentFormData = {
        name: tournamentData.name || "",
        format: tournamentData.format || "bp",
        start_date: tournamentData.start_date || "",
        end_date: tournamentData.end_date || "",
        location: tournamentData.location || "",
        description: tournamentData.description || "",
        team_count: tournamentData.team_count || 16,
        round_count: tournamentData.round_count || 6,
        motions_per_round: tournamentData.motions_per_round || 1,
        break_type: (tournamentData.break_type as "finals" | "semis" | "quarters" | "none") || "none",
        status: (tournamentData.status as "active" | "upcoming" | "completed") || "upcoming",
      };

      // Set form values
      Object.entries(formData).forEach(([key, value]) => {
        setValue(key as keyof TournamentFormData, value);
      });

    } catch (error) {
      console.error('Error fetching tournament:', error);
      toast.error("Failed to load tournament");
      navigate('/tournaments');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle form submission
  const onSubmit = async (data: TournamentFormData) => {
    if (!tournament) return;

    try {
      console.log('Updating tournament with data:', data);

      // Prepare update data
      const updateData = {
        name: data.name,
        format: data.format,
        start_date: data.start_date,
        end_date: data.end_date,
        location: data.location,
        description: data.description,
        team_count: data.team_count,
        round_count: data.round_count,
        motions_per_round: data.motions_per_round,
        break_type: data.break_type,
        status: data.status,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('tournaments')
        .update(updateData)
        .eq('id', tournament.id);

      if (error) {
        console.error('Error updating tournament:', error);
        toast.error("Failed to update tournament");
        return;
      }

      console.log('Tournament updated successfully');
      toast.success("Tournament updated successfully!");
      navigate(`/tournaments/${id}`);
    } catch (error) {
      console.error('Error updating tournament:', error);
      toast.error("Failed to update tournament");
    }
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

  // Show error if tournament not found
  if (!tournament) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold text-gray-900">Tournament not found</h2>
          <p className="mt-2 text-gray-600">The tournament you're trying to edit doesn't exist.</p>
          <Link to="/tournaments">
            <Button className="mt-4">Back to Tournaments</Button>
          </Link>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <PageHeader 
        title="Edit Tournament"
        description={`Editing: ${tournament.name}`}
        actions={
          <div className="flex flex-col sm:flex-row gap-2">
            <Link to={`/tournaments/${id}`}>
              <Button variant="outline">
                <ChevronLeft className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </Link>
          </div>
        }
      />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information Card */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Tournament Name */}
            <div>
              <Label htmlFor="name">Tournament Name *</Label>
              <Input
                id="name"
                {...register("name", { required: "Tournament name is required" })}
                placeholder="Enter tournament name"
              />
              {errors.name && (
                <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
              )}
            </div>

            {/* Format Selection */}
            <div>
              <Label htmlFor="format">Debate Format *</Label>
              <Select value={watch("format")} onValueChange={(value) => setValue("format", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select debate format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bp">British Parliamentary (BP)</SelectItem>
                  <SelectItem value="wsdc">World Schools Debate (WSDC)</SelectItem>
                  <SelectItem value="apda">American Parliamentary (APDA)</SelectItem>
                  <SelectItem value="policy">Policy Debate</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                {...register("description")}
                placeholder="Enter tournament description"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Schedule & Location Card */}
        <Card>
          <CardHeader>
            <CardTitle>Schedule & Location</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Date Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="start_date">Start Date</Label>
                <Input
                  id="start_date"
                  type="date"
                  {...register("start_date")}
                />
              </div>
              <div>
                <Label htmlFor="end_date">End Date</Label>
                <Input
                  id="end_date"
                  type="date"
                  {...register("end_date")}
                />
              </div>
            </div>

            {/* Location */}
            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                {...register("location")}
                placeholder="Enter tournament location"
              />
            </div>
          </CardContent>
        </Card>

        {/* Tournament Settings with Break Categories */}
        <TournamentSettingsForm 
          form={form}
          breakCategories={breakCategories}
          setBreakCategories={setBreakCategories}
        />

        {/* Status */}
        <Card>
          <CardHeader>
            <CardTitle>Tournament Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <Label htmlFor="status">Tournament Status</Label>
              <Select value={watch("status")} onValueChange={(value: "active" | "upcoming" | "completed") => setValue("status", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end">
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="bg-tabby-secondary hover:bg-tabby-secondary/90"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving Changes...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </form>
    </MainLayout>
  );
};

export default EditTournament;
