
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BrainCircuit, Trophy, Users, Calendar, BarChart3 } from "lucide-react";

const Index = () => {
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
              <Link to="/dashboard">
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
              Revolutionize Debate<br />Tournament Management
            </h1>
            <p className="mt-6 text-xl text-gray-600 max-w-2xl mx-auto">
              TabbyAI combines powerful tabulation tools with AI-assisted features to make your debate tournaments run smoother than ever before.
            </p>
            <div className="mt-10">
              <Link to="/dashboard">
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
      
      {/* Features Section */}
      <section id="features" className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-tabby-primary font-outfit">Cutting-Edge Features</h2>
            <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
              TabbyAI offers powerful tools designed specifically for debate tournament organizers.
            </p>
          </div>
          
          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="tabby-card text-center">
              <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-tabby-secondary/10 text-tabby-secondary">
                <Trophy className="h-6 w-6" />
              </div>
              <h3 className="mt-6 text-lg font-medium">Multiple Formats</h3>
              <p className="mt-2 text-gray-500 text-sm">
                Support for BP, WSDC, and other major debate formats with customizable rules.
              </p>
            </div>
            
            <div className="tabby-card text-center">
              <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-tabby-secondary/10 text-tabby-secondary">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="mt-6 text-lg font-medium">Team Management</h3>
              <p className="mt-2 text-gray-500 text-sm">
                Easily register teams, track speaker scores, and manage judge allocations.
              </p>
            </div>
            
            <div className="tabby-card text-center">
              <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-tabby-secondary/10 text-tabby-secondary">
                <Calendar className="h-6 w-6" />
              </div>
              <h3 className="mt-6 text-lg font-medium">Schedule Optimization</h3>
              <p className="mt-2 text-gray-500 text-sm">
                AI-powered scheduling to minimize conflicts and optimize room allocations.
              </p>
            </div>
            
            <div className="tabby-card text-center">
              <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-tabby-secondary/10 text-tabby-secondary">
                <BarChart3 className="h-6 w-6" />
              </div>
              <h3 className="mt-6 text-lg font-medium">Results Analysis</h3>
              <p className="mt-2 text-gray-500 text-sm">
                Comprehensive analytics and visualizations for tournament results and speaker performances.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="bg-tabby-primary py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white font-outfit">Ready to transform your debate tournaments?</h2>
            <p className="mt-4 text-gray-300 max-w-2xl mx-auto">
              Join hundreds of debate organizations already using TabbyAI to run successful tournaments.
            </p>
            <div className="mt-10">
              <Link to="/dashboard">
                <Button size="lg" className="bg-tabby-secondary hover:bg-tabby-secondary/90 text-white font-medium px-8 py-3 rounded-md">
                  Get Started for Free
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
