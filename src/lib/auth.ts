import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
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
      toast.error(error.message);
      return { error };
    }

    return { success: true };
  } catch (error) {
    console.error("Sign in error:", error);
    toast.error("Something went wrong. Please try again.");
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
      toast.error(error.message);
      return { error };
    }

    toast.success("Sign up successful! Please check your email for a confirmation link.");
    return { success: true };
  } catch (error) {
    console.error("Sign up error:", error);
    toast.error("Something went wrong. Please try again.");
    return { error };
  }
}

export async function signInWithProvider(provider: Provider) {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      toast.error(error.message);
      return { error };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Social login error:", error);
    toast.error("Something went wrong. Please try again.");
    return { error };
  }
}

export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      toast.error(error.message);
      return { error };
    }
    
    return { success: true };
  } catch (error) {
    console.error("Sign out error:", error);
    toast.error("Something went wrong. Please try again.");
    return { error };
  }
}