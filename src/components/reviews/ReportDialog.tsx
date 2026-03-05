import { useState } from "react";
import { Flag, Loader2 } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useCreateReport } from "@/hooks/useReviews";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const reasons = [
  { value: "inappropriate" as const, label: "Contenu inapproprié" },
  { value: "spam" as const, label: "Spam" },
  { value: "harassment" as const, label: "Harcèlement" },
  { value: "misinformation" as const, label: "Informations erronées" },
  { value: "technical_issue" as const, label: "Problème technique" },
  { value: "other" as const, label: "Autre" },
];

interface ReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  targetType: "practitioner" | "review" | "facility" | "technical";
  targetId?: string;
}

export function ReportDialog({ open, onOpenChange, targetType, targetId }: ReportDialogProps) {
  const [reason, setReason] = useState<typeof reasons[number]["value"] | null>(null);
  const [description, setDescription] = useState("");
  const createReport = useCreateReport();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason) return;
    try {
      await createReport.mutateAsync({
        target_type: targetType,
        target_id: targetId,
        reason,
        description: description.trim() || undefined,
      });
      toast({ title: "Signalement envoyé", description: "Nous examinerons votre signalement." });
      onOpenChange(false);
      setReason(null);
      setDescription("");
    } catch {
      toast({ variant: "destructive", title: "Erreur", description: "Impossible d'envoyer le signalement." });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Flag className="h-5 w-5 text-destructive" />
            Signaler
          </DialogTitle>
          <DialogDescription>
            Indiquez la raison de votre signalement. Notre équipe l'examinera rapidement.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            {reasons.map((r) => (
              <button
                key={r.value}
                type="button"
                onClick={() => setReason(r.value)}
                className={cn(
                  "p-3 rounded-xl border-2 text-sm font-medium transition-all text-left",
                  reason === r.value
                    ? "border-destructive bg-destructive/5 text-destructive"
                    : "border-border hover:border-destructive/30"
                )}
              >
                {r.label}
              </button>
            ))}
          </div>

          <div>
            <Label htmlFor="report-desc">Détails (optionnel)</Label>
            <Textarea
              id="report-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Décrivez le problème..."
              rows={3}
              maxLength={500}
              className="mt-1.5"
            />
          </div>

          <Button
            type="submit"
            variant="destructive"
            className="w-full"
            disabled={!reason || createReport.isPending}
          >
            {createReport.isPending ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Envoi...</>
            ) : (
              "Envoyer le signalement"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
