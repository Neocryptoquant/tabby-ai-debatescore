import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Session, User } from "@supabase/supabase-js";
import { toast } from "sonner";

interface AuthContextProps {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps>({
  session: null,
  user: null,
  isLoading: true,
  isAuthenticated: false,
  signOut: async () => {},
});

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error signing out:', error);
        throw error;
      }
      // Clear local state immediately
      setSession(null);
      setUser(null);
      // Redirect to home page
      window.location.href = '/';
    } catch (error) {
      console.error('Failed to sign out:', error);
    }
  };

  const createOrUpdateProfile = async (user: User) => {
    try {
      console.log('Creating/updating profile for user:', user.id);
      
      // First, let's check what data we have from the user
      console.log('User metadata:', user.user_metadata);
      console.log('User email:', user.email);
      
      // Check if profile exists
      const { data: existingProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('id, full_name')
        .eq('id', user.id)
        .maybeSingle();

      if (fetchError) {
        console.error('Error checking existing profile:', fetchError);
        return;
      }

      console.log('Existing profile:', existingProfile);

      if (!existingProfile) {
        // Create new profile with minimal required data
        const profileData = {
          id: user.id,
          email: user.email || '',
          full_name: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || '',
          avatar_url: user.user_metadata?.avatar_url || null,
          institution: user.user_metadata?.institution || null
        };

        console.log('Creating profile with data:', profileData);

        const { data: newProfile, error: insertError } = await supabase
          .from('profiles')
          .insert([profileData])
          .select()
          .single();

        if (insertError) {
          console.error('Error creating profile:', insertError);
          console.error('Profile data that failed:', profileData);
          
          // Don't throw error - just log it so authentication can continue
          toast.error('Failed to create user profile, but you can still use the app');
          return;
        } else {
          console.log('Profile created successfully:', newProfile);
        }
      } else {
        // Update existing profile with email if needed
        const updateData: any = {};
        
        if (user.email) {
          updateData.email = user.email;
        }
        
        // Only update if we have data to update
        if (Object.keys(updateData).length > 0) {
          updateData.updated_at = new Date().toISOString();
          
          console.log('Updating profile with data:', updateData);
          
          const { error: updateError } = await supabase
            .from('profiles')
            .update(updateData)
            .eq('id', user.id);
            
          if (updateError) {
            console.error('Error updating profile:', updateError);
            // Don't throw error - just log it
          } else {
            console.log('Profile updated successfully');
          }
        }
      }
    } catch (error) {
      console.error('Error in createOrUpdateProfile:', error);
      // Don't throw error to prevent auth from failing
    }
  };
  
  useEffect(() => {
    // First check for existing session
    const initializeAuth = async () => {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        
        if (initialSession) {
          console.log('Initial session:', initialSession?.user?.email);
          setSession(initialSession);
          setUser(initialSession.user);
          
          // Create/update profile if user exists
          await createOrUpdateProfile(initialSession.user);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error initializing auth:', error);
        setIsLoading(false);
      }
    };
    
    initializeAuth();
    
    // Then set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log('Auth state changed:', event, newSession?.user?.email);
        
        if (newSession?.user) {
          setSession(newSession);
          setUser(newSession.user);
          
          // Only create/update profile for sign-in events to avoid loops
          if (event === 'SIGNED_IN') {
            // Use setTimeout to defer profile creation and avoid auth callback issues
            setTimeout(() => {
              createOrUpdateProfile(newSession.user);
            }, 100);
          }
        } else {
          setSession(null);
          setUser(null);
        }
        
        setIsLoading(false);
      }
    );
    
    // Clean up subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  return (
    <AuthContext.Provider value={{
      session,
      user,
      isLoading,
      isAuthenticated: !!user,
      signOut,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
