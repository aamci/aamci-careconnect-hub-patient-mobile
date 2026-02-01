import { useState, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { 
  Search as SearchIcon, 
  MapPin, 
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
import { practitioners, specialties } from "@/data/mockData";
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
};

export default function SearchPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [selectedSpecialty, setSelectedSpecialty] = useState(searchParams.get("specialty") || "");
  const [teleconsultationOnly, setTeleconsultationOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const filteredPractitioners = useMemo(() => {
    return practitioners.filter((p) => {
      const matchesQuery = !query || 
        `${p.firstName} ${p.lastName}`.toLowerCase().includes(query.toLowerCase()) ||
        p.specialty.name.toLowerCase().includes(query.toLowerCase());
      
      const matchesSpecialty = !selectedSpecialty || p.specialtyId === selectedSpecialty;
      const matchesTeleconsult = !teleconsultationOnly || p.teleconsultationEnabled;
      
      return matchesQuery && matchesSpecialty && matchesTeleconsult;
    });
  }, [query, selectedSpecialty, teleconsultationOnly]);

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
              <div className="flex flex-wrap gap-2">
                {specialties.map((specialty) => {
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
            </div>
          )}

          {/* Results */}
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              {filteredPractitioners.length} résultat{filteredPractitioners.length > 1 ? 's' : ''}
            </p>

            {filteredPractitioners.length === 0 ? (
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
              filteredPractitioners.map((practitioner) => (
                <Card 
                  key={practitioner.id} 
                  hover
                  className="p-4"
                  onClick={() => navigate(`/practitioners/${practitioner.id}`)}
                >
                  <div className="flex gap-3">
                    <Avatar
                      src={practitioner.avatarUrl}
                      alt={`${practitioner.firstName} ${practitioner.lastName}`}
                      size="lg"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-semibold text-foreground">
                            Dr. {practitioner.firstName} {practitioner.lastName}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {practitioner.specialty.name}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 text-sm shrink-0">
                          <Star className="h-4 w-4 fill-warning text-warning" />
                          <span className="font-medium">{practitioner.rating}</span>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        {practitioner.teleconsultationEnabled && (
                          <Badge variant="info" icon={<Video className="h-3 w-3" />}>
                            Vidéo
                          </Badge>
                        )}
                        {practitioner.acceptsNewPatients && (
                          <Badge variant="success">Accepte nouveaux patients</Badge>
                        )}
                      </div>

                      <div className="flex items-center justify-between mt-3">
                        <div className="text-sm">
                          {practitioner.nextAvailability && (
                            <span className="text-success font-medium">
                              Dispo. {isToday(practitioner.nextAvailability) ? "aujourd'hui" : 
                                      isTomorrow(practitioner.nextAvailability) ? "demain" : "bientôt"}
                            </span>
                          )}
                        </div>
                        {practitioner.consultationPrice && (
                          <span className="text-sm font-semibold text-foreground">
                            {practitioner.consultationPrice}€
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
