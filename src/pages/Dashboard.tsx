
import { Link } from "react-router-dom";
import { Trophy, Users, Calendar, BarChart3, Plus, Activity } from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import PageHeader from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/ui/stat-card";
import { TournamentCard } from "@/components/cards/TournamentCard";
import { AIAssistant } from "@/components/ai/AIAssistant";

const Dashboard = () => {
  // Mock data - would come from API in real app
  const activeTournaments = [
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
    }
  ];
  
  return (
    <MainLayout>
      <PageHeader 
        title="Dashboard"
        description="Welcome back to TabbyAI!"
        actions={
          <Link to="/tournaments/create">
            <Button className="bg-tabby-secondary hover:bg-tabby-secondary/90">
              <Plus className="h-4 w-4 mr-2" />
              New Tournament
            </Button>
          </Link>
        }
      />
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="Active Tournaments" 
          value="2" 
          icon={<Trophy className="h-6 w-6" />}
          trend={{ value: 33, isPositive: true }}
        />
        <StatCard 
          title="Total Teams" 
          value="48" 
          icon={<Users className="h-6 w-6" />}
        />
        <StatCard 
          title="Upcoming Rounds" 
          value="6" 
          icon={<Calendar className="h-6 w-6" />}
        />
        <StatCard 
          title="Completed Debates" 
          value="24" 
          icon={<BarChart3 className="h-6 w-6" />}
          trend={{ value: 12, isPositive: true }}
        />
      </div>
      
      {/* Activity Section */}
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <Activity className="h-5 w-5 text-tabby-secondary mr-2" />
          <h2 className="text-lg font-semibold">Recent Activity</h2>
        </div>
        <div className="tabby-card space-y-4">
          <div className="border-l-4 border-tabby-accent pl-4 py-1">
            <p className="text-sm">Round 3 of <span className="font-medium">Global Debate Championship</span> starts in 30 minutes</p>
            <p className="text-xs text-gray-500 mt-1">13:30 PM</p>
          </div>
          <div className="border-l-4 border-tabby-secondary pl-4 py-1">
            <p className="text-sm">New team <span className="font-medium">Eloquent Eagles</span> registered for Regional Schools Competition</p>
            <p className="text-xs text-gray-500 mt-1">11:45 AM</p>
          </div>
          <div className="border-l-4 border-tabby-warning pl-4 py-1">
            <p className="text-sm">Round 2 results for <span className="font-medium">Global Debate Championship</span> are now ready</p>
            <p className="text-xs text-gray-500 mt-1">Yesterday</p>
          </div>
        </div>
      </div>
      
      {/* Active Tournaments */}
      <div>
        <div className="flex items-center mb-4">
          <Trophy className="h-5 w-5 text-tabby-secondary mr-2" />
          <h2 className="text-lg font-semibold">Your Tournaments</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeTournaments.map((tournament) => (
            <TournamentCard 
              key={tournament.id}
              {...tournament}
            />
          ))}
          
          <Link to="/tournaments/create">
            <div className="tabby-card h-full border-dashed flex flex-col items-center justify-center text-gray-500 hover:text-tabby-secondary hover:border-tabby-secondary transition-colors group">
              <div className="h-12 w-12 rounded-full border-2 border-dashed border-current flex items-center justify-center group-hover:border-tabby-secondary">
                <Plus className="h-6 w-6" />
              </div>
              <p className="mt-4 font-medium">Create New Tournament</p>
            </div>
          </Link>
        </div>
      </div>
      
      {/* AI Assistant */}
      <AIAssistant />
    </MainLayout>
  );
};

export default Dashboard;
