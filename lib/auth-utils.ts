import { createClientComponentClient } from "@/lib/supabase/client";
import { Database } from "@/types/database.types";

type UserProfile = {
  id: string;
  email?: string;
  full_name?: string | null;
  avatar_url?: string | null;
  role?: string;
  design_role?: boolean;
};

export const getCurrentUser = async (): Promise<{
  user: UserProfile | null;
  session: any | null;
  error: Error | null;
}> => {
  try {
    const supabase = createClientComponentClient<Database>();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return { user: null, session: null, error: null };
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", session.user.id)
      .single();

    return {
      user: {
        id: session.user.id,
        email: session.user.email,
        full_name: profile?.full_name,
        avatar_url: profile?.avatar_url,
        role: profile?.role || 'user',
        design_role: profile?.design_role || false,
      },
      session,
      error: null,
    };
  } catch (error) {
    console.error("Error getting user:", error);
    return { user: null, session: null, error: error as Error };
  }
};

export const signOut = async (isAdmin = false): Promise<{ error: Error | null }> => {
  try {
    const supabase = createClientComponentClient<Database>();
    const { error } = await supabase.auth.signOut();
    
    if (error) throw error;
    
    // Clear any session data
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('supabase.auth.token');
    }
    
    return { error: null };
  } catch (error) {
    console.error('Error signing out:', error);
    return { error: error as Error };
  }
};