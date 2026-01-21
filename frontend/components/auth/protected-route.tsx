'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function ProtectedRoute({ children, fallback = null }: ProtectedRouteProps) {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);

  useEffect(() => {
    // Check authentication status
    if (!isLoading) {
      if (!isAuthenticated || !user) {
        // Redirect to sign-in if not authenticated
        router.push('/signin');
        router.refresh(); // Refresh to ensure proper state
      } else {
        // User is authenticated, allow access
        setHasCheckedAuth(true);
      }
    }
  }, [user, isAuthenticated, isLoading, router]);

  // Show fallback while checking auth status
  if (!hasCheckedAuth && (!isAuthenticated || !user)) {
    return fallback;
  }

  // Render children if user is authenticated
  return <>{children}</>;
}