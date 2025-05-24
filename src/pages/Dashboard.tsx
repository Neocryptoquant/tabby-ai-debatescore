
import { Link } from "react-router-dom";
import { Trophy, Users, Calendar, BarChart3, Plus, Activity } from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import PageHeader from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/ui/stat-card";
import { TournamentCard } from "@/components/cards/TournamentCard";
import { AIAssistant } from "@/components/ai/AIAssistant";
import { RoleManager } from "@/components/admin/RoleManager";
import { useUserRole } from "@/hooks/useUserRole";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

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

const Dashboard = () => {
  const { canCreateTournaments } = useUserRole();
  const { user } = useAuth();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserTournaments();
    }
  }, [user]);

  const fetchUserTournaments = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('tournaments')
        .select('*')
        .eq('created_by', user.id)
        .order('created_at', { ascending: false })
        .limit(6);

      if (error) {
        console.error('Error fetching tournaments:', error);
        return;
      }

      setTournaments(data || []);
    } catch (error) {
      console.error('Error fetching tournaments:', error);
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

  const activeTournaments = tournaments.filter(t => t.status === "active");
  const formattedTournaments = tournaments.map(formatTournamentData);
  
  return (
    <MainLayout>
      <PageHeader 
        title="Dashboard"
        description="Welcome back to TabbyAI!"
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

      {/* Show Role Manager if user can't create tournaments */}
      {!canCreateTournaments && user && (
        <RoleManager />
      )}
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="Active Tournaments" 
          value={activeTournaments.length.toString()} 
          icon={<Trophy className="h-6 w-6" />}
        />
        <StatCard 
          title="Total Tournaments" 
          value={tournaments.length.toString()} 
          icon={<Users className="h-6 w-6" />}
        />
        <StatCard 
          title="Status" 
          value={canCreateTournaments ? "Tab Master" : "Attendee"} 
          icon={<Calendar className="h-6 w-6" />}
        />
        <StatCard 
          title="Created Tournaments" 
          value={tournaments.length.toString()} 
          icon={<BarChart3 className="h-6 w-6" />}
        />
      </div>
      
      {/* Activity Section */}
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <Activity className="h-5 w-5 text-tabby-secondary mr-2" />
          <h2 className="text-lg font-semibold">Recent Activity</h2>
        </div>
        <div className="tabby-card space-y-4">
          {tournaments.length > 0 ? (
            tournaments.slice(0, 3).map((tournament) => (
              <div key={tournament.id} className="border-l-4 border-tabby-accent pl-4 py-1">
                <p className="text-sm">Tournament <span className="font-medium">{tournament.name}</span> created</p>
                <p className="text-xs text-gray-500 mt-1">Status: {tournament.status}</p>
              </div>
            ))
          ) : (
            <div className="border-l-4 border-tabby-secondary pl-4 py-1">
              <p className="text-sm">No recent activity</p>
              <p className="text-xs text-gray-500 mt-1">Create your first tournament to get started</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Your Tournaments */}
      <div>
        <div className="flex items-center mb-4">
          <Trophy className="h-5 w-5 text-tabby-secondary mr-2" />
          <h2 className="text-lg font-semibold">Your Tournaments</h2>
        </div>
        
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-tabby-secondary mx-auto"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {formattedTournaments.map((tournament) => (
              <TournamentCard 
                key={tournament.id}
                {...tournament}
              />
            ))}
            
            {canCreateTournaments && (
              <Link to="/tournaments/create">
                <div className="tabby-card h-full border-dashed flex flex-col items-center justify-center text-gray-500 hover:text-tabby-secondary hover:border-tabby-secondary transition-colors group">
                  <div className="h-12 w-12 rounded-full border-2 border-dashed border-current flex items-center justify-center group-hover:border-tabby-secondary">
                    <Plus className="h-6 w-6" />
                  </div>
                  <p className="mt-4 font-medium">Create New Tournament</p>
                </div>
              </Link>
            )}

            {!canCreateTournaments && tournaments.length === 0 && (
              <div className="tabby-card h-full flex flex-col items-center justify-center text-gray-500">
                <Trophy className="h-12 w-12 mb-4" />
                <p className="font-medium">No tournaments yet</p>
                <p className="text-sm text-center">You need tab master role to create tournaments</p>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* AI Assistant */}
      <AIAssistant />
    </MainLayout>
  );
};

export default Dashboard;
