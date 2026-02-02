"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase/client";
import useSWR from "swr";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  Search,
  CheckCircle,
  XCircle,
  Eye,
  MapPin,
  Phone,
  Globe,
  Clock,
  RefreshCw,
  Store,
} from "lucide-react";
import Link from "next/link";
import { AdminSidebar } from '@/components/AdminSidebar';

interface RestaurantSuggestion {
  id: string;
  user_id: string;
  name: string;
  cuisine: string;
  address: string;
  city: string;
  postcode: string | null;
  phone: string | null;
  website: string | null;
  description: string | null;
  status: "pending" | "approved" | "rejected";
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
  user_profiles?: {
    full_name: string;
    email: string;
  };
}

const fetcher = async (url: string) => {
  const { data, error } = await supabase
    .from("restaurant_suggestions")
    .select(`
      *,
      user_profiles (
        full_name,
        email
      )
    `)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data as RestaurantSuggestion[];
};

export default function AdminSuggestionsPage() {
  const router = useRouter();
  const { user, userProfile, loading: authLoading, signOut } = useAuth();
  const { toast } = useToast();

  const { data: suggestions, error, mutate } = useSWR(
    "restaurant_suggestions",
    fetcher
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedSuggestion, setSelectedSuggestion] =
    useState<RestaurantSuggestion | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isConvertDialogOpen, setIsConvertDialogOpen] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const filteredSuggestions = React.useMemo(() => {
    if (!suggestions) return [];

    let filtered = suggestions;

    if (statusFilter !== "all") {
      filtered = filtered.filter((s) => s.status === statusFilter);
    }

    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.name.toLowerCase().includes(query) ||
          s.cuisine.toLowerCase().includes(query) ||
          s.city.toLowerCase().includes(query) ||
          s.address.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [suggestions, statusFilter, searchQuery]);

  const stats = React.useMemo(() => {
    if (!suggestions) return { pending: 0, approved: 0, rejected: 0, total: 0 };

    return {
      pending: suggestions.filter((s) => s.status === "pending").length,
      approved: suggestions.filter((s) => s.status === "approved").length,
      rejected: suggestions.filter((s) => s.status === "rejected").length,
      total: suggestions.length,
    };
  }, [suggestions]);

  React.useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.push("/login");
      return;
    }

    if (!userProfile) {
      const timeout = setTimeout(() => {
        toast({
          title: "Profile Loading Error",
          description: "Unable to load user profile. Please try refreshing.",
          variant: "destructive",
        });
      }, 8000);
      return () => clearTimeout(timeout);
    }

    if (userProfile.role !== "admin") {
      toast({
        title: "Access Denied",
        description: "You do not have permission to access this page.",
        variant: "destructive",
      });
      router.push("/");
      return;
    }
  }, [user, userProfile, authLoading, router, toast]);

  const handleViewDetails = (suggestion: RestaurantSuggestion) => {
    setSelectedSuggestion(suggestion);
    setAdminNotes(suggestion.admin_notes || "");
    setIsDetailDialogOpen(true);
  };

  const handleUpdateStatus = async (
    suggestionId: string,
    newStatus: "approved" | "rejected"
  ) => {
    setIsProcessing(true);

    try {
      const { error: updateError } = await supabase
        .from("restaurant_suggestions")
        .update({
          status: newStatus,
          admin_notes: adminNotes,
          updated_at: new Date().toISOString(),
        })
        .eq("id", suggestionId);

      if (updateError) throw updateError;

      toast({
        title: "Success",
        description: `Suggestion ${newStatus === "approved" ? "approved" : "rejected"} successfully`,
      });

      mutate();
      setIsDetailDialogOpen(false);
      setSelectedSuggestion(null);
      setAdminNotes("");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update suggestion",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConvertToRestaurant = () => {
    setIsDetailDialogOpen(false);
    setIsConvertDialogOpen(true);
  };

  const confirmConvertToRestaurant = async () => {
    if (!selectedSuggestion) return;

    setIsProcessing(true);

    try {
      const slug = selectedSuggestion.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

      const { error: insertError } = await supabase.from("restaurants").insert({
        name: selectedSuggestion.name,
        slug,
        cuisine: selectedSuggestion.cuisine,
        address: selectedSuggestion.address,
        city: selectedSuggestion.city,
        phone: selectedSuggestion.phone,
        website_url: selectedSuggestion.website,
        description: selectedSuggestion.description,
        latitude: 0,
        longitude: 0,
        price_level: 2,
        visible: false,
        nugget_verified: false,
        kids_menu: false,
        high_chairs: false,
        wheelchair_access: false,
        outdoor_seating: false,
        changing_table: false,
        vegetarian_options: false,
        vegan_options: false,
        gluten_free_options: false,
        likes_count: 0,
      });

      if (insertError) throw insertError;

      const { error: updateError } = await supabase
        .from("restaurant_suggestions")
        .update({
          status: "approved",
          admin_notes: `${adminNotes}\n\nConverted to restaurant on ${new Date().toISOString()}`,
          updated_at: new Date().toISOString(),
        })
        .eq("id", selectedSuggestion.id);

      if (updateError) throw updateError;

      toast({
        title: "Success",
        description: "Suggestion converted to restaurant successfully. Please update coordinates and other details.",
      });

      mutate();
      setIsConvertDialogOpen(false);
      setSelectedSuggestion(null);
      setAdminNotes("");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to convert suggestion to restaurant",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            Pending
          </Badge>
        );
      case "approved":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            Approved
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="secondary" className="bg-red-100 text-red-800">
            Rejected
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (authLoading || (user && !userProfile)) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-300 border-t-[#8dbf65] mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <AdminSidebar />

      <div className="flex-1 flex flex-col">
        <div className="border-b bg-white shadow-sm">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  Restaurant Suggestions
                </h1>
                <p className="text-sm text-slate-600 mt-1">
                  Review and manage restaurant suggestions from users
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => mutate()}
                  className="gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Refresh
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          <div className="px-6 py-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Pending
                  </CardTitle>
                  <Clock className="h-4 w-4 text-yellow-600" />
                </CardHeader>
                <CardContent>
                  {!suggestions ? (
                    <Skeleton className="h-8 w-16" />
                  ) : (
                    <div className="text-2xl font-bold">{stats.pending}</div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Approved
                  </CardTitle>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  {!suggestions ? (
                    <Skeleton className="h-8 w-16" />
                  ) : (
                    <div className="text-2xl font-bold">{stats.approved}</div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Rejected
                  </CardTitle>
                  <XCircle className="h-4 w-4 text-red-600" />
                </CardHeader>
                <CardContent>
                  {!suggestions ? (
                    <Skeleton className="h-8 w-16" />
                  ) : (
                    <div className="text-2xl font-bold">{stats.rejected}</div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total
                  </CardTitle>
                  <Store className="h-4 w-4 text-slate-600" />
                </CardHeader>
                <CardContent>
                  {!suggestions ? (
                    <Skeleton className="h-8 w-16" />
                  ) : (
                    <div className="text-2xl font-bold">{stats.total}</div>
                  )}
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between gap-4">
                  <div className="flex-1 flex gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        placeholder="Search by name, cuisine, or city..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {!suggestions ? (
                  <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                  </div>
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Restaurant Name</TableHead>
                          <TableHead>Cuisine</TableHead>
                          <TableHead>City</TableHead>
                          <TableHead>Submitted By</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredSuggestions.length === 0 ? (
                          <TableRow>
                            <TableCell
                              colSpan={7}
                              className="text-center py-8 text-slate-500"
                            >
                              No suggestions found
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredSuggestions.map((suggestion) => (
                            <TableRow key={suggestion.id}>
                              <TableCell className="font-medium">
                                {suggestion.name}
                              </TableCell>
                              <TableCell>{suggestion.cuisine}</TableCell>
                              <TableCell>{suggestion.city}</TableCell>
                              <TableCell>
                                <div className="text-sm">
                                  <div className="font-medium">
                                    {suggestion.user_profiles?.full_name || "Unknown"}
                                  </div>
                                  <div className="text-slate-500">
                                    {suggestion.user_profiles?.email || "N/A"}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="text-sm text-slate-600">
                                  {new Date(
                                    suggestion.created_at
                                  ).toLocaleDateString()}
                                </div>
                              </TableCell>
                              <TableCell>
                                {getStatusBadge(suggestion.status)}
                              </TableCell>
                              <TableCell className="text-right">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleViewDetails(suggestion)}
                                  className="gap-2"
                                >
                                  <Eye className="h-4 w-4" />
                                  View
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Restaurant Suggestion Details</DialogTitle>
            <DialogDescription>
              Review the submission and take action
            </DialogDescription>
          </DialogHeader>

          {selectedSuggestion && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-slate-500">Restaurant Name</Label>
                  <p className="text-sm font-medium mt-1">
                    {selectedSuggestion.name}
                  </p>
                </div>
                <div>
                  <Label className="text-xs text-slate-500">Cuisine</Label>
                  <p className="text-sm font-medium mt-1">
                    {selectedSuggestion.cuisine}
                  </p>
                </div>
              </div>

              <div>
                <Label className="text-xs text-slate-500">Address</Label>
                <p className="text-sm font-medium mt-1 flex items-start gap-2">
                  <MapPin className="h-4 w-4 mt-0.5 text-slate-400 flex-shrink-0" />
                  {selectedSuggestion.address}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-slate-500">City</Label>
                  <p className="text-sm font-medium mt-1">
                    {selectedSuggestion.city}
                  </p>
                </div>
                <div>
                  <Label className="text-xs text-slate-500">Postcode / Zipcode</Label>
                  <p className="text-sm font-medium mt-1">
                    {selectedSuggestion.postcode || "N/A"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-slate-500">Phone</Label>
                  <p className="text-sm font-medium mt-1 flex items-center gap-2">
                    {selectedSuggestion.phone ? (
                      <>
                        <Phone className="h-4 w-4 text-slate-400" />
                        {selectedSuggestion.phone}
                      </>
                    ) : (
                      "N/A"
                    )}
                  </p>
                </div>
                <div>
                  <Label className="text-xs text-slate-500">Website</Label>
                  <p className="text-sm font-medium mt-1 flex items-center gap-2">
                    {selectedSuggestion.website ? (
                      <>
                        <Globe className="h-4 w-4 text-slate-400" />
                        <a
                          href={selectedSuggestion.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#8dbf65] hover:underline"
                        >
                          Visit
                        </a>
                      </>
                    ) : (
                      "N/A"
                    )}
                  </p>
                </div>
              </div>

              {selectedSuggestion.description && (
                <div>
                  <Label className="text-xs text-slate-500">
                    Why they suggested it
                  </Label>
                  <p className="text-sm mt-1 p-3 bg-slate-50 rounded-lg">
                    {selectedSuggestion.description}
                  </p>
                </div>
              )}

              <div>
                <Label className="text-xs text-slate-500">Submitted By</Label>
                <p className="text-sm font-medium mt-1">
                  {selectedSuggestion.user_profiles?.full_name || "Unknown"} (
                  {selectedSuggestion.user_profiles?.email || "N/A"})
                </p>
              </div>

              <div>
                <Label className="text-xs text-slate-500">
                  Submission Date
                </Label>
                <p className="text-sm font-medium mt-1">
                  {new Date(selectedSuggestion.created_at).toLocaleString()}
                </p>
              </div>

              <div>
                <Label className="text-xs text-slate-500">Status</Label>
                <div className="mt-1">
                  {getStatusBadge(selectedSuggestion.status)}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="admin-notes">Admin Notes</Label>
                <Textarea
                  id="admin-notes"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add internal notes about this suggestion..."
                  rows={4}
                />
              </div>
            </div>
          )}

          <DialogFooter className="flex justify-between">
            <div className="flex gap-2">
              {selectedSuggestion?.status === "pending" && (
                <>
                  <Button
                    variant="outline"
                    onClick={() =>
                      handleUpdateStatus(selectedSuggestion.id, "rejected")
                    }
                    disabled={isProcessing}
                    className="gap-2 text-red-600 hover:text-red-700"
                  >
                    <XCircle className="h-4 w-4" />
                    Reject
                  </Button>
                  <Button
                    onClick={handleConvertToRestaurant}
                    disabled={isProcessing}
                    className="gap-2 bg-[#8dbf65] hover:bg-[#7aaa56]"
                  >
                    <Store className="h-4 w-4" />
                    Convert to Restaurant
                  </Button>
                </>
              )}
            </div>
            <Button
              variant="outline"
              onClick={() => {
                setIsDetailDialogOpen(false);
                setSelectedSuggestion(null);
                setAdminNotes("");
              }}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={isConvertDialogOpen}
        onOpenChange={setIsConvertDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Convert to Restaurant?</AlertDialogTitle>
            <AlertDialogDescription>
              This will create a new restaurant listing based on this suggestion
              and mark it as approved. The restaurant will be hidden by default
              until you update the coordinates and other details.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setIsConvertDialogOpen(false);
                setIsDetailDialogOpen(true);
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmConvertToRestaurant}
              className="bg-[#8dbf65] hover:bg-[#7aaa56]"
              disabled={isProcessing}
            >
              {isProcessing ? "Converting..." : "Convert"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
