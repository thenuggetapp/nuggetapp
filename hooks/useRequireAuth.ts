import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/lib/types/roles';

interface UseRequireAuthOptions {
  requiredRole?: UserRole | UserRole[];
  redirectTo?: string;
  redirectIfAuthorized?: string;
  allowAdminOverride?: boolean;
}

export function useRequireAuth(options: UseRequireAuthOptions = {}) {
  const {
    requiredRole,
    redirectTo = '/login',
    redirectIfAuthorized,
    allowAdminOverride = false,
  } = options;

  const router = useRouter();
  const { user, userProfile, loading: authLoading } = useAuth();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Wait for auth to finish loading
    if (authLoading) {
      setIsChecking(true);
      return;
    }

    // Check if user is logged in
    if (!user) {
      setIsChecking(false);
      router.push(redirectTo);
      return;
    }

    // If we need userProfile for role checking, wait for it
    if (requiredRole && !userProfile) {
      // Profile is still loading, keep waiting and show loading state
      setIsChecking(true);
      return;
    }

    // Check role requirement
    if (requiredRole) {
      const requiredRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
      const hasRequiredRole = requiredRoles.includes(userProfile?.role as UserRole);
      const isAdmin = allowAdminOverride && userProfile?.role === 'admin';

      if (!hasRequiredRole && !isAdmin) {
        setIsChecking(false);
        router.push('/');
        return;
      }
    }

    // Check if we should redirect authorized users
    if (redirectIfAuthorized && user && userProfile) {
      setIsChecking(false);
      router.push(redirectIfAuthorized);
      return;
    }

    // All checks passed
    setIsAuthorized(true);
    setIsChecking(false);
  }, [authLoading, user, userProfile, requiredRole, redirectTo, redirectIfAuthorized, allowAdminOverride, router]);

  return {
    isAuthorized,
    isChecking: authLoading || isChecking,
    user,
    userProfile,
  };
}
