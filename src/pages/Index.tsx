import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BrainCircuit, Trophy, Users, Calendar, BarChart3, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { TournamentCard } from "@/components/cards/TournamentCard";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  const filteredTournaments = tournaments
    .map(formatTournamentData)
    .filter(t => 
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.format.toLowerCase().includes(searchQuery.toLowerCase())
    );

  return (
    <div className="flex flex-col min-h-screen">
      {/* Navigation */}
      <header className="bg-white shadow-sm">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <BrainCircuit className="h-8 w-8 text-tabby-secondary" />
              <span className="ml-2 text-xl font-bold font-outfit">TabbyAI</span>
            </div>
            
            <div className="hidden sm:ml-6 sm:flex space-x-4">
              <Link to="/" className="text-tabby-primary font-medium px-3 py-2 hover:text-tabby-secondary">Home</Link>
              <Link to="#features" className="text-gray-500 font-medium px-3 py-2 hover:text-tabby-secondary">Features</Link>
              <Link to="#pricing" className="text-gray-500 font-medium px-3 py-2 hover:text-tabby-secondary">Pricing</Link>
            </div>
            
            <div className="flex items-center space-x-3">
              <Link to="/auth/sign-in">
                <Button variant="outline">Sign in</Button>
              </Link>
              <Link to="/auth/sign-up">
                <Button className="bg-tabby-secondary hover:bg-tabby-secondary/90">Get Started</Button>
              </Link>
            </div>
          </div>
        </nav>
      </header>
      
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-tabby-light to-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-tabby-primary font-outfit">
              Debate Smarter, Not Harder
            </h1>
            <p className="mt-6 text-xl text-gray-600 max-w-2xl mx-auto">
              TabbyAI is your ultimate debate tournament companion — where AI meets argumentation, and POIs never go unanswered.
            </p>
            <div className="mt-10">
              <Link to="/auth/sign-up">
                <Button size="lg" className="bg-tabby-secondary hover:bg-tabby-secondary/90 text-white font-medium px-8 py-3 rounded-md">
                  Start Your Tournament
                </Button>
              </Link>
            </div>
          </div>
          
          <div className="mt-16 relative">
            <div className="absolute inset-0 flex items-center justify-center opacity-10">
              <div className="h-64 w-64 bg-tabby-secondary rounded-full filter blur-3xl"></div>
            </div>
            
            <div className="relative rounded-xl overflow-hidden shadow-2xl border border-gray-100">
              <img 
                src="https://images.unsplash.com/photo-1577563908411-5077b6dc7624?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80" 
                alt="TabbyAI Dashboard"
                className="w-full rounded-xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Tournaments Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-tabby-primary font-outfit">Upcoming Tournaments</h2>
            <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
              Browse and join exciting debate tournaments happening around the world.
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-md mx-auto mb-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tournaments..."
                className="pl-10"
              />
            </div>
          </div>

          {/* Tournament Grid */}
          {isLoading ? (
            <div className="flex items-center justify-center min-h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-tabby-secondary"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTournaments.map((tournament) => (
                <TournamentCard 
                  key={tournament.id}
                  id={tournament.id}
                  name={tournament.name}
                  format={tournament.format}
                  date={tournament.date}
                  teamCount={tournament.teamCount}
                  location={tournament.location}
                  status={tournament.status}
                />
              ))}
            </div>
          )}
        </div>
      </section>
      
      {/* Features Section */}
      <section id="features" className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-tabby-primary font-outfit">No More Points of Information Needed</h2>
            <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
              TabbyAI has all the answers to your tournament organization questions.
            </p>
          </div>
          
          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="tabby-card text-center">
              <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-tabby-secondary/10 text-tabby-secondary">
                <Trophy className="h-6 w-6" />
              </div>
              <h3 className="mt-6 text-lg font-medium">AI-Powered Draws</h3>
              <p className="mt-2 text-gray-500 text-sm">
                Generate fair and balanced draws faster than you can say "That's a matter of definition."
              </p>
            </div>
            
            <div className="tabby-card text-center">
              <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-tabby-secondary/10 text-tabby-secondary">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="mt-6 text-lg font-medium">Smart Team Management</h3>
              <p className="mt-2 text-gray-500 text-sm">
                Keep track of teams and judges with the precision of a timekeeper's stopwatch.
              </p>
            </div>
            
            <div className="tabby-card text-center">
              <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-tabby-secondary/10 text-tabby-secondary">
                <Calendar className="h-6 w-6" />
              </div>
              <h3 className="mt-6 text-lg font-medium">Automated Scheduling</h3>
              <p className="mt-2 text-gray-500 text-sm">
                Let AI handle the logistics while you focus on the debate.
              </p>
            </div>
            
            <div className="tabby-card text-center">
              <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-tabby-secondary/10 text-tabby-secondary">
                <BarChart3 className="h-6 w-6" />
              </div>
              <h3 className="mt-6 text-lg font-medium">Real-time Analytics</h3>
              <p className="mt-2 text-gray-500 text-sm">
                Track performance and generate insights with AI-powered analytics.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Pricing Section */}
      <section id="pricing" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-tabby-primary font-outfit">Simple, Transparent Pricing</h2>
            <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
              No hidden fees — we're more transparent than a first prop's case structure.
            </p>
          </div>
          
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Free Plan */}
            <div className="bg-white rounded-lg shadow-md p-8 border border-gray-200">
              <h3 className="text-lg font-bold text-tabby-primary">Novice</h3>
              <div className="mt-4">
                <span className="text-4xl font-bold">Free</span>
              </div>
              <p className="mt-2 text-sm text-gray-500">For small community tournaments</p>
              
              <ul className="mt-6 space-y-4">
                <li className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="ml-3 text-sm text-gray-700">Up to 10 teams</p>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="ml-3 text-sm text-gray-700">Basic draw generation</p>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="ml-3 text-sm text-gray-700">Standard results reporting</p>
                </li>
              </ul>
              
              <div className="mt-8">
                <Link to="/auth/sign-up">
                  <Button variant="outline" className="w-full">Get Started</Button>
                </Link>
              </div>
            </div>
            
            {/* Pro Plan */}
            <div className="bg-white rounded-lg shadow-md p-8 border-2 border-tabby-secondary relative">
              <div className="absolute top-0 right-0 -mt-3 mr-3 bg-tabby-secondary text-white py-1 px-4 rounded-full text-xs font-bold">
                POPULAR
              </div>
              <h3 className="text-lg font-bold text-tabby-primary">Open Break</h3>
              <div className="mt-4">
                <span className="text-4xl font-bold">$49</span>
                <span className="text-gray-500 ml-1">/tournament</span>
              </div>
              <p className="mt-2 text-sm text-gray-500">For regional tournaments</p>
              
              <ul className="mt-6 space-y-4">
                <li className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="ml-3 text-sm text-gray-700">Up to 50 teams</p>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="ml-3 text-sm text-gray-700">AI-powered team matching</p>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="ml-3 text-sm text-gray-700">Advanced analytics</p>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="ml-3 text-sm text-gray-700">Automated notifications</p>
                </li>
              </ul>
              
              <div className="mt-8">
                <Link to="/auth/sign-up">
                  <Button className="w-full bg-tabby-secondary hover:bg-tabby-secondary/90">Get Started</Button>
                </Link>
              </div>
            </div>
            
            {/* Enterprise Plan */}
            <div className="bg-white rounded-lg shadow-md p-8 border border-gray-200">
              <h3 className="text-lg font-bold text-tabby-primary">World Finals</h3>
              <div className="mt-4">
                <span className="text-4xl font-bold">$99</span>
                <span className="text-gray-500 ml-1">/tournament</span>
              </div>
              <p className="mt-2 text-sm text-gray-500">For national championships</p>
              
              <ul className="mt-6 space-y-4">
                <li className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="ml-3 text-sm text-gray-700">Unlimited teams</p>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="ml-3 text-sm text-gray-700">Full AI-powered features</p>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="ml-3 text-sm text-gray-700">Custom tournament branding</p>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="ml-3 text-sm text-gray-700">Priority support</p>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="ml-3 text-sm text-gray-700">Crypto payment options</p>
                </li>
              </ul>
              
              <div className="mt-8">
                <Link to="/auth/sign-up">
                  <Button variant="outline" className="w-full">Contact Sales</Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="bg-tabby-primary py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white font-outfit">Ready to make your next tournament a first-place proposition?</h2>
            <p className="mt-4 text-gray-300 max-w-2xl mx-auto">
              Join the debate community already using TabbyAI and leave the procedural points to us.
            </p>
            <div className="mt-10">
              <Link to="/auth/sign-up">
                <Button size="lg" className="bg-tabby-secondary hover:bg-tabby-secondary/90 text-white font-medium px-8 py-3 rounded-md">
                  Register for Free
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-gray-50 py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <BrainCircuit className="h-6 w-6 text-tabby-secondary" />
              <span className="ml-2 text-lg font-medium font-outfit">TabbyAI</span>
            </div>
            
            <div className="flex space-x-6">
              <a href="#" className="text-gray-500 hover:text-tabby-secondary text-sm">Terms</a>
              <a href="#" className="text-gray-500 hover:text-tabby-secondary text-sm">Privacy</a>
              <a href="#" className="text-gray-500 hover:text-tabby-secondary text-sm">Contact</a>
            </div>
            
            <div className="text-sm text-gray-500 mt-4 md:mt-0">
              © 2025 TabbyAI. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
