'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, DollarSign, TrendingUp, CheckCircle, Clock } from 'lucide-react';
import { CommissionTracking } from '@/lib/types/roles';
import { AdminSidebar } from '@/components/AdminSidebar';

export default function AdminCommissionsPage() {
  const { permissions } = useAuth();
  const router = useRouter();
  const [commissions, setCommissions] = useState<any[]>([]);
  const [conversions, setConversions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    if (!permissions.canManageCommissions) {
      router.push('/');
      return;
    }
    loadData();
  }, [permissions]);

  const loadData = async () => {
    try {
      const { data: commissionsData } = await supabase
        .from('commission_tracking')
        .select(`
          *,
          local_hero:user_profiles!commission_tracking_local_hero_id_fkey(email, full_name),
          restaurant:restaurants(name),
          conversion:booking_conversions(affiliate_partner, booking_reference, clicked_at, converted_at)
        `)
        .order('created_at', { ascending: false });

      const { data: conversionsData } = await supabase
        .from('booking_conversions')
        .select('*')
        .order('clicked_at', { ascending: false })
        .limit(100);

      setCommissions(commissionsData || []);
      setConversions(conversionsData || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsPaid = async (commissionId: string, payoutRef: string) => {
    try {
      const { error } = await supabase
        .from('commission_tracking')
        .update({
          status: 'paid',
          paid_at: new Date().toISOString(),
          payout_reference: payoutRef,
        })
        .eq('id', commissionId);

      if (error) throw error;

      loadData();
    } catch (error) {
      console.error('Error marking as paid:', error);
    }
  };

  const handleConfirmCommission = async (commissionId: string) => {
    try {
      const { error } = await supabase
        .from('commission_tracking')
        .update({
          status: 'confirmed',
          confirmed_at: new Date().toISOString(),
        })
        .eq('id', commissionId);

      if (error) throw error;

      loadData();
    } catch (error) {
      console.error('Error confirming commission:', error);
    }
  };

  if (!permissions.canManageCommissions) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>You do not have permission to access this page.</AlertDescription>
        </Alert>
      </div>
    );
  }

  const totalCommissions = commissions.reduce((sum, c) => sum + Number(c.commission_amount), 0);
  const pendingCommissions = commissions
    .filter(c => c.status === 'pending')
    .reduce((sum, c) => sum + Number(c.commission_amount), 0);
  const paidCommissions = commissions
    .filter(c => c.status === 'paid')
    .reduce((sum, c) => sum + Number(c.commission_amount), 0);
  const totalConversions = conversions.filter(c => c.status === 'converted').length;

  const filteredCommissions =
    statusFilter === 'all' ? commissions : commissions.filter(c => c.status === statusFilter);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <AdminSidebar />
      <div className="flex-1 flex flex-col">
        <div className="border-b bg-white shadow-sm">
          <div className="px-6 py-4">
            <h1 className="text-2xl font-bold text-slate-900">Commission & Payouts</h1>
            <p className="text-sm text-slate-600 mt-1">Track commissions and manage payouts</p>
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          <div className="px-6 py-6">

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Commissions</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">£{totalCommissions.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">{commissions.length} transactions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">£{pendingCommissions.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Awaiting payment</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid Out</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">£{paidCommissions.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Successfully paid</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversions</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalConversions}</div>
            <p className="text-xs text-muted-foreground">Total bookings</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="commissions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="commissions">Commissions</TabsTrigger>
          <TabsTrigger value="conversions">Conversions</TabsTrigger>
        </TabsList>

        <TabsContent value="commissions" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Commission Tracking</CardTitle>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredCommissions.map(commission => (
                  <div key={commission.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold">{commission.local_hero?.full_name || 'Unknown'}</h3>
                        <p className="text-sm text-muted-foreground">{commission.local_hero?.email}</p>
                        <p className="text-sm mt-1">{commission.restaurant?.name || 'Unknown Restaurant'}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold">£{Number(commission.commission_amount).toFixed(2)}</div>
                        <p className="text-sm text-muted-foreground">{commission.commission_percentage}%</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>Partner: {commission.conversion?.affiliate_partner}</span>
                        <span>Ref: {commission.conversion?.booking_reference}</span>
                        <span>{new Date(commission.created_at).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            commission.status === 'paid'
                              ? 'default'
                              : commission.status === 'confirmed'
                              ? 'secondary'
                              : 'outline'
                          }
                        >
                          {commission.status}
                        </Badge>
                        {commission.status === 'pending' && (
                          <Button size="sm" onClick={() => handleConfirmCommission(commission.id)}>
                            Confirm
                          </Button>
                        )}
                        {commission.status === 'confirmed' && (
                          <Button
                            size="sm"
                            onClick={() => {
                              const ref = prompt('Enter payout reference:');
                              if (ref) handleMarkAsPaid(commission.id, ref);
                            }}
                          >
                            Mark Paid
                          </Button>
                        )}
                        {commission.payout_reference && (
                          <span className="text-xs text-muted-foreground">
                            Ref: {commission.payout_reference}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {filteredCommissions.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No commissions found
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="conversions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Conversions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {conversions.slice(0, 50).map(conversion => (
                  <div key={conversion.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold">{conversion.affiliate_partner}</p>
                        <p className="text-sm text-muted-foreground">
                          Clicked: {new Date(conversion.clicked_at).toLocaleString()}
                        </p>
                        {conversion.converted_at && (
                          <p className="text-sm text-muted-foreground">
                            Converted: {new Date(conversion.converted_at).toLocaleString()}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <Badge
                          variant={
                            conversion.status === 'converted'
                              ? 'default'
                              : conversion.status === 'clicked'
                              ? 'secondary'
                              : 'outline'
                          }
                        >
                          {conversion.status}
                        </Badge>
                        {conversion.conversion_value && (
                          <p className="text-sm mt-1">£{Number(conversion.conversion_value).toFixed(2)}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
