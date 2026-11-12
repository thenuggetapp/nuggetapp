import { redirect } from 'next/navigation';

// The owner portal starts at My Restaurants. Kept so existing links and the
// post-login / post-signup redirects to /owner/dashboard still land somewhere.
export default function OwnerDashboardPage({
  searchParams,
}: {
  searchParams: { welcome?: string };
}) {
  redirect(searchParams.welcome === 'true' ? '/owner/restaurants?welcome=true' : '/owner/restaurants');
}
