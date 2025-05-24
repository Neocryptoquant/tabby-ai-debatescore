import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Plus, Search, Filter, Trophy } from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import PageHeader from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TournamentCard } from "@/components/cards/TournamentCard";
import { AIAssistant } from "@/components/ai/AIAssistant";
import { supabase } from "@/integrations/supabase/client";
import { useUserRole } from "@/hooks/useUserRole";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

type Tournament = {
  id: string;
  name: string;
  format: string | null;
  start_date: string | null;
  end_date: string | null;
  team_count: number | null;
  location: string | null;
  status: string | null;
};

const Tournaments = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { canCreateTournaments } = useUserRole();
  
  useEffect(() => {
    fetchTournaments();
  }, []);

  const fetchTournaments = async () => {
    try {
      const { data, error } = await supabase
        .from('tournaments')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching tournaments:', error);
        toast.error("Failed to load tournaments");
        return;
      }

      setTournaments(data || []);
    } catch (error) {
      console.error('Error fetching tournaments:', error);
      toast.error("Failed to load tournaments");
    } finally {
      setIsLoading(false);
    }
  };

  const formatTournamentData = (tournament: Tournament) => {
    const formatDate = (dateStr: string | null) => {
      if (!dateStr) return "TBD";
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric' 
      });
    };

    const startDate = formatDate(tournament.start_date);
    const endDate = formatDate(tournament.end_date);
    const dateRange = startDate === endDate ? startDate : `${startDate} - ${endDate}`;

    return {
      id: tournament.id,
      name: tournament.name,
      format: tournament.format?.toUpperCase() || "TBD",
      date: dateRange,
      teamCount: tournament.team_count || 0,
      location: tournament.location || "TBD",
      status: (tournament.status as "active" | "upcoming" | "completed") || "upcoming",
    };
  };
  
  const activeTournaments = tournaments.filter(t => t.status === "active").map(formatTournamentData);
  const upcomingTournaments = tournaments.filter(t => t.status === "upcoming").map(formatTournamentData);
  const completedTournaments = tournaments.filter(t => t.status === "completed").map(formatTournamentData);
  const allFormattedTournaments = tournaments.map(formatTournamentData);
  
  const filteredTournaments = (items: ReturnType<typeof formatTournamentData>[]) => {
    if (!searchQuery) return items;
    return items.filter(t => 
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.format.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

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
        title="Tournaments"
        description="Manage all your debate tournaments"
        actions={
          canCreateTournaments ? (
            <Link to="/tournaments/create">
              <Button className="bg-tabby-secondary hover:bg-tabby-secondary/90">
                <Plus className="h-4 w-4 mr-2" />
                New Tournament
              </Button>
            </Link>
          ) : null
        }
      />
      
      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tournaments..."
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2">
          <Select defaultValue="all">
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Format" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Formats</SelectItem>
              <SelectItem value="bp">BP</SelectItem>
              <SelectItem value="wsdc">WSDC</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" className="px-3">
            <Filter className="h-4 w-4" />
            <span className="sr-only md:not-sr-only md:ml-2">Filters</span>
          </Button>
        </div>
      </div>
      
      {/* Tabs and Tournament List */}
      <Tabs defaultValue="all" className="space-y-6">
        <TabsList className="grid grid-cols-4 max-w-md">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="space-y-6">
          {filteredTournaments(allFormattedTournaments).length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTournaments(allFormattedTournaments).map((tournament) => (
                <TournamentCard 
                  key={tournament.id}
                  {...tournament}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Trophy className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-700">No tournaments found</h3>
              <p className="text-gray-500 mt-2">Try adjusting your search filters</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="active" className="space-y-6">
          {filteredTournaments(activeTournaments).length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTournaments(activeTournaments).map((tournament) => (
                <TournamentCard 
                  key={tournament.id}
                  {...tournament}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Trophy className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-700">No active tournaments</h3>
              <p className="text-gray-500 mt-2">Create a new tournament to get started</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="upcoming" className="space-y-6">
          {filteredTournaments(upcomingTournaments).length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTournaments(upcomingTournaments).map((tournament) => (
                <TournamentCard 
                  key={tournament.id}
                  {...tournament}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Trophy className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-700">No upcoming tournaments</h3>
              <p className="text-gray-500 mt-2">Plan your next tournament</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="completed" className="space-y-6">
          {filteredTournaments(completedTournaments).length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTournaments(completedTournaments).map((tournament) => (
                <TournamentCard 
                  key={tournament.id}
                  {...tournament}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Trophy className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-700">No completed tournaments</h3>
              <p className="text-gray-500 mt-2">Your tournament history will appear here</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      {/* AI Assistant */}
      <AIAssistant />
    </MainLayout>
  );
};

export default Tournaments;
