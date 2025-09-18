'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const { user, appUser, loading } = useAuth();
  const router = useRouter();

  // Redirect authenticated users based on assessment status
  useEffect(() => {
    if (!loading && user && appUser) {
      if (!appUser.assessment_taken) {
        // User hasn't taken assessment, redirect to assessment
        router.push('/assessment');
      } else {
        // User has taken assessment, redirect to pathway
        router.push('/pathway');
      }
    }
  }, [user, appUser, loading, router]);

  // Show landing page only for unauthenticated users
  if (loading) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-300">Loading...</p>
        </div>
      </main>
    );
  }

  // If user is authenticated, they'll be redirected, so show loading state
  if (user && appUser) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-300">Redirecting...</p>
        </div>
      </main>
    );
  }

  // Show landing page for unauthenticated users
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="text-center max-w-2xl">
        <h1 className="text-5xl font-bold mb-6 text-primary">
          Welcome to CredAhead
        </h1>
        <p className="text-xl mb-8 text-gray-300">
          Master your financial literacy with our adaptive assessment and personalized learning pathway.
        </p>
        
        <div className="space-y-4">
          <Link
            href="/auth/signup"
            className="block bg-primary hover:bg-primary/80 text-white px-8 py-3 rounded-lg text-lg font-semibold transition-colors"
          >
            Get Started - Sign Up
          </Link>
          
          <Link
            href="/auth/signin"
            className="block bg-gray-700 hover:bg-gray-600 text-white px-8 py-3 rounded-lg text-lg font-semibold transition-colors"
          >
            Already have an account? Sign In
          </Link>
          
          <div className="mt-8 pt-8 border-t border-gray-600">
            <p className="text-gray-400 mb-4">Preview features:</p>
            <div className="space-y-2">
              <Link
                href="/assessment"
                className="block bg-gray-800 hover:bg-gray-700 text-white px-6 py-2 rounded-lg text-sm transition-colors"
              >
                Preview Assessment
              </Link>
              
              <Link
                href="/admin"
                className="block bg-gray-800 hover:bg-gray-700 text-white px-6 py-2 rounded-lg text-sm transition-colors"
              >
                Admin Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}