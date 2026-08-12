import { useState, useMemo } from "react";
import { Plus, TrendingUp, Trash2, Activity } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { PageContainer } from "@/components/layout/PageContainer";
import { Header } from "@/components/layout/Header";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { Card } from "@/components/common/Card";
import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  METRIC_TYPES,
  useHealthMetrics,
  useAddHealthMetric,
  useDeleteHealthMetric,
} from "@/hooks/useHealthMetrics";
import { usePatientProfiles } from "@/hooks/usePatientProfiles";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function HealthMetricsPage() {
  const [selected, setSelected] = useState<string>(METRIC_TYPES[0].key);
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [secondary, setSecondary] = useState("");
  const [note, setNote] = useState("");

  const config = METRIC_TYPES.find((m) => m.key === selected)!;
  const { data: metrics, isLoading } = useHealthMetrics(selected);
  const { data: profiles } = usePatientProfiles();
  const addMetric = useAddHealthMetric();
  const deleteMetric = useDeleteHealthMetric();

  const chartData = useMemo(
    () =>
      (metrics ?? []).map((m) => ({
        date: format(new Date(m.measured_at), "d MMM", { locale: fr }),
        value: Number(m.value),
        secondary: m.secondary_value != null ? Number(m.secondary_value) : undefined,
      })),
    [metrics]
  );

  const last = metrics?.length ? metrics[metrics.length - 1] : null;
  const previous = metrics && metrics.length > 1 ? metrics[metrics.length - 2] : null;
  const delta = last && previous ? Number(last.value) - Number(previous.value) : null;

  const handleAdd = async () => {
    const numeric = parseFloat(value.replace(",", "."));
    if (Number.isNaN(numeric) || numeric < config.min || numeric > config.max) {
      toast.error(`Valeur invalide (${config.min} – ${config.max} ${config.unit})`);
      return;
    }
    let sec: number | null = null;
    if (config.dual) {
      sec = parseFloat(secondary.replace(",", "."));
      if (Number.isNaN(sec)) {
        toast.error("Renseignez la valeur diastolique");
        return;
      }
    }
    const profileId = profiles?.[0]?.id;
    if (!profileId) {
      toast.error("Profil patient introuvable");
      return;
    }

    try {
      await addMetric.mutateAsync({
        patient_profile_id: profileId,
        metric_type: selected,
        value: numeric,
        secondary_value: sec,
        unit: config.unit,
        note: note || null,
      });
      setValue("");
      setSecondary("");
      setNote("");
      setOpen(false);
      toast.success("Mesure enregistrée");
    } catch {
      toast.error("Enregistrement impossible");
    }
  };

  return (
    <>
      <PageContainer noPadding className="overflow-x-hidden">
        <Header title="Mes constantes" showBack />

        <div className="px-4 pb-6 max-w-lg mx-auto space-y-4">
          {/* Metric selector */}
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
            {METRIC_TYPES.map((m) => (
              <button
                key={m.key}
                onClick={() => setSelected(m.key)}
                className={cn(
                  "px-4 rounded-full text-sm font-medium whitespace-nowrap transition-all min-h-[44px]",
                  selected === m.key
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {m.label}
              </button>
            ))}
          </div>

          {/* Latest value */}
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Dernière mesure</p>
                <p className="text-3xl font-bold text-primary">
                  {last
                    ? config.dual
                      ? `${last.value}/${last.secondary_value}`
                      : `${last.value}`
                    : "—"}
                  <span className="text-sm font-normal text-muted-foreground ml-1">
                    {config.unit}
                  </span>
                </p>
                {last && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {format(new Date(last.measured_at), "d MMMM yyyy", { locale: fr })}
                  </p>
                )}
              </div>
              {delta != null && (
                <div
                  className={cn(
                    "flex items-center gap-1 text-sm font-medium",
                    delta > 0 ? "text-warning" : delta < 0 ? "text-success" : "text-muted-foreground"
                  )}
                >
                  <TrendingUp className={cn("h-4 w-4", delta < 0 && "rotate-180")} />
                  {delta > 0 ? "+" : ""}
                  {delta.toFixed(1)}
                </div>
              )}
            </div>
          </Card>

          {/* Chart */}
          <Card className="p-4">
            <h3 className="text-sm font-semibold mb-3">Évolution</h3>
            {isLoading ? (
              <Skeleton className="h-48 w-full rounded-xl" />
            ) : chartData.length < 2 ? (
              <p className="text-xs text-muted-foreground py-8 text-center">
                Ajoutez au moins deux mesures pour visualiser votre courbe d'évolution.
              </p>
            ) : (
              <div className="h-48 -ml-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" width={36} />
                    <Tooltip
                      contentStyle={{
                        background: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: 12,
                        fontSize: 12,
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                    />
                    {config.dual && (
                      <Line
                        type="monotone"
                        dataKey="secondary"
                        stroke="hsl(var(--accent))"
                        strokeWidth={2}
                        dot={{ r: 3 }}
                      />
                    )}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </Card>

          {/* History list */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold">Historique</h3>
            {!isLoading && (metrics?.length ?? 0) === 0 ? (
              <EmptyState
                icon={Activity}
                title="Aucune mesure"
                description="Enregistrez vos constantes pour suivre votre évolution"
              />
            ) : (
              [...(metrics ?? [])].reverse().map((m) => (
                <Card key={m.id} className="p-3">
                  <div className="flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">
                        {config.dual ? `${m.value}/${m.secondary_value}` : m.value} {m.unit}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {format(new Date(m.measured_at), "d MMM yyyy 'à' HH:mm", { locale: fr })}
                        {m.note && ` • ${m.note}`}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Supprimer la mesure"
                      className="h-11 w-11 shrink-0"
                      onClick={() => deleteMetric.mutate(m.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </Card>
              ))
            )}
          </div>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="w-full min-h-[48px]">
                <Plus className="h-4 w-4 mr-2" />
                Ajouter une mesure
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[92vw] sm:max-w-md rounded-2xl">
              <DialogHeader>
                <DialogTitle>{config.label}</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="metric-value">
                    {config.dual ? `Systolique (${config.unit})` : `Valeur (${config.unit})`}
                  </Label>
                  <Input
                    id="metric-value"
                    inputMode="decimal"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    className="min-h-[44px]"
                  />
                </div>
                {config.dual && (
                  <div>
                    <Label htmlFor="metric-secondary">Diastolique ({config.unit})</Label>
                    <Input
                      id="metric-secondary"
                      inputMode="decimal"
                      value={secondary}
                      onChange={(e) => setSecondary(e.target.value)}
                      className="min-h-[44px]"
                    />
                  </div>
                )}
                <div>
                  <Label htmlFor="metric-note">Note (optionnel)</Label>
                  <Input
                    id="metric-note"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="min-h-[44px]"
                  />
                </div>
                <Button
                  className="w-full min-h-[48px]"
                  onClick={handleAdd}
                  disabled={addMetric.isPending}
                >
                  Enregistrer
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </PageContainer>
      <BottomNavigation />
    </>
  );
}
