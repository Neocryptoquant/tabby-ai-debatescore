import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast.error(error.message);
      return { error };
    }

    toast.success("Signed in successfully!");
    return { success: true, data };
  } catch (error) {
    console.error("Sign in error:", error);
    toast.error("Something went wrong. Please try again.");
    return { error };
  }
}

export async function signUpWithPassword({ email, password, full_name, institution }: SignUpWithPasswordCredentials) {
  try {
    const { data, error } = await supabase.auth.signUp({
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
    return { success: true, data };
  } catch (error) {
    console.error("Sign up error:", error);
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
    
    toast.success("Signed out successfully");
    return { success: true };
  } catch (error) {
    console.error("Sign out error:", error);
    toast.error("Something went wrong. Please try again.");
    return { error };
  }
}