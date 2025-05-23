
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import type { Provider } from "@supabase/supabase-js";

export type SignInWithPasswordCredentials = {
  email: string;
  password: string;
};

export type SignUpWithPasswordCredentials = {
  email: string;
  password: string;
  full_name: string;
  institution?: string;
};

export async function signInWithPassword({ email, password }: SignInWithPasswordCredentials) {
  try {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast({
        title: "Authentication error",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }

    return { success: true };
  } catch (error) {
    console.error("Sign in error:", error);
    toast({
      title: "Authentication error",
      description: "Something went wrong. Please try again.",
      variant: "destructive",
    });
    return { error };
  }
}

export async function signUpWithPassword({ email, password, full_name, institution }: SignUpWithPasswordCredentials) {
  try {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name,
          institution,
        },
      },
    });

    if (error) {
      toast({
        title: "Sign up error",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }

    toast({
      title: "Sign up successful",
      description: "Please check your email for a confirmation link.",
    });

    return { success: true };
  } catch (error) {
    console.error("Sign up error:", error);
    toast({
      title: "Sign up error",
      description: "Something went wrong. Please try again.",
      variant: "destructive",
    });
    return { error };
  }
}

export async function signInWithProvider(provider: Provider) {
  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      toast({
        title: "Authentication error",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }

    return { success: true };
  } catch (error) {
    console.error("Social login error:", error);
    toast({
      title: "Authentication error",
      description: "Something went wrong. Please try again.",
      variant: "destructive",
    });
    return { error };
  }
}

export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      toast({
        title: "Sign out error",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }
    
    return { success: true };
  } catch (error) {
    console.error("Sign out error:", error);
    toast({
      title: "Sign out error",
      description: "Something went wrong. Please try again.",
      variant: "destructive",
    });
    return { error };
  }
}
