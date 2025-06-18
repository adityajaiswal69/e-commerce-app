"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { User } from '@supabase/auth-helpers-nextjs';
import toast from 'react-hot-toast';
import AuthMessage from './AuthMessage';

interface AuthGuardProps {
  children: React.ReactNode;
  redirectTo?: string;
  message?: string;
  showMessage?: boolean;
}

export default function AuthGuard({ 
  children, 
  redirectTo = '/sign-in',
  message = 'Please sign in first to use this tool',
  showMessage = true
}: AuthGuardProps) {
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
          if (showMessage) {
            toast.error('Authentication error. Please sign in again.');
          }
          router.push(redirectTo);
          return;
        }

        if (!session?.user) {
          if (showMessage) {
            toast.error(message);
          }
          router.push(redirectTo);
          return;
        }

        setUser(session.user);
      } catch (error) {
        console.error('Error checking authentication:', error);
        if (showMessage) {
          toast.error('Failed to verify authentication. Please sign in.');
        }
        router.push(redirectTo);
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
        if (showMessage) {
          toast.error('You have been signed out. Please sign in again.');
        }
        router.push(redirectTo);
      } else if (event === 'SIGNED_IN' && session?.user) {
        setUser(session.user);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
      subscription?.unsubscribe();
    };
  }, [router, redirectTo, message, showMessage, supabase.auth]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <AuthMessage
        message={message}
        redirectTo={redirectTo}
      />
    );
  }

  return <>{children}</>;
}
