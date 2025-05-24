
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ChevronLeft,
  CalendarDays,
  Users,
  MapPin,
  Award,
  Layers,
  BrainCircuit,
} from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import PageHeader from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { AIAssistant } from "@/components/ai/AIAssistant";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const CreateTournament = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { canCreateTournaments, isLoading: roleLoading } = useUserRole();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    format: "",
    startDate: "",
    endDate: "",
    location: "",
    description: "",
    teamCount: "",
    roundCount: "",
    motionsPerRound: "",
    useAI: true,
  });

  // Redirect if user cannot create tournaments
  if (!roleLoading && !canCreateTournaments && user) {
    toast.error("You don't have permission to create tournaments");
    navigate("/tournaments");
    return null;
  }

  // Show loading while checking permissions
  if (roleLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-tabby-secondary"></div>
        </div>
      </MainLayout>
    );
  }
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("You must be logged in to create a tournament");
      return;
    }

    if (!canCreateTournaments) {
      toast.error("You don't have permission to create tournaments");
      return;
    }

    setIsSubmitting(true);
    
    try {
      const { data, error } = await supabase
        .from('tournaments')
        .insert({
          name: formData.name,
          format: formData.format,
          start_date: formData.startDate || null,
          end_date: formData.endDate || null,
          location: formData.location || null,
          description: formData.description || null,
          team_count: formData.teamCount ? parseInt(formData.teamCount) : null,
          round_count: formData.roundCount ? parseInt(formData.roundCount) : null,
          motions_per_round: formData.motionsPerRound ? parseInt(formData.motionsPerRound) : 1,
          created_by: user.id,
          status: 'upcoming'
        })
        .select()
        .single();

      if (error) {
        console.error('Tournament creation error:', error);
        toast.error("Failed to create tournament. Please try again.");
        return;
      }

      toast.success("Tournament created successfully!");
      navigate(`/tournaments/${data.id}`);
    } catch (error) {
      console.error('Tournament creation error:', error);
      toast.error("Failed to create tournament. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <MainLayout>
      <PageHeader 
        title="Create Tournament"
        description="Set up a new debate tournament"
        actions={
          <Button 
            variant="outline"
            onClick={() => navigate(-1)}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        }
      />
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>Enter the details about your tournament</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Tournament Name</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="e.g. International Debating Championship 2025"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="format">Debate Format</Label>
                    <Select 
                      name="format" 
                      value={formData.format}
                      onValueChange={(value) => handleSelectChange("format", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a format" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bp">British Parliamentary (BP)</SelectItem>
                        <SelectItem value="wsdc">World Schools (WSDC)</SelectItem>
                        <SelectItem value="apda">American Parliamentary</SelectItem>
                        <SelectItem value="policy">Policy Debate</SelectItem>
                        <SelectItem value="custom">Custom Format</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        id="location"
                        name="location"
                        placeholder="City, Country"
                        className="pl-10"
                        value={formData.location}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date</Label>
                    <div className="relative">
                      <CalendarDays className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        id="startDate"
                        name="startDate"
                        type="date"
                        className="pl-10"
                        value={formData.startDate}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="endDate">End Date</Label>
                    <div className="relative">
                      <CalendarDays className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        id="endDate"
                        name="endDate"
                        type="date"
                        className="pl-10"
                        value={formData.endDate}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Add details about your tournament..."
                    rows={3}
                    value={formData.description}
                    onChange={handleChange}
                  />
                </div>
              </CardContent>
            </Card>
            
            {/* Tournament Structure */}
            <Card>
              <CardHeader>
                <CardTitle>Tournament Structure</CardTitle>
                <CardDescription>Configure how the tournament will be structured</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="teamCount">Number of Teams</Label>
                    <div className="relative">
                      <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        id="teamCount"
                        name="teamCount"
                        type="number"
                        className="pl-10"
                        value={formData.teamCount}
                        onChange={handleChange}
                        min="4"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="roundCount">Number of Rounds</Label>
                    <div className="relative">
                      <Layers className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        id="roundCount"
                        name="roundCount"
                        type="number"
                        className="pl-10"
                        value={formData.roundCount}
                        onChange={handleChange}
                        min="1"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="motionsPerRound">Motions per Round</Label>
                    <div className="relative">
                      <Award className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        id="motionsPerRound"
                        name="motionsPerRound"
                        type="number"
                        className="pl-10"
                        value={formData.motionsPerRound}
                        onChange={handleChange}
                        min="1"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="space-y-6">
            {/* AI Features */}
            <Card className="border-2 border-tabby-secondary/30">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <BrainCircuit className="h-5 w-5 text-tabby-secondary" />
                  <CardTitle>AI Features</CardTitle>
                </div>
                <CardDescription>Enable AI-powered assistance for your tournament</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium">AI-Powered Pairings</h4>
                    <p className="text-xs text-gray-500">Optimize team match-ups based on performance</p>
                  </div>
                  <div className="flex items-center h-5">
                    <input
                      id="ai-pairings"
                      type="checkbox"
                      defaultChecked
                      className="h-4 w-4 rounded border-gray-300 text-tabby-secondary focus:ring-tabby-secondary"
                    />
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium">Judge Allocation</h4>
                    <p className="text-xs text-gray-500">Minimize conflicts of interest in judging panels</p>
                  </div>
                  <div className="flex items-center h-5">
                    <input
                      id="ai-judging"
                      type="checkbox"
                      defaultChecked
                      className="h-4 w-4 rounded border-gray-300 text-tabby-secondary focus:ring-tabby-secondary"
                    />
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium">Motion Balance Analysis</h4>
                    <p className="text-xs text-gray-500">Assess fairness of debate motions</p>
                  </div>
                  <div className="flex items-center h-5">
                    <input
                      id="ai-motions"
                      type="checkbox"
                      defaultChecked
                      className="h-4 w-4 rounded border-gray-300 text-tabby-secondary focus:ring-tabby-secondary"
                    />
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium">Results Prediction</h4>
                    <p className="text-xs text-gray-500">Predict outcomes based on past performance</p>
                  </div>
                  <div className="flex items-center h-5">
                    <input
                      id="ai-prediction"
                      type="checkbox"
                      checked={formData.useAI}
                      onChange={() => setFormData({ ...formData, useAI: !formData.useAI })}
                      className="h-4 w-4 rounded border-gray-300 text-tabby-secondary focus:ring-tabby-secondary"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Summary Card */}
            <Card>
              <CardHeader>
                <CardTitle>Tournament Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">
                  You're creating a {formData.format ? formData.format.toUpperCase() : "[Format]"} format tournament with{" "}
                  {formData.teamCount || "[N]"} teams and {formData.roundCount || "[N]"} rounds.
                </p>
              </CardContent>
              <CardFooter>
                <Button 
                  type="submit" 
                  className="w-full bg-tabby-secondary hover:bg-tabby-secondary/90"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Creating..." : "Create Tournament"}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </form>
      
      {/* AI Assistant */}
      <AIAssistant />
    </MainLayout>
  );
};

export default CreateTournament;
