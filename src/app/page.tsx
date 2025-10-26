'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isFeatureEnabled } from '@/lib/featureFlags';

export default function HomePage() {
  const { user, appUser, loading } = useAuth();
  const router = useRouter();

  // Redirect users based on authentication and completion status
  useEffect(() => {
    if (!loading) {
      // If user is not authenticated, redirect to sign-in
      if (!user) {
        router.push('/auth/signin');
        return;
      }
      
      // If user is authenticated but appUser data not loaded yet, wait
      if (user && !appUser) {
        return;
      }
      
      // If user is authenticated and appUser data is loaded, redirect based on completion status
      if (user && appUser) {
        // If user hasn't completed demographic survey, redirect to survey
        if (!appUser.survey_completed) {
          router.push('/auth/demographic-survey');
        }
        // If user completed survey but not assessment, redirect to assessment
        else if (!appUser.assessment_taken) {
          router.push('/assessment');
        }
        // If assessment is completed, redirect to dashboard
        else {
          router.push('/dashboard');
        }
      }
    }
  }, [user, appUser, loading, router]);


  // Show loading state while authentication is being checked or during redirects
  if (loading || !user || (user && !appUser)) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-300">
            {loading ? 'Thinking...' : !user ? 'Redirecting to sign in...' : 'Loading user data...'}
          </p>
        </div>
      </main>
    );
  }

  // This section is no longer needed as users are redirected to dashboard

  // If we reach here, show a loading state (user should be redirected in useEffect)
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-gray-300">Redirecting...</p>
      </div>
    </main>
  );
}