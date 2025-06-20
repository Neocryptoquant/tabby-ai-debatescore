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
        
        // Get the session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Auth callback error:", sessionError);
          setError(sessionError.message);
          return;
        }
        
        if (!session) {
          setError("No session found. Please try signing in again.");
          return;
        }

        console.log("Authentication successful for user:", session.user.email);
          
        // Check if user profile exists
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('id')
          .eq('id', session.user.id)
            .maybeSingle();
            
        if (profileError) {
            console.error("Error checking profile:", profileError);
          setError("Error checking user profile. Please try again.");
          return;
          }
          
          if (!profile) {
            // Create profile from user metadata
          const { user_metadata } = session.user;
            
            const { error: insertError } = await supabase
              .from('profiles')
              .insert({
              id: session.user.id,
                full_name: user_metadata?.full_name || user_metadata?.name || '',
                avatar_url: user_metadata?.avatar_url || null,
                institution: user_metadata?.institution || null,
              email: session.user.email
              });
              
            if (insertError) {
              console.error("Error creating profile:", insertError);
            setError("Error creating user profile. Please try again.");
            return;
          }
          
          console.log("Profile created successfully for:", session.user.email);
          }
          
        // Set a small delay to ensure all state is updated
        setTimeout(() => {
          toast.success("Signed in successfully!");
          navigate('/dashboard', { replace: true });
        }, 500);
        
      } catch (err) {
        console.error("Error during auth callback:", err);
        setError("An unexpected error occurred during login");
      } finally {
        setIsProcessing(false);
      }
    };
    
    handleAuthCallback();
  }, [navigate]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold text-center text-red-600">Authentication Error</CardTitle>
            <CardDescription className="text-center">{error}</CardDescription>
          </CardHeader>
          <CardFooter className="flex justify-center">
            <Button onClick={() => navigate('/auth/signin')}>
              Return to Sign In
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <Card className="max-w-md w-full">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <BrainCircuit className="h-12 w-12 text-tabby-secondary" />
          </div>
          <CardTitle className="text-2xl font-semibold text-center">Completing Sign In</CardTitle>
            <CardDescription className="text-center">
            Please wait while we set up your account...
            </CardDescription>
          </CardHeader>
        <CardContent className="flex justify-center">
          <LoadingSpinner size="lg" />
          </CardContent>
        </Card>
    </div>
  );
};

export default Callback;