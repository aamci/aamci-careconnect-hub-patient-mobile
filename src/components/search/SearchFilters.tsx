import { Search as SearchIcon, Filter, Video, X, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { Specialty } from "@/hooks/usePractitioners";
import {
  Stethoscope, Smile, Sparkles, Eye, Heart, Baby, Activity, Brain,
} from "lucide-react";
import React from "react";

const specialtyIcons: Record<string, React.ElementType> = {
  stethoscope: Stethoscope, tooth: Smile, sparkles: Sparkles,
  eye: Eye, heart: Heart, baby: Baby, activity: Activity,
  brain: Brain, shield: Sparkles, user: Smile,
};

interface Props {
  query: string;
  onQueryChange: (q: string) => void;
  teleconsultationOnly: boolean;
  onTeleconsultationToggle: () => void;
  showFilters: boolean;
  onToggleFilters: () => void;
  selectedSpecialty: string;
  onSpecialtyChange: (id: string) => void;
  specialties?: Specialty[];
  specialtiesLoading: boolean;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
  showMap: boolean;
  onToggleMap: () => void;
  onLocate: () => void;
  locationLoading: boolean;
}

export function SearchFilters({
  query, onQueryChange, teleconsultationOnly, onTeleconsultationToggle,
  showFilters, onToggleFilters, selectedSpecialty, onSpecialtyChange,
  specialties, specialtiesLoading, hasActiveFilters, onClearFilters,
  showMap, onToggleMap, onLocate, locationLoading,
}: Props) {
  return (
    <>
      {/* Search Input */}
      <div className="relative mb-4">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground shrink-0" />
        <input
          type="text"
          placeholder="Nom, spécialité..."
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          className="w-full h-11 sm:h-12 pl-10 pr-10 rounded-xl border border-border bg-card text-foreground text-sm sm:text-base placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
        />
        {query && (
          <button
            onClick={() => onQueryChange("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Quick Filters */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
        <Button variant={showFilters ? "default" : "outline"} size="sm" onClick={onToggleFilters} className="shrink-0 min-h-[36px]">
          <Filter className="h-4 w-4 mr-1 shrink-0" />
          Filtres
        </Button>
        <Button variant={teleconsultationOnly ? "default" : "outline"} size="sm" onClick={onTeleconsultationToggle} className="shrink-0 min-h-[36px]">
          <Video className="h-4 w-4 mr-1 shrink-0" />
          Téléconsultation
        </Button>
        <Button variant={showMap ? "default" : "outline"} size="sm" onClick={onToggleMap} className="shrink-0 min-h-[36px]">
          <MapPin className="h-4 w-4 mr-1 shrink-0" />
          Carte
        </Button>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={onClearFilters} className="shrink-0 text-destructive min-h-[36px]">
            <X className="h-4 w-4 mr-1" />
            Effacer
          </Button>
        )}
      </div>

      {/* Specialty Filter */}
      {showFilters && (
        <div className="mb-4 animate-fade-in">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-muted-foreground">Spécialité</p>
            <Button
              variant="ghost"
              size="sm"
              onClick={onLocate}
              disabled={locationLoading}
              className="text-xs h-7 gap-1"
            >
              <MapPin className="h-3.5 w-3.5" />
              {locationLoading ? "Localisation..." : "Autour de moi"}
            </Button>
          </div>
          {specialtiesLoading ? (
            <div className="flex flex-wrap gap-2">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-8 w-24 rounded-full" />
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {specialties?.map((specialty) => {
                const Icon = specialtyIcons[specialty.icon || "stethoscope"] || Stethoscope;
                const isSelected = selectedSpecialty === specialty.id;
                return (
                  <button
                    key={specialty.id}
                    onClick={() => onSpecialtyChange(isSelected ? "" : specialty.id)}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs sm:text-sm transition-all min-h-[32px]",
                      isSelected
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {specialty.name}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </>
  );
}
