import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { getAuthErrorMessage } from '@/lib/authErrors';
import { config } from '@/lib/config';

// Minimal app user mapped from Supabase
export type AppUser = {
  uid: string;
  email: string | null;
  displayName?: string | null;
  photoURL?: string | null;
  isGuest?: boolean;
};

// Ensure a profile row exists in Supabase
async function ensureSupabaseProfile(userId: string, email: string | null, fullName?: string | null) {
  try {
    const { data: existing, error: existErr } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();
    if (existErr && existErr.code !== 'PGRST116') throw existErr;
    if (!existing) {
      const { error: insertErr } = await supabase.from('profiles').insert({
        user_id: userId,
      });
      if (insertErr) throw insertErr;
    }
  } catch (e) {
    console.error('Error ensuring Supabase profile:', e);
  }
}

export function useAuth() {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  const isAuthenticated = !!user;
  const isGuest = user?.isGuest === true;

  // Supabase auth state changes
  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔴 Supabase auth state changed:', event, session?.user?.email);
      const supaUser = session?.user || null;
      if (supaUser) {
        const appUser: AppUser = {
          uid: supaUser.id,
          email: supaUser.email ?? null,
          displayName: supaUser.user_metadata?.full_name || null,
          photoURL: supaUser.user_metadata?.avatar_url || null,
        };
        console.log('🔴 Setting user in auth state:', appUser.email);
        setUser(appUser);
      } else {
        console.log('🔴 Clearing user from auth state');
        setUser(null);
      }
      setLoading(false);
    });
    // Initialize current session
    supabase.auth.getSession().then(({ data }) => {
      console.log('🔴 Initial Supabase session check:', data.session?.user?.email);
      const supaUser = data.session?.user || null;
      if (supaUser) {
        setUser({ uid: supaUser.id, email: supaUser.email ?? null, displayName: supaUser.user_metadata?.full_name || null, photoURL: supaUser.user_metadata?.avatar_url || null });
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const signInWithEmail = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      const u = data.user;
      if (!u) throw new Error('No user returned');
      await ensureSupabaseProfile(u.id, u.email ?? null, u.user_metadata?.full_name);
      const appUser: AppUser = { uid: u.id, email: u.email ?? null, displayName: u.user_metadata?.full_name || null, photoURL: u.user_metadata?.avatar_url || null };
      return { data: { user: appUser }, error: null };
    } catch (error: any) {
      console.error('🔴 Error during sign in:', error);
      const authError = getAuthErrorMessage(error);

      return {
        data: null,
        error: authError,
      };
    }
  };

  const signUpWithEmail = async (email: string, password: string, fullName: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
        },
      });
      if (error) throw error;
      const u = data.user;
      if (!u) return { data: { user: null }, error: null };
      await ensureSupabaseProfile(u.id, u.email ?? null, fullName);
      const appUser: AppUser = { uid: u.id, email: u.email ?? null, displayName: fullName, photoURL: null };
      return { data: { user: appUser }, error: null };
    } catch (error: any) {
      console.error('🔴 Error during sign up:', error);
      const authError = getAuthErrorMessage(error);

      return {
        data: null,
        error: authError,
      };
    }
  };

  const signInAsGuest = async () => {
    try {
      // Create a guest user object
      const guestUser: AppUser = {
        uid: `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        email: null,
        displayName: 'Guest User',
        isGuest: true,
      };
      
      console.log('🔴 Guest login successful:', guestUser.uid);
      setUser(guestUser);
      
      return { data: { user: guestUser }, error: null };
    } catch (error: any) {
      console.error('🔴 Error during guest login:', error);
      const authError = getAuthErrorMessage(error);

      return {
        data: null,
        error: authError,
      };
    }
  };

  const signOut = async () => {
    try {
      // Only sign out from Supabase if it's not a guest user
      if (!user?.isGuest) {
        await supabase.auth.signOut();
        console.log('🔴 Supabase sign out successful');
      } else {
        console.log('🔴 Guest user signed out');
      }
      
      setUser(null);
      return { error: null };
    } catch (error: any) {
      console.error('🔴 Error during sign out:', error);
      const authError = getAuthErrorMessage(error);

      // Clear the local user state even if sign out fails
      setUser(null);

      return {
        error: authError,
      };
    }
  };


  return {
    user,
    isAuthenticated,
    isGuest,
    loading,
    signInWithEmail,
    signUpWithEmail,
    signInAsGuest,
    signOut,
  };
}