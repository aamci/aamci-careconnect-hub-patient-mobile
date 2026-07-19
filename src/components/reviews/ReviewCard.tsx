import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { Flag, User, MessageCircleReply, Scale, Loader2 } from "lucide-react";
import { StarRating } from "./StarRating";
import { Card } from "@/components/common/Card";
import { Avatar } from "@/components/common/Avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { DisputeDialog } from "./DisputeDialog";
import { useCreateReviewResponse, type ReviewResponse } from "@/hooks/useReviews";
import { useToast } from "@/hooks/use-toast";

interface ReviewCardProps {
  id?: string;
  rating: number;
  comment: string | null;
  is_anonymous: boolean;
  created_at: string;
  patient_profile?: { first_name: string; last_name: string; avatar_url: string | null };
  onReport?: () => void;
  extraRatings?: { label: string; value: number | null }[];
  response?: ReviewResponse;
  canRespond?: boolean;
  reviewType?: "practitioner" | "facility";
}

export function ReviewCard({
  id,
  rating,
  comment,
  is_anonymous,
  created_at,
  patient_profile,
  onReport,
  extraRatings,
  response,
  canRespond,
  reviewType = "practitioner",
}: ReviewCardProps) {
  const [showReply, setShowReply] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [showDispute, setShowDispute] = useState(false);
  const createResponse = useCreateReviewResponse();
  const { toast } = useToast();

  const displayName = is_anonymous
    ? "Patient anonyme"
    : patient_profile
      ? `${patient_profile.first_name} ${patient_profile.last_name.charAt(0)}.`
      : "Patient";

  const handleReply = async () => {
    if (!id || !replyText.trim()) return;
    try {
      await createResponse.mutateAsync({
        review_id: id,
        review_type: reviewType,
        response: replyText.trim(),
      });
      toast({ title: "Réponse publiée" });
      setReplyText("");
      setShowReply(false);
    } catch {
      toast({ variant: "destructive", title: "Erreur", description: "Impossible de publier la réponse." });
    }
  };

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          {is_anonymous ? (
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
              <User className="h-5 w-5 text-muted-foreground" />
            </div>
          ) : (
            <Avatar src={patient_profile?.avatar_url || undefined} alt={displayName} size="md" />
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

      {comment && <p className="text-sm text-foreground mt-3 leading-relaxed">{comment}</p>}

      {response && (
        <div className="mt-3 ml-4 pl-3 border-l-2 border-primary/40 bg-primary/5 rounded-r-md p-3">
          <p className="text-xs font-semibold text-primary mb-1">Réponse du professionnel</p>
          <p className="text-sm text-foreground leading-relaxed">{response.response}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {formatDistanceToNow(new Date(response.created_at), { addSuffix: true, locale: fr })}
          </p>
        </div>
      )}

      {(canRespond || id) && (
        <div className="flex items-center gap-2 mt-3">
          {canRespond && !response && id && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowReply(v => !v)}
              className="text-xs h-7"
            >
              <MessageCircleReply className="h-3.5 w-3.5 mr-1" />
              Répondre
            </Button>
          )}
          {id && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDispute(true)}
              className="text-xs h-7 text-muted-foreground"
            >
              <Scale className="h-3.5 w-3.5 mr-1" />
              Contester
            </Button>
          )}
        </div>
      )}

      {showReply && (
        <div className="mt-2 space-y-2">
          <Textarea
            value={replyText}
            onChange={e => setReplyText(e.target.value)}
            placeholder="Votre réponse publique..."
            rows={3}
            maxLength={800}
          />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setShowReply(false)}>Annuler</Button>
            <Button size="sm" onClick={handleReply} disabled={!replyText.trim() || createResponse.isPending}>
              {createResponse.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Publier"}
            </Button>
          </div>
        </div>
      )}

      {id && (
        <DisputeDialog
          open={showDispute}
          onOpenChange={setShowDispute}
          reviewId={id}
          reviewType={reviewType}
        />
      )}
    </Card>
  );
}
