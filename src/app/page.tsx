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
        // If assessment is completed, show completion message since pathway is disabled
        else {
          // Stay on home page and show completion message
          return;
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
            {loading ? 'Loading...' : !user ? 'Redirecting to sign in...' : 'Loading user data...'}
          </p>
        </div>
      </main>
    );
  }

  // If user is authenticated and completed assessment, show completion message
  if (user && appUser && appUser.assessment_taken) {
    return (
      <main className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-8">
        <div className="text-center max-w-2xl">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-4">
              🎉 Assessment Complete!
            </h1>
            <p className="text-xl text-gray-300 mb-6">
              Congratulations! You've completed your financial literacy assessment.
            </p>
            <div className="bg-gray-800 rounded-lg p-6 mb-6">
              <p className="text-lg text-orange-400 font-semibold mb-2">
                Your Literacy Level: {appUser.literacy_level}
              </p>
              <p className="text-gray-300">
                You can retake the assessment anytime to track your progress.
              </p>
            </div>
          </div>
          
          <div className="space-y-4">
            <button
              onClick={() => router.push('/assessment')}
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-8 rounded-lg text-lg transition-colors"
            >
              Retake Assessment
            </button>
            
            <p className="text-gray-400 mt-4">
              Additional features like learning pathways and lesson quizzes are coming soon!
            </p>
          </div>
        </div>
      </main>
    );
  }

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