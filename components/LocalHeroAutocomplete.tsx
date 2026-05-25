"use client";

import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, Search, User, X } from "lucide-react";

export interface LocalHeroOption {
  id: string;
  email: string | null;
  full_name: string | null;
}

interface LocalHeroAutocompleteProps {
  value: LocalHeroOption | null;
  onChange: (hero: LocalHeroOption | null) => void;
  label?: string;
  placeholder?: string;
}

export function LocalHeroAutocomplete({
  value,
  onChange,
  label = "Local Hero (optional)",
  placeholder = "Search by name or email...",
}: LocalHeroAutocompleteProps) {
  const [input, setInput] = useState("");
  const [results, setResults] = useState<LocalHeroOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const debounceTimer = useRef<NodeJS.Timeout>();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    if (input.length < 3) {
      setResults([]);
      setSearchError(null);
      return;
    }

    debounceTimer.current = setTimeout(async () => {
      setLoading(true);
      setSearchError(null);
      try {
        const response = await fetch(
          `/api/admin/local-heroes/search?q=${encodeURIComponent(input)}`
        );
        const result = await response.json();

        if (!response.ok) {
          setSearchError(result.error || "Search failed. Please try again.");
          setResults([]);
          setShowDropdown(true);
          return;
        }

        if (result.error) {
          setSearchError(result.error);
          setResults([]);
        } else {
          setResults(result.data || []);
        }
        setShowDropdown(true);
      } catch (error) {
        console.error("Local hero search failed:", error);
        setSearchError("Search failed. Please try again.");
        setResults([]);
        setShowDropdown(true);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [input]);

  const handleSelect = (hero: LocalHeroOption) => {
    onChange(hero);
    setInput("");
    setResults([]);
    setShowDropdown(false);
  };

  const handleClear = () => {
    onChange(null);
    setInput("");
    setResults([]);
    setShowDropdown(false);
  };

  const displayName = (hero: LocalHeroOption) =>
    hero.full_name?.trim() || hero.email || "Unknown user";

  if (value) {
    return (
      <div className="space-y-2">
        <Label>{label}</Label>
        <Card className="p-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-full bg-[#8dbf65]/15 flex items-center justify-center flex-shrink-0">
              <User className="h-4 w-4 text-[#4a7c37]" />
            </div>
            <div className="min-w-0">
              <p className="font-medium text-sm text-slate-900 truncate">
                {displayName(value)}
              </p>
              {value.email && (
                <p className="text-xs text-slate-500 truncate">{value.email}</p>
              )}
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClear}
            aria-label="Clear selected local hero"
          >
            <X className="h-4 w-4" />
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-2 relative" ref={dropdownRef}>
      <Label htmlFor="local-hero-search">{label}</Label>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input
          id="local-hero-search"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onFocus={() => input.length >= 2 && setShowDropdown(true)}
          placeholder={placeholder}
          className="pl-9"
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-slate-400" />
        )}
      </div>

      {showDropdown && results.length > 0 && (
        <Card className="absolute z-50 w-full mt-1 max-h-60 overflow-y-auto shadow-lg">
          {results.map((hero) => (
            <button
              key={hero.id}
              type="button"
              className="w-full text-left px-4 py-3 hover:bg-slate-50 border-b last:border-b-0 transition-colors"
              onClick={() => handleSelect(hero)}
            >
              <p className="font-medium text-sm text-slate-900">
                {displayName(hero)}
              </p>
              {hero.email && (
                <p className="text-xs text-slate-500">{hero.email}</p>
              )}
            </button>
          ))}
        </Card>
      )}

      {showDropdown && !loading && input.length >= 2 && results.length === 0 && (
        <Card
          className={`absolute z-50 w-full mt-1 p-4 text-sm shadow-lg ${
            searchError ? "text-red-600" : "text-slate-500"
          }`}
        >
          {searchError || "No local heroes found"}
        </Card>
      )}
    </div>
  );
}
