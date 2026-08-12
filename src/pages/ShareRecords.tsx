import { useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Share2, ShieldCheck, X, Search, Plus } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { Header } from "@/components/layout/Header";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { Card } from "@/components/common/Card";
import { Badge } from "@/components/common/Badge";
import { Avatar } from "@/components/common/Avatar";
import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { usePractitioners } from "@/hooks/usePractitioners";
import { usePatientProfiles } from "@/hooks/usePatientProfiles";
import {
  useRecordShares,
  useCreateRecordShare,
  useRevokeRecordShare,
  isShareActive,
} from "@/hooks/useRecordShares";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const DURATIONS = [
  { days: 7, label: "7 jours" },
  { days: 30, label: "30 jours" },
  { days: 90, label: "3 mois" },
];

export default function ShareRecordsPage() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [practitionerId, setPractitionerId] = useState<string | null>(null);
  const [duration, setDuration] = useState(30);
  const [scopes, setScopes] = useState({
    share_reports: true,
    share_documents: true,
    share_metrics: true,
    share_health_form: false,
  });

  const { data: shares, isLoading } = useRecordShares();
  const { data: practitioners } = usePractitioners();
  const { data: profiles } = usePatientProfiles();
  const createShare = useCreateRecordShare();
  const revokeShare = useRevokeRecordShare();

  const filtered = (practitioners ?? []).filter((p) =>
    `${p.first_name} ${p.last_name} ${p.specialty?.name ?? ""}`
      .toLowerCase()
      .includes(query.toLowerCase())
  );

  const handleCreate = async () => {
    const profileId = profiles?.[0]?.id;
    if (!practitionerId || !profileId) {
      toast.error("Sélectionnez un praticien");
      return;
    }
    try {
      await createShare.mutateAsync({
        patient_profile_id: profileId,
        practitioner_id: practitionerId,
        duration_days: duration,
        ...scopes,
      });
      setOpen(false);
      setPractitionerId(null);
      setQuery("");
      toast.success("Accès partagé");
    } catch {
      toast.error("Partage impossible");
    }
  };

  const scopeLabels: Record<keyof typeof scopes, string> = {
    share_reports: "Comptes rendus de consultation",
    share_documents: "Documents médicaux",
    share_metrics: "Constantes et évolution",
    share_health_form: "Formulaire de santé",
  };

  return (
    <>
      <PageContainer noPadding className="overflow-x-hidden">
        <Header title="Partage du dossier" showBack />

        <div className="px-4 pb-6 max-w-lg mx-auto space-y-4">
          <Card className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <ShieldCheck className="h-5 w-5 text-primary" />
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Vous décidez de ce que vous partagez, avec qui et pour combien de temps. Chaque accès
                est limité dans le temps et révocable à tout moment.
              </p>
            </div>
          </Card>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="w-full min-h-[48px]">
                <Plus className="h-4 w-4 mr-2" />
                Partager avec un praticien
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[92vw] sm:max-w-md rounded-2xl max-h-[85dvh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Nouveau partage</DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="prac-search">Praticien</Label>
                  <div className="relative mt-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="prac-search"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Rechercher..."
                      className="pl-9 min-h-[44px]"
                    />
                  </div>
                  <div className="mt-2 max-h-44 overflow-y-auto space-y-1">
                    {filtered.slice(0, 20).map((p) => (
                      <button
                        key={p.id}
                        onClick={() => setPractitionerId(p.id)}
                        className={cn(
                          "w-full flex items-center gap-3 p-2 rounded-xl text-left min-h-[52px] transition-colors",
                          practitionerId === p.id ? "bg-primary/10" : "hover:bg-muted"
                        )}
                      >
                        <Avatar src={p.avatar_url || undefined} alt={p.last_name} size="sm" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">
                            Dr {p.first_name} {p.last_name}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {p.specialty?.name}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Contenus partagés</Label>
                  <div className="mt-2 space-y-2">
                    {(Object.keys(scopes) as (keyof typeof scopes)[]).map((key) => (
                      <div
                        key={key}
                        className="flex items-center justify-between gap-3 min-h-[44px]"
                      >
                        <span className="text-sm">{scopeLabels[key]}</span>
                        <Switch
                          checked={scopes[key]}
                          onCheckedChange={(v) => setScopes((s) => ({ ...s, [key]: v }))}
                          aria-label={scopeLabels[key]}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Durée d'accès</Label>
                  <div className="flex gap-2 mt-2">
                    {DURATIONS.map((d) => (
                      <button
                        key={d.days}
                        onClick={() => setDuration(d.days)}
                        className={cn(
                          "flex-1 rounded-xl text-sm font-medium min-h-[44px] transition-colors",
                          duration === d.days
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                        )}
                      >
                        {d.label}
                      </button>
                    ))}
                  </div>
                </div>

                <Button
                  className="w-full min-h-[48px]"
                  onClick={handleCreate}
                  disabled={createShare.isPending || !practitionerId}
                >
                  Confirmer le partage
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Accès en cours</h3>
            {isLoading ? (
              <Skeleton className="h-24 w-full rounded-xl" />
            ) : !shares?.length ? (
              <EmptyState
                icon={Share2}
                title="Aucun partage"
                description="Vous n'avez partagé votre dossier avec aucun praticien"
              />
            ) : (
              shares.map((share) => {
                const active = isShareActive(share);
                return (
                  <Card key={share.id} className="p-3">
                    <div className="flex items-start gap-3">
                      <Avatar
                        src={share.practitioner?.avatar_url || undefined}
                        alt={share.practitioner?.last_name ?? "Praticien"}
                        size="sm"
                        className="shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          Dr {share.practitioner?.first_name} {share.practitioner?.last_name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {active
                            ? `Expire le ${format(new Date(share.expires_at), "d MMM yyyy", { locale: fr })}`
                            : share.revoked_at
                            ? "Révoqué"
                            : "Expiré"}
                        </p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {share.share_reports && (
                            <Badge variant="muted" className="text-[10px]">Comptes rendus</Badge>
                          )}
                          {share.share_documents && (
                            <Badge variant="muted" className="text-[10px]">Documents</Badge>
                          )}
                          {share.share_metrics && (
                            <Badge variant="muted" className="text-[10px]">Constantes</Badge>
                          )}
                          {share.share_health_form && (
                            <Badge variant="muted" className="text-[10px]">Formulaire santé</Badge>
                          )}
                        </div>
                      </div>
                      {active && (
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="Révoquer l'accès"
                          className="h-11 w-11 shrink-0"
                          onClick={() => {
                            revokeShare.mutate(share.id);
                            toast.success("Accès révoqué");
                          }}
                        >
                          <X className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                  </Card>
                );
              })
            )}
          </div>
        </div>
      </PageContainer>
      <BottomNavigation />
    </>
  );
}
