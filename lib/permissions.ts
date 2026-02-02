import { UserRole, PlanTier, SubscriptionType } from './types/roles';

export function isAdmin(role: UserRole | null | undefined): boolean {
  return role === 'admin';
}

export function isOwner(role: UserRole | null | undefined): boolean {
  return role === 'owner';
}

export function isLocalHero(role: UserRole | null | undefined): boolean {
  return role === 'local_hero';
}

export function isCustomer(role: UserRole | null | undefined): boolean {
  return role === 'customer';
}

export function canAccessAdminPanel(role: UserRole | null | undefined): boolean {
  return isAdmin(role);
}

export function canAccessOwnerDashboard(role: UserRole | null | undefined): boolean {
  return isOwner(role) || isAdmin(role);
}

export function canAccessLocalHeroDashboard(role: UserRole | null | undefined): boolean {
  return isLocalHero(role) || isAdmin(role);
}

export function canModerateRestaurants(role: UserRole | null | undefined): boolean {
  return isLocalHero(role) || isAdmin(role);
}

export function canManageLocalHeroes(role: UserRole | null | undefined): boolean {
  return isAdmin(role);
}

export function canManageUsers(role: UserRole | null | undefined): boolean {
  return isAdmin(role);
}

export function canManageAffiliates(role: UserRole | null | undefined): boolean {
  return isAdmin(role);
}

export function canManageCommissions(role: UserRole | null | undefined): boolean {
  return isAdmin(role);
}

export function canViewEarnings(role: UserRole | null | undefined): boolean {
  return isLocalHero(role) || isAdmin(role);
}

export function canApplyAsLocalHero(role: UserRole | null | undefined): boolean {
  return !isLocalHero(role) && !isAdmin(role);
}

export interface RolePermissions {
  canAccessAdminPanel: boolean;
  canAccessOwnerDashboard: boolean;
  canAccessLocalHeroDashboard: boolean;
  canModerateRestaurants: boolean;
  canManageLocalHeroes: boolean;
  canManageUsers: boolean;
  canManageAffiliates: boolean;
  canManageCommissions: boolean;
  canViewEarnings: boolean;
  canApplyAsLocalHero: boolean;
  hasCustomerPro: boolean;
  hasOwnerPro: boolean;
}

export function getRolePermissions(
  role: UserRole | null | undefined,
  subscriptions: Array<{ subscription_type: SubscriptionType; plan_tier: PlanTier; status: string }> = []
): RolePermissions {
  const hasCustomerPro = subscriptions.some(
    sub =>
      sub.subscription_type === 'customer_subscription' &&
      sub.plan_tier === 'pro' &&
      sub.status === 'active'
  );

  const hasOwnerPro = subscriptions.some(
    sub =>
      sub.subscription_type === 'owner_subscription' &&
      sub.plan_tier === 'pro' &&
      sub.status === 'active'
  );

  return {
    canAccessAdminPanel: canAccessAdminPanel(role),
    canAccessOwnerDashboard: canAccessOwnerDashboard(role),
    canAccessLocalHeroDashboard: canAccessLocalHeroDashboard(role),
    canModerateRestaurants: canModerateRestaurants(role),
    canManageLocalHeroes: canManageLocalHeroes(role),
    canManageUsers: canManageUsers(role),
    canManageAffiliates: canManageAffiliates(role),
    canManageCommissions: canManageCommissions(role),
    canViewEarnings: canViewEarnings(role),
    canApplyAsLocalHero: canApplyAsLocalHero(role),
    hasCustomerPro,
    hasOwnerPro,
  };
}

export function getRoleName(role: UserRole): string {
  const roleNames: Record<UserRole, string> = {
    customer: 'Customer',
    owner: 'Restaurant Owner',
    local_hero: 'Local Hero',
    admin: 'Administrator',
  };
  return roleNames[role];
}

export function getRoleBadgeColor(role: UserRole): string {
  const colors: Record<UserRole, string> = {
    customer: 'bg-blue-100 text-blue-800',
    owner: 'bg-green-100 text-green-800',
    local_hero: 'bg-purple-100 text-purple-800',
    admin: 'bg-red-100 text-red-800',
  };
  return colors[role];
}

export function getPlanBadgeColor(tier: PlanTier): string {
  const colors: Record<PlanTier, string> = {
    free: 'bg-gray-100 text-gray-800',
    pro: 'bg-yellow-100 text-yellow-800',
  };
  return colors[tier];
}
