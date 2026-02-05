import { useNavigate } from "react-router-dom";
import { Heart, Star, Video } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { Header } from "@/components/layout/Header";
import { Card } from "@/components/common/Card";
import { Avatar } from "@/components/common/Avatar";
import { Badge } from "@/components/common/Badge";
import { EmptyState } from "@/components/common/EmptyState";

// For now, this uses an empty state as favorites need to be implemented in the database
// This would typically use a hook like useFavoritePractitioners()

export default function FavoritesPage() {
  const navigate = useNavigate();
  
  // Placeholder - in production, this would come from the database
  const favorites: any[] = [];

  return (
    <>
      <PageContainer noPadding className="overflow-x-hidden">
        <Header title="Mes favoris" showBack />
        
        <div className="px-4 pb-4 max-w-lg mx-auto">
          {favorites.length === 0 ? (
            <EmptyState
              icon={Heart}
              title="Aucun favori"
              description="Ajoutez des praticiens à vos favoris pour les retrouver facilement"
              action={{
                label: "Rechercher un praticien",
                onClick: () => navigate("/search"),
              }}
            />
          ) : (
            <div className="space-y-3">
              {favorites.map((practitioner) => (
                <Card 
                  key={practitioner.id} 
                  hover
                  className="p-3 sm:p-4"
                  onClick={() => navigate(`/practitioners/${practitioner.id}`)}
                >
                  <div className="flex gap-3">
                    <Avatar
                      src={practitioner.avatar_url}
                      alt={`${practitioner.first_name} ${practitioner.last_name}`}
                      size="md"
                      className="shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold text-foreground text-sm sm:text-base truncate">
                            Dr. {practitioner.first_name} {practitioner.last_name}
                          </h3>
                          <p className="text-xs sm:text-sm text-muted-foreground truncate">
                            {practitioner.specialty?.name}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 text-xs sm:text-sm shrink-0">
                          <Star className="h-3.5 w-3.5 sm:h-4 sm:w-4 fill-warning text-warning" />
                          <span className="font-medium">{practitioner.rating}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        {practitioner.teleconsultation_enabled && (
                          <Badge variant="info" icon={<Video className="h-3 w-3" />} className="text-[10px] sm:text-xs">
                            Vidéo
                          </Badge>
                        )}
                      </div>
                    </div>
                    <button 
                      className="shrink-0 self-start p-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Remove from favorites
                      }}
                    >
                      <Heart className="h-5 w-5 fill-accent text-accent" />
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </PageContainer>
      <BottomNavigation />
    </>
  );
}