'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { LocalHeroNav } from '@/components/LocalHeroNav';
import { LocalHeroHeader } from '@/components/LocalHeroHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { DollarSign, TrendingUp, Calendar, Loader2 } from 'lucide-react';

interface EarningsRecord {
  id: string;
  date: string;
  restaurant: string;
  type: string;
  amount: number;
  status: string;
}

export default function EarningsPage() {
  const { user, userProfile, loading: authLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [earnings, setEarnings] = useState<EarningsRecord[]>([]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    if (!authLoading && userProfile && userProfile.role !== 'local_hero') {
      router.push('/');
      return;
    }

    if (user && userProfile?.role === 'local_hero') {
      loadEarningsData();
    }
  }, [user, userProfile, authLoading, router]);

  const loadEarningsData = async () => {
    try {
      setLoading(true);
      // TODO: Load actual earnings data from database
      setEarnings([]);
    } catch (error) {
      console.error('Error loading earnings:', error);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#8dbf65]" />
      </div>
    );
  }

  const totalEarnings = 0;
  const monthlyEarnings = 0;
  const pendingPayouts = 0;

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <LocalHeroNav />

      <div className="flex-1 flex flex-col">
        <LocalHeroHeader
          title="Earnings"
          description="Track your commission and payout history"
        />

        <div className="flex-1 overflow-auto">
          <div className="px-6 py-6">

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalEarnings.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                All-time commission
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Month</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${monthlyEarnings.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                Current month earnings
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Payouts</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${pendingPayouts.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                Awaiting payment
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Earnings History</CardTitle>
          </CardHeader>
          <CardContent>
            {earnings.length === 0 ? (
              <div className="text-center py-12">
                <DollarSign className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-sm">
                  No earnings yet. Start promoting restaurants to earn commission!
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Restaurant</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {earnings.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell>{record.date}</TableCell>
                        <TableCell>{record.restaurant}</TableCell>
                        <TableCell>{record.type}</TableCell>
                        <TableCell>${record.amount.toFixed(2)}</TableCell>
                        <TableCell>{record.status}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
