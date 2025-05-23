
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
import { toast } from "sonner";
import { AIAssistant } from "@/components/ai/AIAssistant";
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
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const CreateTournament = () => {
  const navigate = useNavigate();
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
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      toast.success("Tournament created successfully!");
      navigate("/tournaments");
    }, 1500);
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
                  <FormLabel htmlFor="name">Tournament Name</FormLabel>
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
                    <FormLabel htmlFor="format">Debate Format</FormLabel>
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
                    <FormLabel htmlFor="location">Location</FormLabel>
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
                    <FormLabel htmlFor="startDate">Start Date</FormLabel>
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
                    <FormLabel htmlFor="endDate">End Date</FormLabel>
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
                  <FormLabel htmlFor="description">Description</FormLabel>
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
                    <FormLabel htmlFor="teamCount">Number of Teams</FormLabel>
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
                    <FormLabel htmlFor="roundCount">Number of Rounds</FormLabel>
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
                    <FormLabel htmlFor="motionsPerRound">Motions per Round</FormLabel>
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
