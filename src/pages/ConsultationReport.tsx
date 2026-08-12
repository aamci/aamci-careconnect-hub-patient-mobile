import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  FileText,
  Stethoscope,
  ClipboardList,
  Pill,
  CalendarClock,
  AlertTriangle,
  Share2,
  Download,
  Sparkles,
} from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { Header } from "@/components/layout/Header";
import { Card } from "@/components/common/Card";
import { Badge } from "@/components/common/Badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AudioPlayer } from "@/components/audio/AudioPlayer";
import { useConsultationReport, useMarkReportRead } from "@/hooks/useConsultationReports";
import { toast } from "sonner";

const sections = [
  { key: "reason", label: "Motif de consultation", icon: ClipboardList },
  { key: "symptoms", label: "Symptômes rapportés", icon: AlertTriangle },
  { key: "observations", label: "Observations", icon: Stethoscope },
  { key: "treatment", label: "Traitement / conduite à tenir", icon: Pill },
  { key: "recommendations", label: "Recommandations", icon: FileText },
  { key: "follow_up", label: "Suivi", icon: CalendarClock },
] as const;

export default function ConsultationReportPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: report, isLoading } = useConsultationReport(id);
  const markRead = useMarkReportRead();

  useEffect(() => {
    if (report && !report.is_read) markRead.mutate(report.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [report?.id]);

  const fullText = report
    ? [
        report.title,
        report.summary,
        ...sections.map((s) => {
          const value = report[s.key];
          return value ? `${s.label}. ${value}` : "";
        }),
      ]
        .filter(Boolean)
        .join(". ")
    : "";

  const handleExport = () => {
    if (!report) return;
    const lines = [
      report.title,
      report.practitioner
        ? `Praticien : Dr ${report.practitioner.first_name} ${report.practitioner.last_name}`
        : "",
      `Date : ${format(new Date(report.created_at), "d MMMM yyyy 'à' HH:mm", { locale: fr })}`,
      "",
      "RÉSUMÉ",
      report.summary,
      "",
      ...sections.flatMap((s) => (report[s.key] ? [s.label.toUpperCase(), report[s.key] as string, ""] : [])),
      "Ce compte rendu est un récapitulatif informatif et ne remplace pas le document officiel de votre praticien.",
    ].filter((l) => l !== undefined);

    const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `compte-rendu-${format(new Date(report.created_at), "yyyy-MM-dd")}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Compte rendu téléchargé");
  };

  return (
    <PageContainer noPadding className="overflow-x-hidden">
      <Header title="Compte rendu" showBack />

      <div className="px-4 pb-6 max-w-lg mx-auto space-y-4">
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-24 w-full rounded-xl" />
            <Skeleton className="h-40 w-full rounded-xl" />
          </div>
        ) : !report ? (
          <Card className="p-6 text-center">
            <p className="text-sm text-muted-foreground">Ce compte rendu est introuvable.</p>
          </Card>
        ) : (
          <>
            <Card className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="font-semibold leading-tight">{report.title}</h2>
                  <p className="text-xs text-muted-foreground mt-1">
                    {report.practitioner
                      ? `Dr ${report.practitioner.first_name} ${report.practitioner.last_name}`
                      : "Praticien non renseigné"}
                    {report.practitioner?.specialty?.name && ` • ${report.practitioner.specialty.name}`}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <Badge variant="muted" className="text-[10px]">
                      {format(new Date(report.created_at), "d MMM yyyy", { locale: fr })}
                    </Badge>
                    {report.source === "ai_generated" && (
                      <Badge variant="info" icon={<Sparkles className="h-3 w-3" />} className="text-[10px]">
                        Synthèse assistée
                      </Badge>
                    )}
                    {report.source === "patient_note" && (
                      <Badge variant="muted" className="text-[10px]">Note personnelle</Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-3">
                <AudioPlayer text={fullText} label="Écouter le compte rendu" />
              </div>
            </Card>

            <Card className="p-4">
              <h3 className="text-sm font-semibold mb-2">Résumé</h3>
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {report.summary}
              </p>
            </Card>

            {sections.map((s) => {
              const value = report[s.key] as string | null;
              if (!value) return null;
              const Icon = s.icon;
              return (
                <Card key={s.key} className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className="h-4 w-4 text-primary shrink-0" />
                    <h3 className="text-sm font-semibold">{s.label}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {value}
                  </p>
                </Card>
              );
            })}

            <Card className="p-3 border-warning/30 bg-warning/5">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-warning shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground">
                  Ce compte rendu est un récapitulatif informatif de votre échange. Il ne remplace pas le
                  document officiel remis par votre praticien ni un avis médical.
                </p>
              </div>
            </Card>

            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" className="min-h-[44px]" onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" />
                Exporter
              </Button>
              <Button variant="outline" className="min-h-[44px]" onClick={() => navigate("/share")}>
                <Share2 className="h-4 w-4 mr-2" />
                Partager
              </Button>
            </div>

            {report.appointment_id && (
              <Button
                variant="ghost"
                className="w-full min-h-[44px]"
                onClick={() => navigate(`/appointments/${report.appointment_id}`)}
              >
                Voir le rendez-vous associé
              </Button>
            )}
          </>
        )}
      </div>
    </PageContainer>
  );
}
