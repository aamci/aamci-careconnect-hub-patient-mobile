import { useState } from "react";
import { Loader2 } from "lucide-react";
import { StarRating } from "./StarRating";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface ReviewFormProps {
  onSubmit: (data: {
    rating: number;
    comment?: string;
    is_anonymous: boolean;
    cleanliness_rating?: number;
    reception_rating?: number;
    equipment_rating?: number;
  }) => void;
  isPending?: boolean;
  showFacilityRatings?: boolean;
}

export function ReviewForm({ onSubmit, isPending, showFacilityRatings }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [cleanlinessRating, setCleanlinessRating] = useState(0);
  const [receptionRating, setReceptionRating] = useState(0);
  const [equipmentRating, setEquipmentRating] = useState(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) return;
    onSubmit({
      rating,
      comment: comment.trim() || undefined,
      is_anonymous: isAnonymous,
      ...(showFacilityRatings && {
        cleanliness_rating: cleanlinessRating || undefined,
        reception_rating: receptionRating || undefined,
        equipment_rating: equipmentRating || undefined,
      }),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="text-center">
        <p className="text-sm font-medium mb-2">Note globale *</p>
        <div className="flex justify-center">
          <StarRating rating={rating} onChange={setRating} size="lg" />
        </div>
      </div>

      {showFacilityRatings && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm">Propreté</span>
            <StarRating rating={cleanlinessRating} onChange={setCleanlinessRating} size="sm" />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Accueil</span>
            <StarRating rating={receptionRating} onChange={setReceptionRating} size="sm" />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Équipements</span>
            <StarRating rating={equipmentRating} onChange={setEquipmentRating} size="sm" />
          </div>
        </div>
      )}

      <div>
        <Label htmlFor="comment" className="text-sm font-medium">
          Commentaire (optionnel)
        </Label>
        <Textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Partagez votre expérience..."
          rows={4}
          maxLength={1000}
          className="mt-1.5"
        />
        <p className="text-xs text-muted-foreground mt-1 text-right">{comment.length}/1000</p>
      </div>

      <div className="flex items-center justify-between">
        <Label htmlFor="anonymous" className="text-sm">Publier anonymement</Label>
        <Switch id="anonymous" checked={isAnonymous} onCheckedChange={setIsAnonymous} />
      </div>

      <Button type="submit" className="w-full" disabled={rating === 0 || isPending}>
        {isPending ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Envoi...
          </>
        ) : (
          "Publier l'avis"
        )}
      </Button>
    </form>
  );
}
