"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface CityRequestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialCityName?: string;
}

export function CityRequestModal({
  open,
  onOpenChange,
  initialCityName = "",
}: CityRequestModalProps) {
  const { user } = useAuth();
  const [cityRequestName, setCityRequestName] = useState(initialCityName);
  const [cityRequestReason, setCityRequestReason] = useState("");
  const [cityRequestEmail, setCityRequestEmail] = useState("");
  const [isSubmittingCityRequest, setIsSubmittingCityRequest] = useState(false);

  const handleCityRequest = async () => {
    if (!cityRequestName.trim() || !cityRequestReason.trim()) {
      toast.error("Please fill in city name and reason");
      return;
    }

    setIsSubmittingCityRequest(true);
    try {
      const { error } = await supabase.from("city_requests").insert({
        city_name: cityRequestName.trim(),
        reason: cityRequestReason.trim(),
        email: cityRequestEmail.trim() || null,
        user_id: user?.id || null,
      });

      if (error) throw error;

      toast.success("City request submitted successfully!");
      onOpenChange(false);
      setCityRequestName("");
      setCityRequestReason("");
      setCityRequestEmail("");
    } catch (error) {
      console.error("Error submitting city request:", error);
      toast.error("Failed to submit city request. Please try again.");
    } finally {
      setIsSubmittingCityRequest(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Request a City</DialogTitle>
          <DialogDescription>
            Let us know which city you'd like us to add to Nugget
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="city-name">City Name</Label>
            <Input
              id="city-name"
              placeholder="e.g., Melbourne"
              value={cityRequestName}
              onChange={(e) => setCityRequestName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="reason">Why this city?</Label>
            <Textarea
              id="reason"
              placeholder="Tell us why you'd like to see restaurants from this city..."
              rows={4}
              value={cityRequestReason}
              onChange={(e) => setCityRequestReason(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email (optional)</Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={cityRequestEmail}
              onChange={(e) => setCityRequestEmail(e.target.value)}
            />
            <p className="text-xs text-slate-500">
              We'll notify you when this city is added
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleCityRequest}
            disabled={isSubmittingCityRequest}
            className="flex-1"
          >
            {isSubmittingCityRequest ? "Submitting..." : "Submit Request"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
