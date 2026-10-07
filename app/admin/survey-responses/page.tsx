'use client';

import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { ClipboardList, RefreshCw, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { AdminSidebar } from '@/components/AdminSidebar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { createClient } from '@/lib/supabase/client-browser';
import { useRequireAuth } from '@/hooks/useRequireAuth';

type Choice = 'more_restaurants' | 'add_city' | 'deals' | 'parent_reviews' | 'other';

interface SurveyResponse {
  id: string;
  choice: Choice;
  city?: string;
  email?: string;
  other_text?: string;
  page_path?: string;
  user_id?: string;
  created_at: string;
}

const CHOICE_LABELS: Record<Choice, string> = {
  more_restaurants: 'More restaurants in my city',
  add_city: 'Add my city',
  deals: 'Deals and offers',
  parent_reviews: 'Parent reviews',
  other: 'Something else',
};

export default function SurveyResponsesPage() {
  const { userProfile, isChecking } = useRequireAuth({ requiredRole: 'admin' });
  const [responses, setResponses] = useState<SurveyResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (userProfile?.role === 'admin') {
      fetchResponses();
    }
  }, [userProfile]);

  const fetchResponses = async () => {
    setIsLoading(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('home_survey_responses')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setResponses(data || []);
    } catch (error) {
      console.error('Error fetching survey responses:', error);
      toast.error('Failed to load survey responses');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteResponse = async (id: string) => {
    if (!confirm('Are you sure you want to delete this response?')) return;

    try {
      const supabase = createClient();
      const { error } = await supabase.from('home_survey_responses').delete().eq('id', id);

      if (error) throw error;

      toast.success('Response deleted');
      fetchResponses();
    } catch (error) {
      console.error('Error deleting response:', error);
      toast.error('Failed to delete response');
    }
  };

  const total = responses.length;
  const choiceCounts = (Object.keys(CHOICE_LABELS) as Choice[])
    .map((choice) => ({
      choice,
      count: responses.filter((r) => r.choice === choice).length,
    }))
    .sort((a, b) => b.count - a.count);

  const cityCounts = Object.entries(
    responses.reduce<Record<string, number>>((acc, r) => {
      const city = r.city?.trim();
      if (!city) return acc;
      const key = city.toLowerCase();
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {})
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  if (isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <AdminSidebar />

      <main className="flex-1">
        <div className="sticky top-0 z-40 bg-white border-b border-slate-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Survey Responses</h1>
              <p className="text-sm text-slate-600">
                What visitors want most, from the homepage popup
              </p>
            </div>
            <Button onClick={fetchResponses} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg border border-slate-200 lg:col-span-2">
              <div className="flex items-baseline justify-between mb-4">
                <h2 className="font-semibold text-slate-900">Top choices</h2>
                <span className="text-sm text-slate-600">{total} responses</span>
              </div>
              <div className="space-y-3">
                {choiceCounts.map(({ choice, count }) => {
                  const percent = total ? Math.round((count / total) * 100) : 0;
                  return (
                    <div key={choice}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-800">{CHOICE_LABELS[choice]}</span>
                        <span className="text-slate-600 tabular-nums">
                          {count} ({percent}%)
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-100">
                        <div
                          className="h-2 rounded-full bg-[#8dbf65]"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-slate-200">
              <h2 className="font-semibold text-slate-900 mb-4">Most-mentioned cities</h2>
              {cityCounts.length === 0 ? (
                <p className="text-sm text-slate-600">No cities yet</p>
              ) : (
                <ul className="space-y-2">
                  {cityCounts.map(([city, count]) => (
                    <li key={city} className="flex justify-between text-sm">
                      <span className="capitalize text-slate-800">{city}</span>
                      <span className="text-slate-600 tabular-nums">{count}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg border border-slate-200">
            <div className="p-4 border-b border-slate-200">
              <h2 className="font-semibold text-slate-900">All Responses</h2>
            </div>

            {isLoading ? (
              <div className="p-12 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900 mx-auto"></div>
                <p className="mt-4 text-slate-600">Loading responses...</p>
              </div>
            ) : responses.length === 0 ? (
              <div className="p-12 text-center text-slate-600">
                <ClipboardList className="h-12 w-12 mx-auto mb-4 text-slate-400" />
                <p>No survey responses yet</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Choice</TableHead>
                    <TableHead>Details</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Answered</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {responses.map((response) => (
                    <TableRow key={response.id}>
                      <TableCell className="font-medium">
                        {CHOICE_LABELS[response.choice]}
                      </TableCell>
                      <TableCell className="max-w-md whitespace-pre-wrap">
                        {response.city || response.other_text || '-'}
                      </TableCell>
                      <TableCell>{response.email || '-'}</TableCell>
                      <TableCell className="text-slate-600">
                        {format(new Date(response.created_at), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell>
                        <Button
                          onClick={() => deleteResponse(response.id)}
                          variant="ghost"
                          size="sm"
                          aria-label="Delete response"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
