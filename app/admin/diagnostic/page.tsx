'use client';

import { AuthDiagnostic } from '@/components/AuthDiagnostic';
import { AdminSidebar } from '@/components/AdminSidebar';

export default function AdminDiagnosticPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex">
      <AdminSidebar />

      <div className="flex-1 flex flex-col">
        <div className="border-b bg-white shadow-sm">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Authentication Diagnostic</h1>
                <p className="text-sm text-slate-600 mt-1">
                  Debug and monitor authentication status, user profiles, and permissions
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          <div className="px-6 py-6">
            <AuthDiagnostic />
          </div>
        </div>
      </div>
    </div>
  );
}
