
import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ChevronLeft, Save, Trash2 } from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import PageHeader from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useUserRole } from "@/hooks/useUserRole";

// Form validation schema for tournament editing
const tournamentFormSchema = z.object({
  name: z.string().min(1, "Tournament name is required"),
  format: z.string().min(1, "Format is required"),
  location: z.string().optional(),
  description: z.string().optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  team_count: z.coerce.number().min(1, "Must have at least 1 team").optional(),
  round_count: z.coerce.number().min(1, "Must have at least 1 round").optional(),
  motions_per_round: z.coerce.number().min(1, "Must have at least 1 motion per round").optional(),
  status: z.enum(["upcoming", "active", "completed"]),
});

type TournamentFormValues = z.infer<typeof tournamentFormSchema>;

const EditTournament = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { canEditTournaments, canDeleteTournaments } = useUserRole();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Initialize form with react-hook-form
  const form = useForm<TournamentFormValues>({
    resolver: zodResolver(tournamentFormSchema),
    defaultValues: {
      name: "",
      format: "",
      location: "",
      description: "",
      start_date: "",
      end_date: "",
      team_count: undefined,
      round_count: undefined,
      motions_per_round: 1,
      status: "upcoming",
    },
  });

  // Load tournament data on component mount
  useEffect(() => {
    if (id) {
      fetchTournament();
    }
  }, [id]);

  // Fetch tournament data from database
  const fetchTournament = async () => {
    try {
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

      // Format dates for input fields (YYYY-MM-DD format)
      const formattedData = {
        ...data,
        start_date: data.start_date || "",
        end_date: data.end_date || "",
        location: data.location || "",
        description: data.description || "",
        team_count: data.team_count || undefined,
        round_count: data.round_count || undefined,
        motions_per_round: data.motions_per_round || 1,
      };

      // Update form with fetched data
      form.reset(formattedData);
    } catch (error) {
      console.error('Error fetching tournament:', error);
      toast.error("Failed to load tournament");
      navigate('/tournaments');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle form submission to update tournament
  const onSubmit = async (values: TournamentFormValues) => {
    if (!canEditTournaments) {
      toast.error("You don't have permission to edit tournaments");
      return;
    }

    setIsSaving(true);
    try {
      console.log('Updating tournament with values:', values);

      // Prepare data for database update
      const updateData = {
        ...values,
        start_date: values.start_date || null,
        end_date: values.end_date || null,
        location: values.location || null,
        description: values.description || null,
        team_count: values.team_count || null,
        round_count: values.round_count || null,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('tournaments')
        .update(updateData)
        .eq('id', id);

      if (error) {
        console.error('Error updating tournament:', error);
        toast.error("Failed to update tournament");
        return;
      }

      toast.success("Tournament updated successfully!");
      navigate(`/tournaments/${id}`);
    } catch (error) {
      console.error('Error updating tournament:', error);
      toast.error("Failed to update tournament");
    } finally {
      setIsSaving(false);
    }
  };

  // Handle tournament deletion
  const handleDelete = async () => {
    if (!canDeleteTournaments) {
      toast.error("You don't have permission to delete tournaments");
      return;
    }

    if (!confirm("Are you sure you want to delete this tournament? This action cannot be undone.")) {
      return;
    }

    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('tournaments')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting tournament:', error);
        toast.error("Failed to delete tournament");
        return;
      }

      toast.success("Tournament deleted successfully!");
      navigate('/tournaments');
    } catch (error) {
      console.error('Error deleting tournament:', error);
      toast.error("Failed to delete tournament");
    } finally {
      setIsDeleting(false);
    }
  };

  // Show loading state while fetching data
  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-tabby-secondary"></div>
        </div>
      </MainLayout>
    );
  }

  // Show permission error if user can't edit
  if (!canEditTournaments) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold text-gray-900">Access Denied</h2>
          <p className="mt-2 text-gray-600">You don't have permission to edit tournaments.</p>
          <Link to={`/tournaments/${id}`}>
            <Button className="mt-4">Back to Tournament</Button>
          </Link>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <PageHeader 
        title="Edit Tournament"
        description="Update tournament details and settings"
        actions={
          <div className="flex flex-col sm:flex-row gap-2">
            <Link to={`/tournaments/${id}`}>
              <Button variant="outline">
                <ChevronLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            {canDeleteTournaments && (
              <Button 
                variant="destructive" 
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </>
                )}
              </Button>
            )}
          </div>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Tournament Details</CardTitle>
          <CardDescription>
            Update the tournament information and settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Basic Information Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tournament Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter tournament name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="format"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Format *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select debate format" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="bp">British Parliamentary</SelectItem>
                          <SelectItem value="wsdc">World Schools</SelectItem>
                          <SelectItem value="apda">American Parliamentary</SelectItem>
                          <SelectItem value="policy">Policy Debate</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter location" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="upcoming">Upcoming</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Date Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="start_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="end_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Tournament Settings Section */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="team_count"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Number of Teams</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="1" 
                          placeholder="e.g. 32" 
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormDescription>
                        Expected number of participating teams
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="round_count"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Number of Rounds</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="1" 
                          placeholder="e.g. 6" 
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormDescription>
                        Total number of preliminary rounds
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="motions_per_round"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Motions per Round</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="1" 
                          placeholder="1" 
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormDescription>
                        Number of motions for each round
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Description Section */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter tournament description..."
                        className="resize-none h-24"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Provide additional details about the tournament
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Submit Button */}
              <div className="flex justify-end">
                <Button 
                  type="submit" 
                  disabled={isSaving}
                  className="bg-tabby-secondary hover:bg-tabby-secondary/90"
                >
                  {isSaving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
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
          </Form>
        </CardContent>
      </Card>
    </MainLayout>
  );
};

export default EditTournament;
