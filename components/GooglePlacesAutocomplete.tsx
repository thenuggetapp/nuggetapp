'use client';

import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Loader2, MapPin, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PlacePrediction {
  description: string;
  place_id: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
}

interface GooglePlacesAutocompleteProps {
  onPlaceSelect: (placeData: any) => void;
  onManualInput?: (name: string) => void;
  placeholder?: string;
  label?: string;
  defaultValue?: string;
}

export function GooglePlacesAutocomplete({
  onPlaceSelect,
  onManualInput,
  placeholder = 'Search for a restaurant...',
  label = 'Restaurant Name',
  defaultValue = '',
}: GooglePlacesAutocompleteProps) {
  const [input, setInput] = useState(defaultValue);
  const [predictions, setPredictions] = useState<PlacePrediction[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [fetchingDetails, setFetchingDetails] = useState(false);
  const { toast } = useToast();
  const debounceTimer = useRef<NodeJS.Timeout>();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchAutocomplete = async (searchInput: string) => {
    if (searchInput.length < 3) {
      setPredictions([]);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `${supabaseUrl}/functions/v1/google-places?action=autocomplete`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${supabaseAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ input: searchInput }),
        }
      );

      const data = await response.json();

      if (data.status === 'OK' && data.predictions) {
        setPredictions(data.predictions);
        setShowDropdown(true);
      } else {
        setPredictions([]);
      }
    } catch (error) {
      console.error('Error fetching autocomplete:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch restaurant suggestions',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (value: string) => {
    setInput(value);

    if (onManualInput) {
      onManualInput(value);
    }

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      fetchAutocomplete(value);
    }, 300);
  };

  const fetchPlaceDetails = async (placeId: string) => {
    setFetchingDetails(true);
    try {
      const response = await fetch(
        `${supabaseUrl}/functions/v1/google-places?action=details`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${supabaseAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ placeId }),
        }
      );

      const data = await response.json();

      if (data.status === 'OK' && data.result) {
        onPlaceSelect(data.result);
        toast({
          title: 'Restaurant Found',
          description: 'Form fields have been auto-filled',
        });
      } else {
        throw new Error('Failed to fetch place details');
      }
    } catch (error) {
      console.error('Error fetching place details:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch restaurant details',
        variant: 'destructive',
      });
    } finally {
      setFetchingDetails(false);
      setShowDropdown(false);
    }
  };

  const handleSelectPlace = (prediction: PlacePrediction) => {
    setInput(prediction.structured_formatting.main_text);
    fetchPlaceDetails(prediction.place_id);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <Label htmlFor="place-search">{label}</Label>
      <div className="relative">
        <Input
          id="place-search"
          type="text"
          placeholder={placeholder}
          value={input}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => {
            if (predictions.length > 0) setShowDropdown(true);
          }}
          disabled={fetchingDetails}
          className="pr-10"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {(loading || fetchingDetails) ? (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          ) : (
            <Search className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </div>

      {showDropdown && predictions.length > 0 && (
        <Card className="absolute z-50 w-full mt-1 max-h-80 overflow-y-auto shadow-lg">
          <div className="p-1">
            {predictions.map((prediction) => (
              <button
                key={prediction.place_id}
                type="button"
                onClick={() => handleSelectPlace(prediction)}
                className="w-full text-left px-3 py-2 hover:bg-accent rounded-sm transition-colors flex items-start gap-2"
              >
                <MapPin className="h-4 w-4 mt-1 text-muted-foreground flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm">
                    {prediction.structured_formatting.main_text}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">
                    {prediction.structured_formatting.secondary_text}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </Card>
      )}

      {fetchingDetails && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center rounded-md z-40">
          <div className="text-center">
            <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Loading restaurant details...</p>
          </div>
        </div>
      )}
    </div>
  );
}
