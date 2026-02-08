import { useNavigate } from "react-router-dom";
import { Video, Star } from "lucide-react";
import { Card } from "@/components/common/Card";
import { Avatar } from "@/components/common/Avatar";
import { Badge } from "@/components/common/Badge";
import { isToday, isTomorrow } from "date-fns";
import type { Practitioner } from "@/hooks/usePractitioners";

interface Props {
  practitioner: Practitioner;
  distance?: number | null;
}

export function PractitionerCard({ practitioner, distance }: Props) {
  const navigate = useNavigate();

  return (
    <Card
      hover
      className="p-3 sm:p-4"
      onClick={() => navigate(`/practitioners/${practitioner.id}`)}
    >
      <div className="flex gap-3">
        <Avatar
          src={practitioner.avatar_url || undefined}
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

          <div className="flex flex-wrap items-center gap-2 mt-2">
            {practitioner.teleconsultation_enabled && (
              <Badge variant="info" icon={<Video className="h-3 w-3" />} className="text-[10px] sm:text-xs">
                Vidéo
              </Badge>
            )}
            {practitioner.accepts_new_patients && (
              <Badge variant="success" className="text-[10px] sm:text-xs">Nouveaux patients</Badge>
            )}
            {distance != null && (
              <Badge variant="default" className="text-[10px] sm:text-xs">
                {distance < 1 ? `${Math.round(distance * 1000)}m` : `${distance.toFixed(1)}km`}
              </Badge>
            )}
          </div>

          <div className="flex items-center justify-between mt-2 sm:mt-3">
            <div className="text-xs sm:text-sm">
              {practitioner.next_availability && (
                <span className="text-success font-medium">
                  Dispo. {isToday(new Date(practitioner.next_availability)) ? "auj." :
                    isTomorrow(new Date(practitioner.next_availability)) ? "dem." : "bientôt"}
                </span>
              )}
            </div>
            {practitioner.consultation_price && (
              <span className="text-xs sm:text-sm font-semibold text-foreground">
                {practitioner.consultation_price}€
              </span>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
