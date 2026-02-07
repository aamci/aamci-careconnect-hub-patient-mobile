import { useNavigate } from "react-router-dom";
import { Heart, Star, Video, Loader2 } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { Header } from "@/components/layout/Header";
import { Card } from "@/components/common/Card";
import { Avatar } from "@/components/common/Avatar";
import { Badge } from "@/components/common/Badge";
import { EmptyState } from "@/components/common/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { useFavorites, useToggleFavorite } from "@/hooks/useFavorites";
import { useToast } from "@/hooks/use-toast";

export default function FavoritesPage() {
  const navigate = useNavigate();
  const { data: favorites, isLoading } = useFavorites();
  const toggleFavorite = useToggleFavorite();
  const { toast } = useToast();

  const handleRemove = async (e: React.MouseEvent, practitionerId: string) => {
    e.stopPropagation();
    try {
      await toggleFavorite.mutateAsync(practitionerId);
      toast({ title: "Retiré des favoris" });
    } catch {
      toast({ title: "Erreur", variant: "destructive" });
    }
  };

  return (
    <>
      <PageContainer noPadding className="overflow-x-hidden">
        <Header title="Mes favoris" showBack />
        
        <div className="px-4 pb-4 max-w-lg mx-auto">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="p-3 sm:p-4">
                  <div className="flex gap-3">
                    <Skeleton className="w-12 h-12 rounded-xl shrink-0" />
                    <div className="flex-1">
                      <Skeleton className="h-5 w-40 mb-1" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : !favorites?.length ? (
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
              {favorites.map((fav) => {
                const p = fav.practitioner as any;
                if (!p) return null;
                return (
                  <Card 
                    key={fav.id} 
                    hover
                    className="p-3 sm:p-4"
                    onClick={() => navigate(`/practitioners/${p.id}`)}
                  >
                    <div className="flex gap-3">
                      <Avatar
                        src={p.avatar_url}
                        alt={`${p.first_name} ${p.last_name}`}
                        size="md"
                        className="shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <h3 className="font-semibold text-foreground text-sm sm:text-base truncate">
                              Dr. {p.first_name} {p.last_name}
                            </h3>
                            <p className="text-xs sm:text-sm text-muted-foreground truncate">
                              {p.specialty?.name}
                            </p>
                          </div>
                          {p.rating && (
                            <div className="flex items-center gap-1 text-xs sm:text-sm shrink-0">
                              <Star className="h-3.5 w-3.5 sm:h-4 sm:w-4 fill-warning text-warning" />
                              <span className="font-medium">{p.rating}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          {p.teleconsultation_enabled && (
                            <Badge variant="info" icon={<Video className="h-3 w-3" />} className="text-[10px] sm:text-xs">
                              Vidéo
                            </Badge>
                          )}
                          {p.consultation_price && (
                            <Badge variant="muted" className="text-[10px] sm:text-xs">
                              {p.consultation_price}€
                            </Badge>
                          )}
                        </div>
                      </div>
                      <button 
                        className="shrink-0 self-start p-1 min-w-[44px] min-h-[44px] flex items-center justify-center"
                        onClick={(e) => handleRemove(e, p.id)}
                        disabled={toggleFavorite.isPending}
                      >
                        {toggleFavorite.isPending ? (
                          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                        ) : (
                          <Heart className="h-5 w-5 fill-accent text-accent" />
                        )}
                      </button>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </PageContainer>
      <BottomNavigation />
    </>
  );
}
