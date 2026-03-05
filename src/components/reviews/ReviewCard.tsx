import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { Flag, User } from "lucide-react";
import { StarRating } from "./StarRating";
import { Card } from "@/components/common/Card";
import { Avatar } from "@/components/common/Avatar";

interface ReviewCardProps {
  rating: number;
  comment: string | null;
  is_anonymous: boolean;
  created_at: string;
  patient_profile?: { first_name: string; last_name: string; avatar_url: string | null };
  onReport?: () => void;
  extraRatings?: { label: string; value: number | null }[];
}

export function ReviewCard({ rating, comment, is_anonymous, created_at, patient_profile, onReport, extraRatings }: ReviewCardProps) {
  const displayName = is_anonymous
    ? "Patient anonyme"
    : patient_profile
      ? `${patient_profile.first_name} ${patient_profile.last_name.charAt(0)}.`
      : "Patient";

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          {is_anonymous ? (
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
              <User className="h-5 w-5 text-muted-foreground" />
            </div>
          ) : (
            <Avatar
              src={patient_profile?.avatar_url || undefined}
              alt={displayName}
              size="md"
            />
          )}
          <div>
            <p className="font-medium text-sm">{displayName}</p>
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(created_at), { addSuffix: true, locale: fr })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <StarRating rating={rating} size="sm" readonly />
          {onReport && (
            <button
              onClick={onReport}
              className="p-1.5 rounded-full hover:bg-muted transition-colors"
              aria-label="Signaler cet avis"
            >
              <Flag className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          )}
        </div>
      </div>

      {extraRatings && extraRatings.some(r => r.value) && (
        <div className="flex flex-wrap gap-3 mt-3">
          {extraRatings.map(r => r.value && (
            <div key={r.label} className="flex items-center gap-1 text-xs text-muted-foreground">
              <span>{r.label}:</span>
              <StarRating rating={r.value} size="sm" readonly />
            </div>
          ))}
        </div>
      )}

      {comment && (
        <p className="text-sm text-foreground mt-3 leading-relaxed">{comment}</p>
      )}
    </Card>
  );
}
