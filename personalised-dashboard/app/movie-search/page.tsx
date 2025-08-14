'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

export default function MovieSearchPage() {
  const router = useRouter();

  React.useEffect(() => {
    // Redirect to dashboard with search functionality
    router.push('/dashboard?tab=search');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Redirecting to Dashboard...</h1>
        <p className="text-gray-600">You&apos;ll be redirected to the main dashboard where you can search for movies.</p>
      </div>
    </div>
  );
}