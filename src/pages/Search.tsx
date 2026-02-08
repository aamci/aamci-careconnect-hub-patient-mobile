import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Search as SearchIcon } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { Header } from "@/components/layout/Header";
import { Card } from "@/components/common/Card";
import { EmptyState } from "@/components/common/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { useSpecialties, usePractitioners } from "@/hooks/usePractitioners";
import { useGeolocation, getDistanceKm } from "@/hooks/useGeolocation";
import { SearchFilters } from "@/components/search/SearchFilters";
import { PractitionerCard } from "@/components/search/PractitionerCard";
import { PractitionerMap } from "@/components/search/PractitionerMap";

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [selectedSpecialty, setSelectedSpecialty] = useState(searchParams.get("specialty") || "");
  const [teleconsultationOnly, setTeleconsultationOnly] = useState(searchParams.get("teleconsult") === "true");
  const [showFilters, setShowFilters] = useState(false);
  const [showMap, setShowMap] = useState(false);

  const { latitude, longitude, loading: locationLoading, requestLocation } = useGeolocation();

  const { data: specialties, isLoading: specialtiesLoading } = useSpecialties();
  const { data: practitioners, isLoading: practitionersLoading } = usePractitioners({
    specialtyId: selectedSpecialty || undefined,
    teleconsultationOnly: teleconsultationOnly || undefined,
    query: query || undefined,
  });

  const clearFilters = () => {
    setQuery("");
    setSelectedSpecialty("");
    setTeleconsultationOnly(false);
    setSearchParams({});
  };

  const hasActiveFilters = !!(query || selectedSpecialty || teleconsultationOnly);

  // Sort by distance when user location is available
  const sortedPractitioners = useMemo(() => {
    if (!practitioners) return [];
    if (latitude == null || longitude == null) return practitioners;

    return [...practitioners]
      .map((p) => {
        const dist =
          p.facility?.lat != null && p.facility?.lng != null
            ? getDistanceKm(latitude, longitude, p.facility.lat, p.facility.lng)
            : null;
        return { ...p, _distance: dist };
      })
      .sort((a, b) => {
        if (a._distance == null && b._distance == null) return 0;
        if (a._distance == null) return 1;
        if (b._distance == null) return -1;
        return a._distance - b._distance;
      });
  }, [practitioners, latitude, longitude]);

  const userLocation =
    latitude != null && longitude != null ? { lat: latitude, lng: longitude } : null;

  return (
    <>
      <PageContainer noPadding className="overflow-x-hidden">
        <Header title="Rechercher" />

        <div className="px-4 pb-4 max-w-lg mx-auto">
          <SearchFilters
            query={query}
            onQueryChange={setQuery}
            teleconsultationOnly={teleconsultationOnly}
            onTeleconsultationToggle={() => setTeleconsultationOnly(!teleconsultationOnly)}
            showFilters={showFilters}
            onToggleFilters={() => setShowFilters(!showFilters)}
            selectedSpecialty={selectedSpecialty}
            onSpecialtyChange={setSelectedSpecialty}
            specialties={specialties}
            specialtiesLoading={specialtiesLoading}
            hasActiveFilters={hasActiveFilters}
            onClearFilters={clearFilters}
            showMap={showMap}
            onToggleMap={() => {
              setShowMap(!showMap);
              if (!showMap && !userLocation) requestLocation();
            }}
            onLocate={requestLocation}
            locationLoading={locationLoading}
          />

          {/* Map View */}
          {showMap && (
            <div className="mb-4 animate-fade-in">
              <PractitionerMap
                practitioners={sortedPractitioners}
                userLocation={userLocation}
                className="h-[280px] sm:h-[350px] rounded-xl overflow-hidden border border-border"
              />
            </div>
          )}

          {/* Results */}
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              {sortedPractitioners.length} résultat{sortedPractitioners.length !== 1 ? "s" : ""}
              {userLocation && " · trié par distance"}
            </p>

            {practitionersLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="p-3 sm:p-4">
                    <div className="flex gap-3">
                      <Skeleton className="w-10 h-10 sm:w-12 sm:h-12 rounded-full shrink-0" />
                      <div className="flex-1 min-w-0">
                        <Skeleton className="h-5 w-32 mb-1" />
                        <Skeleton className="h-4 w-24 mb-2" />
                        <Skeleton className="h-6 w-20" />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : sortedPractitioners.length === 0 ? (
              <EmptyState
                icon={SearchIcon}
                title="Aucun résultat"
                description="Essayez de modifier vos critères de recherche"
                action={{ label: "Effacer les filtres", onClick: clearFilters }}
              />
            ) : (
              sortedPractitioners.map((practitioner) => (
                <PractitionerCard
                  key={practitioner.id}
                  practitioner={practitioner}
                  distance={(practitioner as any)._distance ?? null}
                />
              ))
            )}
          </div>
        </div>
      </PageContainer>
      <BottomNavigation />
    </>
  );
}
