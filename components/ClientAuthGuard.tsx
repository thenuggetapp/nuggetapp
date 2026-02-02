'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/lib/types/roles';

interface ClientAuthGuardProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
  fallbackPath?: string;
}

/**
 * Client-side authentication guard
 * Essential for iframe environments where server-side auth doesn't work
 */
export function ClientAuthGuard({ 
  children, 
  requiredRole,
  fallbackPath = '/login' 
}: ClientAuthGuardProps) {
  const router = useRouter();
  const { user, userProfile, loading } = useAuth();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    // Wait for auth to load
    if (loading) {
      console.log('[ClientAuthGuard] Auth loading...');
      return;
    }

    // Check if user is authenticated
    if (!user) {
      console.log('[ClientAuthGuard] No user, redirecting to:', fallbackPath);
      const currentPath = window.location.pathname;
      router.push(`${fallbackPath}?redirect=${encodeURIComponent(currentPath)}`);
      return;
    }

    // If role is required, wait for profile to load
    if (requiredRole && !userProfile) {
      console.log('[ClientAuthGuard] Waiting for profile to check role...');
      return;
    }

    // Check role if required
    if (requiredRole && userProfile) {
      const hasRequiredRole = userProfile.role === requiredRole;
      const isAdmin = userProfile.role === 'admin'; // Admin can access everything

      if (!hasRequiredRole && !isAdmin) {
        console.log('[ClientAuthGuard] Insufficient permissions, role:', userProfile.role, 'required:', requiredRole);
        router.push('/');
        return;
      }
    }

    // All checks passed
    console.log('[ClientAuthGuard] ✅ Authorized, role:', userProfile?.role);
    setIsAuthorized(true);
  }, [user, userProfile, loading, requiredRole, router, fallbackPath]);

  // Show loading state
  if (loading || !isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">
            {loading ? 'Loading...' : 'Checking permissions...'}
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

