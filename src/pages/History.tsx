import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Calendar,
  Clock,
  Video,
  MapPin,
  ChevronRight,
  Activity,
  TrendingUp,
  FileText,
  Pill,
  Filter,
  Download
} from "lucide-react";
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
import { format, isPast, startOfMonth, endOfMonth, isWithinInterval, subMonths } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import type { Database } from "@/integrations/supabase/types";

type TabType = "consultations" | "prescriptions" | "stats";

export default function HistoryPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>("consultations");
  const [selectedPeriod, setSelectedPeriod] = useState<number>(3); // months
  
  const { data: appointments, isLoading: appointmentsLoading } = useAppointments();
  const { data: documents, isLoading: documentsLoading } = useDocuments();

  const isLoading = appointmentsLoading || documentsLoading;

  // Filter past appointments
  const pastAppointments = appointments?.filter(apt => 
    isPast(new Date(apt.scheduled_at)) && apt.status === 'completed'
  ) || [];

  // Filter by period
  const periodStart = subMonths(new Date(), selectedPeriod);
  const filteredAppointments = pastAppointments.filter(apt =>
    new Date(apt.scheduled_at) >= periodStart
  );

  // Get prescriptions
  const prescriptions = documents?.filter(doc => doc.type === 'prescription') || [];
  const filteredPrescriptions = prescriptions.filter(doc =>
    new Date(doc.created_at) >= periodStart
  );

  // Stats
  const stats = {
    totalConsultations: filteredAppointments.length,
    teleconsultations: filteredAppointments.filter(a => a.type === 'teleconsultation').length,
    inPerson: filteredAppointments.filter(a => a.type === 'in_person').length,
    prescriptions: filteredPrescriptions.length,
    uniquePractitioners: new Set(filteredAppointments.map(a => a.practitioner_id)).size,
  };

  // Group consultations by month
  const groupedConsultations = filteredAppointments.reduce((acc, apt) => {
    const monthKey = format(new Date(apt.scheduled_at), "MMMM yyyy", { locale: fr });
    if (!acc[monthKey]) {
      acc[monthKey] = [];
    }
    acc[monthKey].push(apt);
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
          {/* Period Filter */}
          <div className="flex gap-2 mb-4 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
            {periods.map((period) => (
              <button
                key={period.value}
                onClick={() => setSelectedPeriod(period.value)}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all min-h-[36px]",
                  selectedPeriod === period.value
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                )}
              >
                {period.label}
              </button>
            ))}
          </div>

          {/* Tabs */}
          <div className="flex gap-1 p-1 bg-muted rounded-xl mb-4">
            <button
              onClick={() => setActiveTab("consultations")}
              className={cn(
                "flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all min-h-[40px]",
                activeTab === "consultations"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground"
              )}
            >
              Consultations
            </button>
            <button
              onClick={() => setActiveTab("prescriptions")}
              className={cn(
                "flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all min-h-[40px]",
                activeTab === "prescriptions"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground"
              )}
            >
              Ordonnances
            </button>
            <button
              onClick={() => setActiveTab("stats")}
              className={cn(
                "flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all min-h-[40px]",
                activeTab === "stats"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground"
              )}
            >
              Stats
            </button>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-24 w-full rounded-xl" />
              ))}
            </div>
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
                      {apts.map((apt) => (
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
                              <div className="flex items-center gap-2 mt-2">
                                <Badge 
                                  variant="muted" 
                                  icon={apt.type === 'teleconsultation' ? <Video className="h-3 w-3" /> : <MapPin className="h-3 w-3" />}
                                  className="text-[10px]"
                                >
                                  {apt.type === 'teleconsultation' ? 'Téléconsultation' : 'Cabinet'}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  {format(new Date(apt.scheduled_at), "d MMM HH:mm", { locale: fr })}
                                </span>
                              </div>
                            </div>
                            <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0 self-center" />
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
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
                        size="icon-sm"
                        onClick={() => window.open(doc.file_url, '_blank')}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )
          ) : (
            // Stats tab
            <div className="space-y-4">
              <Card className="p-4">
                <h3 className="font-semibold mb-4">Résumé des {selectedPeriod} derniers mois</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-muted/50 rounded-xl text-center">
                    <p className="text-2xl font-bold text-primary">{stats.totalConsultations}</p>
                    <p className="text-xs text-muted-foreground">Consultations</p>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-xl text-center">
                    <p className="text-2xl font-bold text-primary">{stats.prescriptions}</p>
                    <p className="text-xs text-muted-foreground">Ordonnances</p>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-xl text-center">
                    <p className="text-2xl font-bold text-primary">{stats.teleconsultations}</p>
                    <p className="text-xs text-muted-foreground">Téléconsultations</p>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-xl text-center">
                    <p className="text-2xl font-bold text-primary">{stats.uniquePractitioners}</p>
                    <p className="text-xs text-muted-foreground">Praticiens</p>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Activity className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Activité médicale</h3>
                    <p className="text-xs text-muted-foreground">
                      Derniers {selectedPeriod} mois
                    </p>
                  </div>
                </div>
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
                className="w-full"
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
