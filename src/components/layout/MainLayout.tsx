
import { useState, ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  Home, 
  Trophy, 
  Users, 
  Calendar, 
  BarChart3, 
  Settings,
  Menu,
  X,
  BrainCircuit
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface MainLayoutProps {
  children: ReactNode;
}

interface SidebarItem {
  name: string;
  path: string;
  icon: React.ElementType;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  
  const sidebarItems: SidebarItem[] = [
    { name: "Dashboard", path: "/dashboard", icon: Home },
    { name: "Tournaments", path: "/tournaments", icon: Trophy },
    { name: "Settings", path: "/settings", icon: Settings },
  ];
  
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile sidebar toggle */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button 
          variant="outline" 
          size="icon"
          className="bg-white"
          onClick={toggleSidebar}
        >
          {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>
      
      {/* Sidebar */}
      <div 
        className={cn(
          "bg-tabby-primary text-white fixed inset-y-0 left-0 z-40 w-64 transform transition-transform duration-300 ease-in-out",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="p-6 flex items-center">
          <div className="flex items-center gap-2">
            <BrainCircuit className="h-8 w-8 text-tabby-secondary" />
            <span className="font-outfit text-2xl font-bold">TabbyAI</span>
          </div>
        </div>
        
        <nav className="mt-6 px-4 space-y-1">
          {sidebarItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={cn(
                "flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors",
                location.pathname === item.path || location.pathname.startsWith(`${item.path}/`)
                  ? "bg-tabby-secondary text-white"
                  : "text-gray-300 hover:bg-tabby-primary-foreground/10"
              )}
            >
              <item.icon className="mr-3 h-5 w-5" aria-hidden="true" />
              {item.name}
            </Link>
          ))}
        </nav>
        
        <div className="absolute bottom-0 w-full p-4">
          <div className="bg-white/5 rounded-md p-3">
            <div className="flex items-center space-x-3">
              <div className="bg-tabby-secondary/20 p-2 rounded-full">
                <BrainCircuit className="h-5 w-5 text-tabby-secondary" />
              </div>
              <div>
                <p className="text-xs font-medium text-white">AI Assistant</p>
                <p className="text-xs text-gray-400">Ready to help</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main content */}
      <div className={cn(
        "flex-1 transition-all duration-300",
        sidebarOpen ? "lg:ml-64" : "ml-0 lg:ml-64"
      )}>
        <main className="min-h-screen p-4 md:p-8">
          {children}
        </main>
      </div>
      
      {/* Backdrop for mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-30 lg:hidden"
          onClick={toggleSidebar}
        />
      )}
    </div>
  );
};

export default MainLayout;
