import Link from 'next/link';

export default function HomePage() {
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
            href="/assessment"
            className="block bg-primary hover:bg-primary/80 text-white px-8 py-3 rounded-lg text-lg font-semibold transition-colors"
          >
            Start Assessment
          </Link>
          
          <Link
            href="/pathway"
            className="block bg-gray-700 hover:bg-gray-600 text-white px-8 py-3 rounded-lg text-lg font-semibold transition-colors"
          >
            View Learning Pathway
          </Link>
          
          <Link
            href="/admin"
            className="block bg-gray-800 hover:bg-gray-700 text-white px-8 py-3 rounded-lg text-lg font-semibold transition-colors"
          >
            Admin Dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}