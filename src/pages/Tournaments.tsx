
import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Search, Filter, Trophy } from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import PageHeader from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TournamentCard } from "@/components/cards/TournamentCard";
import { AIAssistant } from "@/components/ai/AIAssistant";
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

const Tournaments = () => {
  const [searchQuery, setSearchQuery] = useState("");
  
  // Mock data - would come from API in real app
  const tournaments = [
    {
      id: "1",
      name: "Global Debate Championship",
      format: "BP",
      date: "May 25-27, 2025",
      teamCount: 32,
      location: "London, UK",
      status: "active" as const,
    },
    {
      id: "2",
      name: "Regional Schools Competition",
      format: "WSDC",
      date: "June 10-12, 2025",
      teamCount: 16,
      location: "New York, USA",
      status: "upcoming" as const,
    },
    {
      id: "3",
      name: "University Invitational",
      format: "BP",
      date: "April 15-17, 2025",
      teamCount: 24,
      location: "Toronto, Canada",
      status: "completed" as const,
    },
    {
      id: "4",
      name: "National Debate League Finals",
      format: "WSDC",
      date: "March 3-5, 2025",
      teamCount: 8,
      location: "Sydney, Australia",
      status: "completed" as const,
    }
  ];
  
  const activeTournaments = tournaments.filter(t => t.status === "active");
  const upcomingTournaments = tournaments.filter(t => t.status === "upcoming");
  const completedTournaments = tournaments.filter(t => t.status === "completed");
  
  const filteredTournaments = (items: typeof tournaments) => {
    if (!searchQuery) return items;
    return items.filter(t => 
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.format.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };
  
  return (
    <MainLayout>
      <PageHeader 
        title="Tournaments"
        description="Manage all your debate tournaments"
        actions={
          <Link to="/tournaments/create">
            <Button className="bg-tabby-secondary hover:bg-tabby-secondary/90">
              <Plus className="h-4 w-4 mr-2" />
              New Tournament
            </Button>
          </Link>
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
          {filteredTournaments(tournaments).length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTournaments(tournaments).map((tournament) => (
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
