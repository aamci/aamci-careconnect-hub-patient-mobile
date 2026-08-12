import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  Video,
  MapPin,
  ChevronRight,
  Activity,
  FileText,
  Pill,
  Download,
  Sparkles,
  Share2,
  LineChart as LineChartIcon,
  Stethoscope,
  Route,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { PageContainer } from "@/components/layout/PageContainer";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { Header } from "@/components/layout/Header";
import { Card } from "@/components/common/Card";
import { Badge } from "@/components/common/Badge";
import { Avatar } from "@/components/common/Avatar";
import { EmptyState } from "@/components/common/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useAppointments } from "@/hooks/useAppointments";
import { useDocuments } from "@/hooks/useDocuments";
import { useConsultationReports } from "@/hooks/useConsultationReports";
import { useHealthMetrics, metricLabel } from "@/hooks/useHealthMetrics";
import { format, isPast, subMonths, startOfMonth } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";

type TabType = "parcours" | "consultations" | "reports" | "prescriptions" | "stats";

const TABS: { key: TabType; label: string }[] = [
  { key: "parcours", label: "Parcours" },
  { key: "consultations", label: "Consultations" },
  { key: "reports", label: "Comptes rendus" },
  { key: "prescriptions", label: "Ordonnances" },
  { key: "stats", label: "Stats" },
];

export default function HistoryPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>("parcours");
  const [selectedPeriod, setSelectedPeriod] = useState<number>(6);

  const { data: appointments, isLoading: appointmentsLoading } = useAppointments();
  const { data: documents, isLoading: documentsLoading } = useDocuments();
  const { data: reports, isLoading: reportsLoading } = useConsultationReports();
  const { data: metrics } = useHealthMetrics();

  const isLoading = appointmentsLoading || documentsLoading || reportsLoading;
  const periodStart = useMemo(() => subMonths(new Date(), selectedPeriod), [selectedPeriod]);

  const pastAppointments = (appointments ?? []).filter(
    (apt) => isPast(new Date(apt.scheduled_at)) && apt.status === "completed"
  );
  const filteredAppointments = pastAppointments.filter(
    (apt) => new Date(apt.scheduled_at) >= periodStart
  );
  const filteredReports = (reports ?? []).filter((r) => new Date(r.created_at) >= periodStart);
  const prescriptions = (documents ?? []).filter((doc) => doc.type === "prescription");
  const filteredPrescriptions = prescriptions.filter(
    (doc) => new Date(doc.created_at) >= periodStart
  );
  const filteredDocuments = (documents ?? []).filter(
    (doc) => new Date(doc.created_at) >= periodStart
  );

  const stats = {
    totalConsultations: filteredAppointments.length,
    teleconsultations: filteredAppointments.filter((a) => a.type === "teleconsultation").length,
    inPerson: filteredAppointments.filter((a) => a.type === "in_person").length,
    prescriptions: filteredPrescriptions.length,
    reports: filteredReports.length,
    documents: filteredDocuments.length,
    uniquePractitioners: new Set(filteredAppointments.map((a) => a.practitioner_id)).size,
    measures: (metrics ?? []).filter((m) => new Date(m.measured_at) >= periodStart).length,
  };

  // Monthly activity chart
  const monthlyData = useMemo(() => {
    const buckets: { key: string; label: string; consultations: number; documents: number }[] = [];
    for (let i = selectedPeriod - 1; i >= 0; i--) {
      const d = startOfMonth(subMonths(new Date(), i));
      buckets.push({
        key: format(d, "yyyy-MM"),
        label: format(d, "MMM", { locale: fr }),
        consultations: 0,
        documents: 0,
      });
    }
    const index = new Map(buckets.map((b) => [b.key, b]));
    filteredAppointments.forEach((a) => {
      const b = index.get(format(new Date(a.scheduled_at), "yyyy-MM"));
      if (b) b.consultations += 1;
    });
    filteredDocuments.forEach((doc) => {
      const b = index.get(format(new Date(doc.created_at), "yyyy-MM"));
      if (b) b.documents += 1;
    });
    return buckets;
  }, [filteredAppointments, filteredDocuments, selectedPeriod]);

  // Specialty distribution
  const specialtyStats = useMemo(() => {
    const map = new Map<string, number>();
    filteredAppointments.forEach((a) => {
      const name = a.practitioner?.specialty?.name ?? "Autre";
      map.set(name, (map.get(name) ?? 0) + 1);
    });
    return [...map.entries()].sort((a, b) => b[1] - a[1]);
  }, [filteredAppointments]);

  // Unified care-journey timeline
  type TimelineItem = {
    id: string;
    date: Date;
    kind: "consultation" | "report" | "document" | "metric";
    title: string;
    subtitle: string;
    onClick?: () => void;
  };

  const timeline: TimelineItem[] = useMemo(() => {
    const items: TimelineItem[] = [];

    filteredAppointments.forEach((a) =>
      items.push({
        id: `apt-${a.id}`,
        date: new Date(a.scheduled_at),
        kind: "consultation",
        title: `Consultation • Dr ${a.practitioner?.first_name ?? ""} ${a.practitioner?.last_name ?? ""}`.trim(),
        subtitle: a.practitioner?.specialty?.name ?? a.reason,
        onClick: () => navigate(`/appointments/${a.id}`),
      })
    );

    filteredReports.forEach((r) =>
      items.push({
        id: `rep-${r.id}`,
        date: new Date(r.created_at),
        kind: "report",
        title: r.title,
        subtitle: r.practitioner
          ? `Dr ${r.practitioner.first_name} ${r.practitioner.last_name}`
          : "Compte rendu",
        onClick: () => navigate(`/reports/${r.id}`),
      })
    );

    filteredDocuments.forEach((d) =>
      items.push({
        id: `doc-${d.id}`,
        date: new Date(d.created_at),
        kind: "document",
        title: d.name,
        subtitle: d.type === "prescription" ? "Ordonnance" : "Document médical",
        onClick: () => navigate("/documents"),
      })
    );

    (metrics ?? [])
      .filter((m) => new Date(m.measured_at) >= periodStart)
      .forEach((m) =>
        items.push({
          id: `met-${m.id}`,
          date: new Date(m.measured_at),
          kind: "metric",
          title: `${metricLabel(m.metric_type)} : ${m.secondary_value ? `${m.value}/${m.secondary_value}` : m.value} ${m.unit}`,
          subtitle: "Mesure enregistrée",
          onClick: () => navigate("/health/metrics"),
        })
      );

    return items.sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [filteredAppointments, filteredReports, filteredDocuments, metrics, periodStart, navigate]);

  const kindStyle: Record<TimelineItem["kind"], { icon: typeof Calendar; color: string }> = {
    consultation: { icon: Stethoscope, color: "bg-primary/10 text-primary" },
    report: { icon: FileText, color: "bg-accent/10 text-accent" },
    document: { icon: Pill, color: "bg-muted text-muted-foreground" },
    metric: { icon: Activity, color: "bg-success/10 text-success" },
  };

  const groupedConsultations = filteredAppointments.reduce((acc, apt) => {
    const monthKey = format(new Date(apt.scheduled_at), "MMMM yyyy", { locale: fr });
    (acc[monthKey] ||= []).push(apt);
    return acc;
  }, {} as Record<string, typeof filteredAppointments>);

  const periods = [
    { value: 3, label: "3 mois" },
    { value: 6, label: "6 mois" },
    { value: 12, label: "1 an" },
  ];

  return (
    <>
      <PageContainer noPadding className="overflow-x-hidden">
        <Header title="Historique médical" showBack />

        <div className="px-4 pb-4 max-w-lg mx-auto">
          {/* Quick actions */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            <Button
              variant="outline"
              className="min-h-[44px] justify-start"
              onClick={() => navigate("/health/metrics")}
            >
              <LineChartIcon className="h-4 w-4 mr-2 text-primary" />
              Constantes
            </Button>
            <Button
              variant="outline"
              className="min-h-[44px] justify-start"
              onClick={() => navigate("/share")}
            >
              <Share2 className="h-4 w-4 mr-2 text-primary" />
              Partager
            </Button>
          </div>

          {/* Period Filter */}
          <div className="flex gap-2 mb-4 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
            {periods.map((period) => (
              <button
                key={period.value}
                onClick={() => setSelectedPeriod(period.value)}
                className={cn(
                  "px-4 rounded-full text-sm font-medium whitespace-nowrap transition-all min-h-[40px]",
                  selectedPeriod === period.value
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {period.label}
              </button>
            ))}
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mb-4 overflow-x-auto -mx-4 px-4 pb-1 scrollbar-hide">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  "px-3 rounded-xl text-sm font-medium whitespace-nowrap transition-all min-h-[40px]",
                  activeTab === tab.key
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-24 w-full rounded-xl" />
              ))}
            </div>
          ) : activeTab === "parcours" ? (
            timeline.length === 0 ? (
              <EmptyState
                icon={Route}
                title="Parcours vide"
                description="Vos consultations, comptes rendus, documents et mesures apparaîtront ici"
              />
            ) : (
              <div className="relative pl-6">
                <div className="absolute left-[11px] top-2 bottom-2 w-px bg-border" />
                <div className="space-y-3">
                  {timeline.map((item) => {
                    const { icon: Icon, color } = kindStyle[item.kind];
                    return (
                      <div key={item.id} className="relative">
                        <div
                          className={cn(
                            "absolute -left-6 top-3 w-6 h-6 rounded-full flex items-center justify-center ring-4 ring-background",
                            color
                          )}
                        >
                          <Icon className="h-3.5 w-3.5" />
                        </div>
                        <Card hover className="p-3" onClick={item.onClick}>
                          <div className="flex items-center gap-2">
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium truncate">{item.title}</p>
                              <p className="text-xs text-muted-foreground truncate">
                                {item.subtitle}
                              </p>
                              <p className="text-[11px] text-muted-foreground mt-1">
                                {format(item.date, "d MMM yyyy • HH:mm", { locale: fr })}
                              </p>
                            </div>
                            <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                          </div>
                        </Card>
                      </div>
                    );
                  })}
                </div>
              </div>
            )
          ) : activeTab === "consultations" ? (
            filteredAppointments.length === 0 ? (
              <EmptyState
                icon={Calendar}
                title="Aucune consultation"
                description="Votre historique de consultations apparaîtra ici"
              />
            ) : (
              <div className="space-y-6">
                {Object.entries(groupedConsultations).map(([month, apts]) => (
                  <div key={month}>
                    <h3 className="text-sm font-medium text-muted-foreground mb-3 capitalize">
                      {month}
                    </h3>
                    <div className="space-y-3">
                      {apts.map((apt) => {
                        const report = (reports ?? []).find((r) => r.appointment_id === apt.id);
                        return (
                          <Card
                            key={apt.id}
                            hover
                            className="p-3 sm:p-4"
                            onClick={() => navigate(`/appointments/${apt.id}`)}
                          >
                            <div className="flex gap-3">
                              <Avatar
                                src={apt.practitioner?.avatar_url || undefined}
                                alt={`${apt.practitioner?.first_name} ${apt.practitioner?.last_name}`}
                                size="md"
                                className="shrink-0"
                              />
                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-sm truncate">
                                  Dr. {apt.practitioner?.first_name} {apt.practitioner?.last_name}
                                </h4>
                                <p className="text-xs text-muted-foreground truncate">
                                  {apt.practitioner?.specialty?.name}
                                </p>
                                <div className="flex flex-wrap items-center gap-2 mt-2">
                                  <Badge
                                    variant="muted"
                                    icon={
                                      apt.type === "teleconsultation" ? (
                                        <Video className="h-3 w-3" />
                                      ) : (
                                        <MapPin className="h-3 w-3" />
                                      )
                                    }
                                    className="text-[10px]"
                                  >
                                    {apt.type === "teleconsultation" ? "Téléconsultation" : "Cabinet"}
                                  </Badge>
                                  {report && (
                                    <Badge variant="info" className="text-[10px]">
                                      Compte rendu
                                    </Badge>
                                  )}
                                  <span className="text-xs text-muted-foreground">
                                    {format(new Date(apt.scheduled_at), "d MMM HH:mm", { locale: fr })}
                                  </span>
                                </div>
                              </div>
                              <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0 self-center" />
                            </div>
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : activeTab === "reports" ? (
            filteredReports.length === 0 ? (
              <EmptyState
                icon={FileText}
                title="Aucun compte rendu"
                description="Après chaque consultation, votre compte rendu sera disponible ici"
              />
            ) : (
              <div className="space-y-3">
                {filteredReports.map((r) => (
                  <Card key={r.id} hover className="p-3" onClick={() => navigate(`/reports/${r.id}`)}>
                    <div className="flex gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-sm truncate">{r.title}</h4>
                          {!r.is_read && (
                            <span className="w-2 h-2 rounded-full bg-accent shrink-0" aria-label="Non lu" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                          {r.summary}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          {r.source === "ai_generated" && (
                            <Badge
                              variant="info"
                              icon={<Sparkles className="h-3 w-3" />}
                              className="text-[10px]"
                            >
                              Synthèse
                            </Badge>
                          )}
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(r.created_at), "d MMM yyyy", { locale: fr })}
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0 self-center" />
                    </div>
                  </Card>
                ))}
              </div>
            )
          ) : activeTab === "prescriptions" ? (
            filteredPrescriptions.length === 0 ? (
              <EmptyState
                icon={Pill}
                title="Aucune ordonnance"
                description="Vos ordonnances apparaîtront ici"
              />
            ) : (
              <div className="space-y-3">
                {filteredPrescriptions.map((doc) => (
                  <Card key={doc.id} className="p-3 sm:p-4">
                    <div className="flex gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                        <Pill className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm truncate">{doc.name}</h4>
                        <p className="text-xs text-muted-foreground truncate">
                          {doc.practitioner && `Dr. ${doc.practitioner.last_name} • `}
                          {format(new Date(doc.created_at), "d MMM yyyy", { locale: fr })}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Télécharger l'ordonnance"
                        className="h-11 w-11 shrink-0"
                        onClick={() => window.open(doc.file_url, "_blank")}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )
          ) : (
            <div className="space-y-4">
              <Card className="p-4">
                <h3 className="font-semibold mb-4">Résumé des {selectedPeriod} derniers mois</h3>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: stats.totalConsultations, label: "Consultations" },
                    { value: stats.reports, label: "Comptes rendus" },
                    { value: stats.prescriptions, label: "Ordonnances" },
                    { value: stats.uniquePractitioners, label: "Praticiens" },
                    { value: stats.documents, label: "Documents" },
                    { value: stats.measures, label: "Mesures santé" },
                  ].map((s) => (
                    <div key={s.label} className="p-3 bg-muted/50 rounded-xl text-center">
                      <p className="text-2xl font-bold text-primary">{s.value}</p>
                      <p className="text-xs text-muted-foreground">{s.label}</p>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Activity className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Activité mensuelle</h3>
                    <p className="text-xs text-muted-foreground">Consultations et documents</p>
                  </div>
                </div>
                <div className="h-44 -ml-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="label" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                      <YAxis allowDecimals={false} tick={{ fontSize: 10 }} width={28} stroke="hsl(var(--muted-foreground))" />
                      <Tooltip
                        contentStyle={{
                          background: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: 12,
                          fontSize: 12,
                        }}
                      />
                      <Bar dataKey="consultations" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="documents" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              <Card className="p-4">
                <h3 className="font-semibold mb-3">Répartition par spécialité</h3>
                {specialtyStats.length === 0 ? (
                  <p className="text-xs text-muted-foreground">Pas encore de données.</p>
                ) : (
                  <div className="space-y-3">
                    {specialtyStats.map(([name, count]) => (
                      <div key={name}>
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="truncate">{name}</span>
                          <span className="font-medium">{count}</span>
                        </div>
                        <div className="h-2 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full"
                            style={{
                              width: `${(count / stats.totalConsultations) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              <Card className="p-4">
                <h3 className="font-semibold mb-3">Modes de consultation</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Video className="h-4 w-4 text-primary" />
                      <span className="text-sm">Téléconsultations</span>
                    </div>
                    <span className="font-medium">{stats.teleconsultations}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-primary" />
                      <span className="text-sm">Consultations en cabinet</span>
                    </div>
                    <span className="font-medium">{stats.inPerson}</span>
                  </div>
                </div>
              </Card>

              <Button
                variant="outline"
                className="w-full min-h-[44px]"
                onClick={() => navigate("/documents")}
              >
                <FileText className="h-4 w-4 mr-2" />
                Voir tous mes documents
              </Button>
            </div>
          )}
        </div>
      </PageContainer>
      <BottomNavigation />
    </>
  );
}
