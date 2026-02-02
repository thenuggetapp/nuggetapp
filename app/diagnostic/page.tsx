"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Loader2, RefreshCw } from "lucide-react";
import Link from "next/link";

interface TestResult {
  status: "pending" | "success" | "failed" | "error";
  message?: string;
  error?: string;
  details?: any;
}

export default function DiagnosticPage() {
  const [healthCheck, setHealthCheck] = useState<any>(null);
  const [mapboxTest, setMapboxTest] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const runTests = async () => {
    setLoading(true);
    setHealthCheck(null);
    setMapboxTest(null);

    try {
      const [healthRes, mapboxRes] = await Promise.all([
        fetch("/api/health"),
        fetch("/api/test-mapbox"),
      ]);

      const healthData = await healthRes.json();
      const mapboxData = await mapboxRes.json();

      setHealthCheck(healthData);
      setMapboxTest(mapboxData);
    } catch (error: any) {
      console.error("Test error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runTests();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case "success":
        return (
          <Badge className="bg-green-500">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Success
          </Badge>
        );
      case "failed":
      case "error":
        return (
          <Badge variant="destructive">
            <XCircle className="h-3 w-3 mr-1" />
            Failed
          </Badge>
        );
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              System Diagnostics
            </h1>
            <p className="text-slate-600 mt-1">
              Test your API connections and environment variables
            </p>
          </div>
          <Link href="/">
            <Button variant="outline">Back to Home</Button>
          </Link>
        </div>

        <div className="flex gap-3 mb-6">
          <Button onClick={runTests} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Running Tests...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Run Tests
              </>
            )}
          </Button>
        </div>

        <div className="space-y-4">
          {/* Health Check Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Overall Health Check</span>
                {healthCheck &&
                  (healthCheck.healthy ? (
                    <Badge className="bg-green-500">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Healthy
                    </Badge>
                  ) : (
                    <Badge variant="destructive">
                      <XCircle className="h-3 w-3 mr-1" />
                      Issues Detected
                    </Badge>
                  ))}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading && !healthCheck && (
                <div className="flex items-center gap-2 text-slate-600">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Running health check...</span>
                </div>
              )}
              {healthCheck && (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">
                      Environment Variables
                    </h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Supabase URL:</span>
                        <span className="font-mono">
                          {healthCheck.environment?.supabaseUrl || "Not Set"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Supabase Key:</span>
                        <span className="font-mono">
                          {healthCheck.environment?.supabaseKey || "Not Set"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Mapbox Token:</span>
                        <span className="font-mono">
                          {healthCheck.environment?.mapboxToken || "Not Set"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Service Tests</h4>
                    <div className="space-y-2">
                      {healthCheck.tests?.supabase && (
                        <div className="flex justify-between items-center p-3 bg-slate-50 rounded">
                          <span>Supabase Database</span>
                          {getStatusBadge(healthCheck.tests.supabase.status)}
                        </div>
                      )}
                      {healthCheck.tests?.mapbox && (
                        <div className="flex justify-between items-center p-3 bg-slate-50 rounded">
                          <span>Mapbox API</span>
                          {getStatusBadge(healthCheck.tests.mapbox.status)}
                        </div>
                      )}
                    </div>
                  </div>

                  {healthCheck.tests && (
                    <details className="text-sm">
                      <summary className="cursor-pointer font-semibold text-slate-700">
                        View Full Details
                      </summary>
                      <pre className="mt-2 p-3 bg-slate-100 rounded text-xs overflow-auto">
                        {JSON.stringify(healthCheck, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Mapbox Test Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Mapbox API Test</span>
                {mapboxTest &&
                  (mapboxTest.success ? (
                    <Badge className="bg-green-500">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Working
                    </Badge>
                  ) : (
                    <Badge variant="destructive">
                      <XCircle className="h-3 w-3 mr-1" />
                      Failed
                    </Badge>
                  ))}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading && !mapboxTest && (
                <div className="flex items-center gap-2 text-slate-600">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Testing Mapbox API...</span>
                </div>
              )}
              {mapboxTest && (
                <div className="space-y-3">
                  {mapboxTest.success ? (
                    <>
                      <div className="text-green-700 font-medium">
                        ✓ {mapboxTest.message}
                      </div>
                      <div className="text-sm space-y-1">
                        <div className="flex justify-between">
                          <span>Token:</span>
                          <span className="font-mono">{mapboxTest.token}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Test Query:</span>
                          <span className="font-mono">
                            {mapboxTest.testQuery}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Results Found:</span>
                          <span className="font-mono">
                            {mapboxTest.resultCount}
                          </span>
                        </div>
                        {mapboxTest.sampleResult && (
                          <div className="flex justify-between">
                            <span>Sample Result:</span>
                            <span className="font-mono text-xs">
                              {mapboxTest.sampleResult}
                            </span>
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="text-red-700 font-medium">
                        ✗ {mapboxTest.error}
                      </div>
                      {mapboxTest.statusCode && (
                        <div className="text-sm">
                          <span className="font-semibold">Status Code:</span>{" "}
                          {mapboxTest.statusCode}
                        </div>
                      )}
                    </>
                  )}

                  <details className="text-sm">
                    <summary className="cursor-pointer font-semibold text-slate-700">
                      View Full Response
                    </summary>
                    <pre className="mt-2 p-3 bg-slate-100 rounded text-xs overflow-auto">
                      {JSON.stringify(mapboxTest, null, 2)}
                    </pre>
                  </details>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recommendations Card */}
          <Card>
            <CardHeader>
              <CardTitle>Troubleshooting Tips</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-slate-700">
                <p>
                  <strong>If Mapbox is failing:</strong>
                </p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>
                    Check if the token is expired in your Mapbox dashboard
                  </li>
                  <li>Verify the token has the correct scopes (geocoding)</li>
                  <li>
                    Ensure your domain is allowed (or use token without URL
                    restrictions)
                  </li>
                  <li>Check your Mapbox account billing status</li>
                </ul>
                <p className="mt-3">
                  <strong>If Supabase is failing:</strong>
                </p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Verify your Supabase project is active</li>
                  <li>Check that the URL and anon key match your project</li>
                  <li>Ensure the restaurants table exists in your database</li>
                  <li>Check Row Level Security (RLS) policies</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
