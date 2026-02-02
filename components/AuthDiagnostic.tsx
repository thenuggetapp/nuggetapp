'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

export function AuthDiagnostic() {
  const { user, userProfile, loading, permissions } = useAuth();

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          Authentication Diagnostic
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
          <span className="font-medium">Loading State:</span>
          {loading ? (
            <Badge variant="secondary">Loading...</Badge>
          ) : (
            <Badge className="bg-green-500">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Ready
            </Badge>
          )}
        </div>

        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
          <span className="font-medium">User Session:</span>
          {user ? (
            <Badge className="bg-green-500">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Authenticated
            </Badge>
          ) : (
            <Badge variant="destructive">
              <XCircle className="h-3 w-3 mr-1" />
              Not Authenticated
            </Badge>
          )}
        </div>

        {user && (
          <div className="p-3 bg-slate-50 rounded-lg space-y-2">
            <div className="text-sm">
              <span className="font-medium">Email:</span> {user.email}
            </div>
            <div className="text-sm">
              <span className="font-medium">User ID:</span>{' '}
              <code className="text-xs bg-white px-2 py-1 rounded">{user.id}</code>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
          <span className="font-medium">User Profile:</span>
          {userProfile ? (
            <Badge className="bg-green-500">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Loaded
            </Badge>
          ) : (
            <Badge variant="destructive">
              <XCircle className="h-3 w-3 mr-1" />
              Not Loaded
            </Badge>
          )}
        </div>

        {userProfile && (
          <div className="p-3 bg-slate-50 rounded-lg space-y-2">
            <div className="text-sm">
              <span className="font-medium">Full Name:</span> {userProfile.full_name || 'Not set'}
            </div>
            <div className="text-sm">
              <span className="font-medium">Role:</span>{' '}
              <Badge>{userProfile.role}</Badge>
            </div>
            <div className="text-sm">
              <span className="font-medium">Created:</span> {new Date(userProfile.created_at).toLocaleDateString()}
            </div>
          </div>
        )}

        <div className="p-3 bg-slate-50 rounded-lg">
          <div className="font-medium mb-2">Permissions:</div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center gap-2">
              {permissions.canAccessOwnerDashboard ? (
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              ) : (
                <XCircle className="h-4 w-4 text-slate-400" />
              )}
              <span>Owner Dashboard</span>
            </div>
            <div className="flex items-center gap-2">
              {permissions.canAccessAdminPanel ? (
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              ) : (
                <XCircle className="h-4 w-4 text-slate-400" />
              )}
              <span>Admin Panel</span>
            </div>
            <div className="flex items-center gap-2">
              {permissions.canAccessLocalHeroDashboard ? (
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              ) : (
                <XCircle className="h-4 w-4 text-slate-400" />
              )}
              <span>Local Hero Dashboard</span>
            </div>
            <div className="flex items-center gap-2">
              {permissions.canModerateRestaurants ? (
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              ) : (
                <XCircle className="h-4 w-4 text-slate-400" />
              )}
              <span>Moderate Restaurants</span>
            </div>
          </div>
        </div>

        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            <strong>Note:</strong> If the user session shows "Not Authenticated" but you're logged in, check:
          </p>
          <ul className="list-disc list-inside text-sm text-yellow-700 mt-2 space-y-1">
            <li>Browser console for Supabase connection errors</li>
            <li>.env file has valid NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY</li>
            <li>The Supabase project is active and accessible</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
