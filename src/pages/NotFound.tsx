
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { BrainCircuit, Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center px-6 py-16 max-w-md">
        <div className="flex justify-center mb-6">
          <BrainCircuit className="h-16 w-16 text-tabby-secondary" />
        </div>
        <h1 className="text-5xl font-bold text-tabby-primary font-outfit mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-6">Oops! We couldn't find the page you're looking for.</p>
        <p className="text-gray-500 mb-8">
          The page might have been removed, renamed, or doesn't exist.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button 
            onClick={() => window.history.back()}
            variant="outline"
            className="flex items-center"
          >
            Go Back
          </Button>
          <Link to="/">
            <Button className="bg-tabby-secondary hover:bg-tabby-secondary/90 flex items-center">
              <Home className="h-4 w-4 mr-2" />
              Return to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
