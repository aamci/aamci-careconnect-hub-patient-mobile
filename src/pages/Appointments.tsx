import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Calendar, 
  Clock, 
  Video, 
  MapPin,
  ChevronRight,
  Plus
} from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/common/Card";
import { Avatar } from "@/components/common/Avatar";
import { Badge } from "@/components/common/Badge";
import { EmptyState } from "@/components/common/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { useAppointments } from "@/hooks/useAppointments";
import { format, isToday, isTomorrow, isPast } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import type { Database } from "@/integrations/supabase/types";

type TabType = "upcoming" | "past";
type AppointmentStatus = Database["public"]["Enums"]["appointment_status"];

const statusConfig: Record<AppointmentStatus, { label: string; variant: "default" | "success" | "warning" | "destructive" | "info" | "muted" }> = {
  scheduled: { label: "Planifié", variant: "info" },
  confirmed: { label: "Confirmé", variant: "success" },
  in_progress: { label: "En cours", variant: "warning" },
  completed: { label: "Terminé", variant: "muted" },
  cancelled: { label: "Annulé", variant: "destructive" },
  no_show: { label: "Absent", variant: "destructive" },
};

export default function AppointmentsPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>("upcoming");
  const { data: appointments, isLoading } = useAppointments();

  const upcomingAppointments = appointments?.filter(
    apt => !isPast(new Date(apt.scheduled_at)) && apt.status !== 'cancelled'
  ) || [];
  
  const pastAppointments = appointments?.filter(
    apt => isPast(new Date(apt.scheduled_at)) || apt.status === 'cancelled'
  ) || [];

  const displayedAppointments = activeTab === "upcoming" ? upcomingAppointments : pastAppointments;

  const formatAppointmentDate = (date: Date) => {
    if (isToday(date)) return "Aujourd'hui";
    if (isTomorrow(date)) return "Demain";
    return format(date, "EEE d MMM", { locale: fr });
  };

  const renderAppointmentCard = (appointment: NonNullable<typeof appointments>[number]) => {
    const status = statusConfig[appointment.status];
    const appointmentDate = new Date(appointment.scheduled_at);
    const isUpcoming = !isPast(appointmentDate);

    return (
      <Card 
        key={appointment.id} 
        hover
        className="p-3 sm:p-4"
        onClick={() => navigate(`/appointments/${appointment.id}`)}
      >
        <div className="flex gap-3">
          <Avatar
            src={appointment.practitioner?.avatar_url || undefined}
            alt={`${appointment.practitioner?.first_name} ${appointment.practitioner?.last_name}`}
            size="md"
            className="shrink-0"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-foreground text-sm sm:text-base truncate">
                  Dr. {appointment.practitioner?.first_name} {appointment.practitioner?.last_name}
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground truncate">
                  {appointment.practitioner?.specialty?.name}
                </p>
              </div>
              <Badge variant={status.variant} className="shrink-0 text-[10px] sm:text-xs">
                {status.label}
              </Badge>
            </div>
            
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-2 text-xs sm:text-sm">
              <span className={cn(
                "flex items-center gap-1 font-medium truncate",
                isUpcoming ? "text-primary" : "text-muted-foreground"
              )}>
                <Calendar className="h-3.5 w-3.5" />
                {formatAppointmentDate(appointmentDate)}
              </span>
              <span className="flex items-center gap-1 text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />
                {format(appointmentDate, "HH:mm")}
              </span>
            </div>

            <div className="flex items-center gap-2 mt-2">
              {appointment.type === 'teleconsultation' ? (
                <Badge variant="info" icon={<Video className="h-3 w-3" />} className="text-[10px] sm:text-xs">
                  Téléconsultation
                </Badge>
              ) : (
                <Badge variant="muted" icon={<MapPin className="h-3 w-3" />} className="text-[10px] sm:text-xs">
                  En cabinet
                </Badge>
              )}
            </div>

            <p className="text-xs sm:text-sm text-muted-foreground mt-2 line-clamp-1">
              {appointment.reason}
            </p>
          </div>
          <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground shrink-0 self-center" />
        </div>
      </Card>
    );
  };

  return (
    <>
      <PageContainer noPadding className="overflow-x-hidden">
        <Header 
          title="Mes rendez-vous" 
          rightElement={
            <Button
              variant="soft"
              size="icon-sm"
              onClick={() => navigate("/search")}
            >
              <Plus className="h-5 w-5" />
            </Button>
          }
        />
        
        <div className="px-4 pb-4 max-w-lg mx-auto">
          {/* Tabs */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setActiveTab("upcoming")}
              className={cn(
                "flex-1 py-2.5 px-3 sm:px-4 rounded-xl text-xs sm:text-sm font-medium transition-all min-h-[44px]",
                activeTab === "upcoming"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              )}
            >
              À venir ({upcomingAppointments.length})
            </button>
            <button
              onClick={() => setActiveTab("past")}
              className={cn(
                "flex-1 py-2.5 px-3 sm:px-4 rounded-xl text-xs sm:text-sm font-medium transition-all min-h-[44px]",
                activeTab === "past"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              )}
            >
              Passés ({pastAppointments.length})
            </button>
          </div>

          {/* Appointments List */}
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="p-3 sm:p-4">
                  <div className="flex gap-3">
                    <Skeleton className="w-10 h-10 rounded-full shrink-0" />
                    <div className="flex-1">
                      <Skeleton className="h-5 w-32 mb-1" />
                      <Skeleton className="h-4 w-24 mb-2" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : displayedAppointments.length === 0 ? (
            <EmptyState
              icon={Calendar}
              title={activeTab === "upcoming" ? "Aucun rendez-vous à venir" : "Aucun rendez-vous passé"}
              description={
                activeTab === "upcoming" 
                  ? "Prenez rendez-vous avec un praticien dès maintenant" 
                  : "Vos rendez-vous passés apparaîtront ici"
              }
              action={activeTab === "upcoming" ? {
                label: "Prendre rendez-vous",
                onClick: () => navigate("/search"),
              } : undefined}
            />
          ) : (
            <div className="space-y-3">
              {displayedAppointments.map(renderAppointmentCard)}
            </div>
          )}
        </div>
      </PageContainer>
      <BottomNavigation />
    </>
  );
}
