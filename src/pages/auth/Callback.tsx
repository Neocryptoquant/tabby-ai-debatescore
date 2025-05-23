
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { BrainCircuit, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const Callback = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Check for an OAuth session
        const { error } = await supabase.auth.getSession();
        
        if (error) {
          setError(error.message);
          return;
        }
        
        // If successful, redirect to dashboard
        navigate('/dashboard', { replace: true });
      } catch (err) {
        console.error("Error during auth callback:", err);
        setError("An unexpected error occurred during login");
      }
    };
    
    handleAuthCallback();
  }, [navigate]);
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="max-w-md w-full">
        <div className="flex justify-center mb-8">
          <div className="flex items-center">
            <BrainCircuit className="h-10 w-10 text-tabby-secondary" />
            <span className="ml-2 text-2xl font-bold font-outfit">TabbyAI</span>
          </div>
        </div>
        
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-semibold text-center">
              {error ? "Authentication Error" : "Completing Login"}
            </CardTitle>
            <CardDescription className="text-center">
              {error 
                ? "There was a problem signing you in" 
                : "Please wait while we complete your authentication"}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4 flex flex-col items-center justify-center min-h-[100px]">
            {error ? (
              <div className="text-red-500 text-center">{error}</div>
            ) : (
              <Loader2 className="h-8 w-8 animate-spin text-tabby-secondary" />
            )}
          </CardContent>
          
          {error && (
            <CardFooter>
              <button 
                onClick={() => navigate('/auth/sign-in')}
                className="w-full bg-tabby-secondary text-white py-2 rounded-md hover:bg-tabby-secondary/90"
              >
                Back to Sign In
              </button>
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Callback;
