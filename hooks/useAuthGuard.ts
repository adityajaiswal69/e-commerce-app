"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';
import toast from 'react-hot-toast';

interface UseAuthGuardOptions {
  redirectTo?: string;
  message?: string;
  showMessage?: boolean;
  requireAuth?: boolean;
}

interface UseAuthGuardReturn {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
}

export function useAuthGuard(options: UseAuthGuardOptions = {}): UseAuthGuardReturn {
  const {
    redirectTo = '/sign-in',
    message = 'Please sign in to continue',
    showMessage = true,
    requireAuth = true
  } = options;

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    let isMounted = true;

    async function checkAuth() {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (!isMounted) return;

        if (error) {
          console.error('Auth error:', error);
          if (requireAuth && showMessage) {
            toast.error('Authentication error. Please sign in again.');
          }
          if (requireAuth) {
            router.push(redirectTo);
          }
          return;
        }

        if (!session?.user) {
          if (requireAuth && showMessage) {
            toast.error(message);
          }
          if (requireAuth) {
            router.push(redirectTo);
          }
          return;
        }

        setUser(session.user);
      } catch (error) {
        console.error('Error checking authentication:', error);
        if (requireAuth && showMessage) {
          toast.error('Failed to verify authentication. Please sign in.');
        }
        if (requireAuth) {
          router.push(redirectTo);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    checkAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!isMounted) return;

      if (event === 'SIGNED_OUT' || !session?.user) {
        setUser(null);
        if (requireAuth && showMessage) {
          toast.error('You have been signed out. Please sign in again.');
        }
        if (requireAuth) {
          router.push(redirectTo);
        }
      } else if (event === 'SIGNED_IN' && session?.user) {
        setUser(session.user);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
      subscription?.unsubscribe();
    };
  }, [router, redirectTo, message, showMessage, requireAuth, supabase.auth]);

  return {
    user,
    loading,
    isAuthenticated: !!user
  };
}

// Convenience hook for design tools specifically
export function useDesignAuth() {
  return useAuthGuard({
    redirectTo: '/sign-in',
    message: 'Please sign in first to use the design tool',
    showMessage: true,
    requireAuth: true
  });
}
