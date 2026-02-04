import { useState, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { 
  Search as SearchIcon, 
  Filter, 
  Video, 
  Star,
  X,
  Stethoscope,
  Smile,
  Sparkles,
  Eye,
  Heart,
  Baby,
  Activity,
  Brain
} from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/common/Card";
import { Avatar } from "@/components/common/Avatar";
import { Badge } from "@/components/common/Badge";
import { EmptyState } from "@/components/common/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { useSpecialties, usePractitioners } from "@/hooks/usePractitioners";
import { isToday, isTomorrow } from "date-fns";
import { cn } from "@/lib/utils";

const specialtyIcons: Record<string, React.ElementType> = {
  stethoscope: Stethoscope,
  tooth: Smile,
  sparkles: Sparkles,
  eye: Eye,
  heart: Heart,
  baby: Baby,
  activity: Activity,
  brain: Brain,
  shield: Sparkles,
  user: Smile,
};

export default function SearchPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [selectedSpecialty, setSelectedSpecialty] = useState(searchParams.get("specialty") || "");
  const [teleconsultationOnly, setTeleconsultationOnly] = useState(searchParams.get("teleconsult") === "true");
  const [showFilters, setShowFilters] = useState(false);

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

  const hasActiveFilters = query || selectedSpecialty || teleconsultationOnly;

  return (
    <>
      <PageContainer noPadding>
        <Header title="Rechercher" />
        
        <div className="px-4 pb-4">
          {/* Search Input */}
          <div className="relative mb-4">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Nom, spécialité..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full h-12 pl-10 pr-4 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Quick Filters */}
          <div className="flex gap-2 mb-4 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
            <Button
              variant={showFilters ? "default" : "outline"}
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="shrink-0"
            >
              <Filter className="h-4 w-4 mr-1" />
              Filtres
            </Button>
            <Button
              variant={teleconsultationOnly ? "default" : "outline"}
              size="sm"
              onClick={() => setTeleconsultationOnly(!teleconsultationOnly)}
              className="shrink-0"
            >
              <Video className="h-4 w-4 mr-1" />
              Téléconsultation
            </Button>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="shrink-0 text-destructive"
              >
                <X className="h-4 w-4 mr-1" />
                Effacer
              </Button>
            )}
          </div>

          {/* Specialty Filter */}
          {showFilters && (
            <div className="mb-4 animate-slide-down">
              <p className="text-sm font-medium text-muted-foreground mb-2">Spécialité</p>
              {specialtiesLoading ? (
                <div className="flex flex-wrap gap-2">
                  {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-8 w-24 rounded-full" />
                  ))}
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {specialties?.map((specialty) => {
                    const Icon = specialtyIcons[specialty.icon || 'stethoscope'] || Stethoscope;
                    const isSelected = selectedSpecialty === specialty.id;
                    return (
                      <button
                        key={specialty.id}
                        onClick={() => setSelectedSpecialty(isSelected ? "" : specialty.id)}
                        className={cn(
                          "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-all",
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

          {/* Results */}
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              {practitioners?.length || 0} résultat{(practitioners?.length || 0) > 1 ? 's' : ''}
            </p>

            {practitionersLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="p-4">
                    <div className="flex gap-3">
                      <Skeleton className="w-12 h-12 rounded-full" />
                      <div className="flex-1">
                        <Skeleton className="h-5 w-32 mb-1" />
                        <Skeleton className="h-4 w-24 mb-2" />
                        <Skeleton className="h-6 w-20" />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : practitioners?.length === 0 ? (
              <EmptyState
                icon={SearchIcon}
                title="Aucun résultat"
                description="Essayez de modifier vos critères de recherche"
                action={{
                  label: "Effacer les filtres",
                  onClick: clearFilters,
                }}
              />
            ) : (
              practitioners?.map((practitioner) => (
                <Card 
                  key={practitioner.id} 
                  hover
                  className="p-4"
                  onClick={() => navigate(`/practitioners/${practitioner.id}`)}
                >
                  <div className="flex gap-3">
                    <Avatar
                      src={practitioner.avatar_url || undefined}
                      alt={`${practitioner.first_name} ${practitioner.last_name}`}
                      size="lg"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-semibold text-foreground">
                            Dr. {practitioner.first_name} {practitioner.last_name}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {practitioner.specialty?.name}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 text-sm shrink-0">
                          <Star className="h-4 w-4 fill-warning text-warning" />
                          <span className="font-medium">{practitioner.rating}</span>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        {practitioner.teleconsultation_enabled && (
                          <Badge variant="info" icon={<Video className="h-3 w-3" />}>
                            Vidéo
                          </Badge>
                        )}
                        {practitioner.accepts_new_patients && (
                          <Badge variant="success">Accepte nouveaux patients</Badge>
                        )}
                      </div>

                      <div className="flex items-center justify-between mt-3">
                        <div className="text-sm">
                          {practitioner.next_availability && (
                            <span className="text-success font-medium">
                              Dispo. {isToday(new Date(practitioner.next_availability)) ? "aujourd'hui" : 
                                      isTomorrow(new Date(practitioner.next_availability)) ? "demain" : "bientôt"}
                            </span>
                          )}
                        </div>
                        {practitioner.consultation_price && (
                          <span className="text-sm font-semibold text-foreground">
                            {practitioner.consultation_price}€
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      </PageContainer>
      <BottomNavigation />
    </>
  );
}
