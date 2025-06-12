import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { BrainCircuit } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const Callback = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(true);
  
  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        setIsProcessing(true);
        
        // Get the URL hash and handle the OAuth callback
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Auth callback error:", error);
          setError(error.message);
          return;
        }
        
        if (data.session) {
          console.log("Authentication successful");
          
          // Check if user profile exists, if not create it
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', data.session.user.id)
            .maybeSingle();
            
          if (profileError && profileError.code !== 'PGRST116') {
            console.error("Error checking profile:", profileError);
          }
          
          if (!profile) {
            // Create profile from user metadata
            const { user_metadata } = data.session.user;
            
            const { error: insertError } = await supabase
              .from('profiles')
              .insert({
                id: data.session.user.id,
                full_name: user_metadata?.full_name || user_metadata?.name || '',
                avatar_url: user_metadata?.avatar_url || null,
                institution: user_metadata?.institution || null,
                email: data.session.user.email
              });
              
            if (insertError) {
              console.error("Error creating profile:", insertError);
              toast.error("Error creating profile");
            } else {
              console.log("Profile created successfully");
            }
          }
          
          // Redirect to dashboard
          toast.success("Signed in successfully!");
          navigate('/dashboard', { replace: true });
        } else {
          setError("No session found. Please try signing in again.");
        }
      } catch (err) {
        console.error("Error during auth callback:", err);
        setError("An unexpected error occurred during login");
      } finally {
        setIsProcessing(false);
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
            {isProcessing ? (
              <LoadingSpinner size="lg" text="Authenticating..." />
            ) : error ? (
              <div className="text-red-500 text-center">{error}</div>
            ) : (
              <div className="text-green-500 text-center">Authentication successful! Redirecting...</div>
            )}
          </CardContent>
          
          {error && (
            <CardFooter>
              <Button 
                onClick={() => navigate('/auth/sign-in')}
                className="w-full"
              >
                Back to Sign In
              </Button>
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Callback;