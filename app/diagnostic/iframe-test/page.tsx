'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  checkIsInIframe, 
  checkLocalStorageAvailable, 
  checkSessionStorageAvailable,
  getStorageEnvironmentInfo,
  safeLocalStorage 
} from '@/lib/storage-utils';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export default function IframeDiagnosticPage() {
  const [storageInfo, setStorageInfo] = useState<any>(null);
  const [supabaseStatus, setSupabaseStatus] = useState<any>(null);
  const [testResults, setTestResults] = useState<any>({});
  const { user, userProfile, loading } = useAuth();

  useEffect(() => {
    // Get storage environment info
    const info = getStorageEnvironmentInfo();
    setStorageInfo(info);

    // Test Supabase connection
    testSupabaseConnection();

    // Run all diagnostic tests
    runDiagnosticTests();
  }, []);

  const testSupabaseConnection = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      setSupabaseStatus({
        connected: !error,
        hasSession: !!session,
        error: error?.message,
        sessionData: session ? {
          userId: session.user?.id,
          email: session.user?.email,
          expiresAt: new Date(session.expires_at || 0).toISOString(),
        } : null,
      });
    } catch (e: any) {
      setSupabaseStatus({
        connected: false,
        error: e.message,
      });
    }
  };

  const runDiagnosticTests = () => {
    const results: any = {};

    // Test 1: Cookie access
    try {
      document.cookie = "test=1; path=/";
      results.cookieWrite = document.cookie.includes("test=1");
      document.cookie = "test=1; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
    } catch (e) {
      results.cookieWrite = false;
      results.cookieError = (e as Error).message;
    }

    // Test 2: localStorage
    try {
      const testKey = 'diagnostic_test_' + Date.now();
      safeLocalStorage.setItem(testKey, 'test');
      const value = safeLocalStorage.getItem(testKey);
      results.localStorage = value === 'test';
      safeLocalStorage.removeItem(testKey);
    } catch (e) {
      results.localStorage = false;
      results.localStorageError = (e as Error).message;
    }

    // Test 3: sessionStorage
    try {
      sessionStorage.setItem('test', 'test');
      results.sessionStorage = sessionStorage.getItem('test') === 'test';
      sessionStorage.removeItem('test');
    } catch (e) {
      results.sessionStorage = false;
      results.sessionStorageError = (e as Error).message;
    }

    // Test 4: Third-party context
    try {
      results.isThirdPartyContext = window.self !== window.top;
    } catch (e) {
      results.isThirdPartyContext = true; // Can't access window.top = third-party
      results.thirdPartyError = 'Cannot access window.top (cross-origin)';
    }

    // Test 5: Fetch API
    results.fetchAvailable = typeof fetch !== 'undefined';

    // Test 6: IndexedDB
    results.indexedDBAvailable = typeof indexedDB !== 'undefined';

    setTestResults(results);
  };

  const StatusBadge = ({ status }: { status: boolean | undefined }) => {
    if (status === undefined) return <Badge variant="outline">Unknown</Badge>;
    return status ? (
      <Badge className="bg-green-500">✓ Available</Badge>
    ) : (
      <Badge variant="destructive">✗ Blocked</Badge>
    );
  };

  return (
    <div className="container mx-auto p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Iframe Environment Diagnostics</h1>
        <p className="text-slate-600">
          Use this page to diagnose storage and authentication issues in iframe environments
        </p>
      </div>

      {/* Environment Detection */}
      <Card>
        <CardHeader>
          <CardTitle>Environment Detection</CardTitle>
          <CardDescription>Basic environment information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {storageInfo ? (
            <>
              <div className="flex justify-between items-center">
                <span className="font-medium">Running in Iframe:</span>
                <StatusBadge status={!storageInfo.isInIframe} />
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium">localStorage Available:</span>
                <StatusBadge status={storageInfo.localStorageAvailable} />
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium">sessionStorage Available:</span>
                <StatusBadge status={storageInfo.sessionStorageAvailable} />
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium">Cookies Enabled:</span>
                <StatusBadge status={storageInfo.cookiesEnabled} />
              </div>
              <div className="grid grid-cols-1 gap-2 text-sm mt-4 p-4 bg-slate-50 rounded">
                <div><strong>Origin:</strong> {storageInfo.origin}</div>
                <div><strong>User Agent:</strong> <span className="text-xs">{storageInfo.userAgent}</span></div>
              </div>
            </>
          ) : (
            <p>Loading...</p>
          )}
        </CardContent>
      </Card>

      {/* Diagnostic Tests */}
      <Card>
        <CardHeader>
          <CardTitle>Diagnostic Tests</CardTitle>
          <CardDescription>Detailed feature availability tests</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="font-medium">Cookie Write/Read:</span>
            <StatusBadge status={testResults.cookieWrite} />
          </div>
          {testResults.cookieError && (
            <p className="text-sm text-red-600 ml-4">Error: {testResults.cookieError}</p>
          )}
          
          <div className="flex justify-between items-center">
            <span className="font-medium">localStorage Write/Read:</span>
            <StatusBadge status={testResults.localStorage} />
          </div>
          {testResults.localStorageError && (
            <p className="text-sm text-red-600 ml-4">Error: {testResults.localStorageError}</p>
          )}
          
          <div className="flex justify-between items-center">
            <span className="font-medium">sessionStorage Write/Read:</span>
            <StatusBadge status={testResults.sessionStorage} />
          </div>
          {testResults.sessionStorageError && (
            <p className="text-sm text-red-600 ml-4">Error: {testResults.sessionStorageError}</p>
          )}
          
          <div className="flex justify-between items-center">
            <span className="font-medium">Third-Party Context:</span>
            <Badge variant={testResults.isThirdPartyContext ? "destructive" : "default"}>
              {testResults.isThirdPartyContext ? "Yes (Restricted)" : "No (Full Access)"}
            </Badge>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="font-medium">Fetch API:</span>
            <StatusBadge status={testResults.fetchAvailable} />
          </div>
          
          <div className="flex justify-between items-center">
            <span className="font-medium">IndexedDB:</span>
            <StatusBadge status={testResults.indexedDBAvailable} />
          </div>
        </CardContent>
      </Card>

      {/* Supabase Connection */}
      <Card>
        <CardHeader>
          <CardTitle>Supabase Connection</CardTitle>
          <CardDescription>Authentication service status</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {supabaseStatus ? (
            <>
              <div className="flex justify-between items-center">
                <span className="font-medium">Connected:</span>
                <StatusBadge status={supabaseStatus.connected} />
              </div>
              {supabaseStatus.error && (
                <p className="text-sm text-red-600">Error: {supabaseStatus.error}</p>
              )}
              <div className="flex justify-between items-center">
                <span className="font-medium">Has Session:</span>
                <StatusBadge status={supabaseStatus.hasSession} />
              </div>
              {supabaseStatus.sessionData && (
                <div className="p-4 bg-slate-50 rounded text-sm space-y-1">
                  <div><strong>User ID:</strong> {supabaseStatus.sessionData.userId}</div>
                  <div><strong>Email:</strong> {supabaseStatus.sessionData.email}</div>
                  <div><strong>Expires:</strong> {supabaseStatus.sessionData.expiresAt}</div>
                </div>
              )}
            </>
          ) : (
            <p>Testing connection...</p>
          )}
        </CardContent>
      </Card>

      {/* Auth Context Status */}
      <Card>
        <CardHeader>
          <CardTitle>Auth Context Status</CardTitle>
          <CardDescription>Current authentication state from React context</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="font-medium">Loading:</span>
            <Badge variant={loading ? "outline" : "default"}>
              {loading ? "Loading..." : "Ready"}
            </Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-medium">User Authenticated:</span>
            <StatusBadge status={!!user} />
          </div>
          <div className="flex justify-between items-center">
            <span className="font-medium">Profile Loaded:</span>
            <StatusBadge status={!!userProfile} />
          </div>
          {userProfile && (
            <div className="p-4 bg-slate-50 rounded text-sm space-y-1">
              <div><strong>Email:</strong> {userProfile.email}</div>
              <div><strong>Role:</strong> {userProfile.role}</div>
              <div><strong>Full Name:</strong> {userProfile.full_name}</div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Recommendations</CardTitle>
          <CardDescription>Suggested fixes based on detected issues</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {storageInfo?.isInIframe && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
              <p className="font-medium text-yellow-800">⚠️ Running in Iframe</p>
              <p className="text-sm text-yellow-700 mt-1">
                The app is running in an iframe. Third-party cookies may be blocked.
                Authentication will use localStorage-based storage with in-memory fallback.
              </p>
            </div>
          )}
          
          {!storageInfo?.localStorageAvailable && (
            <div className="p-4 bg-red-50 border border-red-200 rounded">
              <p className="font-medium text-red-800">✗ localStorage Blocked</p>
              <p className="text-sm text-red-700 mt-1">
                localStorage is not available. The app will use in-memory storage,
                which means sessions won't persist across page reloads.
              </p>
            </div>
          )}
          
          {!storageInfo?.cookiesEnabled && (
            <div className="p-4 bg-red-50 border border-red-200 rounded">
              <p className="font-medium text-red-800">✗ Cookies Disabled</p>
              <p className="text-sm text-red-700 mt-1">
                Cookies are disabled in your browser. This may cause authentication issues.
                Consider enabling cookies or using localStorage-based authentication.
              </p>
            </div>
          )}
          
          {storageInfo?.localStorageAvailable && storageInfo?.cookiesEnabled && !storageInfo?.isInIframe && (
            <div className="p-4 bg-green-50 border border-green-200 rounded">
              <p className="font-medium text-green-800">✓ All Systems Operational</p>
              <p className="text-sm text-green-700 mt-1">
                All required features are available. Authentication should work normally.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button 
            onClick={() => {
              runDiagnosticTests();
              testSupabaseConnection();
            }}
            className="w-full"
          >
            Refresh Diagnostics
          </Button>
          <Button 
            onClick={() => {
              const data = {
                storageInfo,
                supabaseStatus,
                testResults,
                authContext: {
                  hasUser: !!user,
                  hasProfile: !!userProfile,
                  loading,
                },
              };
              navigator.clipboard.writeText(JSON.stringify(data, null, 2));
              alert('Diagnostic data copied to clipboard!');
            }}
            variant="outline"
            className="w-full"
          >
            Copy Diagnostic Data
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

