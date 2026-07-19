import { useState } from "react";
import { Scale, Loader2 } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useCreateReviewDispute } from "@/hooks/useReviews";
import { useToast } from "@/hooks/use-toast";

interface DisputeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reviewId: string;
  reviewType: "practitioner" | "facility";
}

export function DisputeDialog({ open, onOpenChange, reviewId, reviewType }: DisputeDialogProps) {
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const createDispute = useCreateReviewDispute();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;
    try {
      await createDispute.mutateAsync({
        review_id: reviewId,
        review_type: reviewType,
        reason: reason.trim(),
        details: details.trim() || undefined,
      });
      toast({ title: "Contestation envoyée", description: "Notre équipe examinera votre demande." });
      onOpenChange(false);
      setReason("");
      setDetails("");
    } catch {
      toast({ variant: "destructive", title: "Erreur", description: "Impossible d'envoyer la contestation." });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Scale className="h-5 w-5 text-primary" />
            Contester cet avis
          </DialogTitle>
          <DialogDescription>
            Si cet avis vous semble injuste ou inexact, expliquez-nous pourquoi.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="dispute-reason">Motif *</Label>
            <Input
              id="dispute-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ex : Informations inexactes, faits erronés..."
              maxLength={200}
              required
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="dispute-details">Détails</Label>
            <Textarea
              id="dispute-details"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Expliquez précisément pourquoi cet avis pose problème..."
              rows={4}
              maxLength={1000}
              className="mt-1.5"
            />
          </div>
          <Button type="submit" className="w-full" disabled={!reason.trim() || createDispute.isPending}>
            {createDispute.isPending ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Envoi...</>
            ) : (
              "Envoyer la contestation"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
