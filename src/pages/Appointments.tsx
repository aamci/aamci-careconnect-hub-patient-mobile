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
import { appointments } from "@/data/mockData";
import { format, isToday, isTomorrow, isPast } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import type { Appointment, AppointmentStatus } from "@/types";

type TabType = "upcoming" | "past";

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

  const upcomingAppointments = appointments.filter(
    apt => !isPast(new Date(apt.scheduledAt)) && apt.status !== 'cancelled'
  );
  
  const pastAppointments = appointments.filter(
    apt => isPast(new Date(apt.scheduledAt)) || apt.status === 'cancelled'
  );

  const displayedAppointments = activeTab === "upcoming" ? upcomingAppointments : pastAppointments;

  const formatAppointmentDate = (date: Date) => {
    if (isToday(date)) return "Aujourd'hui";
    if (isTomorrow(date)) return "Demain";
    return format(date, "EEEE d MMMM", { locale: fr });
  };

  const renderAppointmentCard = (appointment: Appointment) => {
    const status = statusConfig[appointment.status];
    const appointmentDate = new Date(appointment.scheduledAt);
    const isUpcoming = !isPast(appointmentDate);

    return (
      <Card 
        key={appointment.id} 
        hover
        className="p-4"
        onClick={() => navigate(`/appointments/${appointment.id}`)}
      >
        <div className="flex gap-3">
          <Avatar
            src={appointment.practitioner?.avatarUrl}
            alt={`${appointment.practitioner?.firstName} ${appointment.practitioner?.lastName}`}
            size="lg"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-semibold text-foreground">
                  Dr. {appointment.practitioner?.firstName} {appointment.practitioner?.lastName}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {appointment.practitioner?.specialty.name}
                </p>
              </div>
              <Badge variant={status.variant}>
                {status.label}
              </Badge>
            </div>
            
            <div className="flex flex-wrap items-center gap-3 mt-2 text-sm">
              <span className={cn(
                "flex items-center gap-1 font-medium",
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
                <Badge variant="info" icon={<Video className="h-3 w-3" />}>
                  Téléconsultation
                </Badge>
              ) : (
                <Badge variant="muted" icon={<MapPin className="h-3 w-3" />}>
                  En cabinet
                </Badge>
              )}
            </div>

            <p className="text-sm text-muted-foreground mt-2 line-clamp-1">
              {appointment.reason}
            </p>
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0 self-center" />
        </div>
      </Card>
    );
  };

  return (
    <>
      <PageContainer noPadding>
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
        
        <div className="px-4 pb-4">
          {/* Tabs */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setActiveTab("upcoming")}
              className={cn(
                "flex-1 py-2.5 px-4 rounded-xl text-sm font-medium transition-all",
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
                "flex-1 py-2.5 px-4 rounded-xl text-sm font-medium transition-all",
                activeTab === "past"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              )}
            >
              Passés ({pastAppointments.length})
            </button>
          </div>

          {/* Appointments List */}
          {displayedAppointments.length === 0 ? (
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
