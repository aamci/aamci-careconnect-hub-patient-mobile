import { useNavigate } from "react-router-dom";
import { 
  Search, 
  Calendar, 
  Video, 
  ChevronRight,
  Clock,
  MapPin,
  Star,
  Stethoscope,
  Smile,
  Sparkles,
  Eye,
  Heart,
  Baby,
  Activity,
  Brain
} from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/common/Card";
import { Avatar } from "@/components/common/Avatar";
import { Badge } from "@/components/common/Badge";
import { currentUserProfile, practitioners, appointments, specialties } from "@/data/mockData";
import { format, isToday, isTomorrow } from "date-fns";
import { fr } from "date-fns/locale";

const specialtyIcons: Record<string, React.ElementType> = {
  stethoscope: Stethoscope,
  tooth: Smile,
  sparkles: Sparkles,
  eye: Eye,
  heart: Heart,
  baby: Baby,
  activity: Activity,
  brain: Brain,
};

export default function Index() {
  const navigate = useNavigate();
  
  const upcomingAppointments = appointments
    .filter(apt => apt.status !== 'cancelled' && apt.status !== 'completed')
    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
    .slice(0, 2);

  const formatAppointmentDate = (date: Date) => {
    if (isToday(date)) return "Aujourd'hui";
    if (isTomorrow(date)) return "Demain";
    return format(date, "EEEE d MMMM", { locale: fr });
  };

  return (
    <>
      <PageContainer noPadding>
        {/* Header */}
        <div className="bg-gradient-hero">
          <div className="px-4 pt-6 pb-4">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-sm text-muted-foreground">Bonjour,</p>
                <h1 className="text-2xl font-bold font-display text-foreground">
                  {currentUserProfile.firstName} 👋
                </h1>
              </div>
              <Avatar 
                src={currentUserProfile.avatarUrl}
                alt={`${currentUserProfile.firstName} ${currentUserProfile.lastName}`}
                size="lg"
              />
            </div>

            {/* Search Bar */}
            <button
              onClick={() => navigate("/search")}
              className="w-full flex items-center gap-3 bg-card rounded-xl px-4 py-3.5 shadow-card border border-border/50 transition-all hover:shadow-lg"
            >
              <Search className="h-5 w-5 text-muted-foreground" />
              <span className="text-muted-foreground text-left flex-1">
                Rechercher un praticien, spécialité...
              </span>
            </button>
          </div>
        </div>

        <div className="px-4 space-y-6 pb-4">
          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="medical-outline"
              className="h-auto py-4 flex-col gap-2"
              onClick={() => navigate("/search")}
            >
              <Calendar className="h-5 w-5" />
              <span className="text-sm font-medium">Prendre RDV</span>
            </Button>
            <Button
              variant="soft"
              className="h-auto py-4 flex-col gap-2"
              onClick={() => navigate("/teleconsultation")}
            >
              <Video className="h-5 w-5" />
              <span className="text-sm font-medium">Téléconsulter</span>
            </Button>
          </div>

          {/* Upcoming Appointments */}
          {upcomingAppointments.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold font-display">Prochains rendez-vous</h2>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-primary"
                  onClick={() => navigate("/appointments")}
                >
                  Voir tout
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
              
              <div className="space-y-3">
                {upcomingAppointments.map((appointment) => (
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
                          {appointment.type === 'teleconsultation' && (
                            <Badge variant="info" icon={<Video className="h-3 w-3" />}>
                              Vidéo
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-sm">
                          <span className="flex items-center gap-1 text-primary font-medium">
                            <Clock className="h-3.5 w-3.5" />
                            {formatAppointmentDate(new Date(appointment.scheduledAt))} à {format(new Date(appointment.scheduledAt), "HH:mm")}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </section>
          )}

          {/* Specialties */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold font-display">Spécialités</h2>
              <Button 
                variant="ghost" 
                size="sm"
                className="text-primary"
                onClick={() => navigate("/search")}
              >
                Voir tout
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
            
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
              {specialties.slice(0, 6).map((specialty) => {
                const Icon = specialtyIcons[specialty.icon || 'stethoscope'] || Stethoscope;
                return (
                  <button
                    key={specialty.id}
                    onClick={() => navigate(`/search?specialty=${specialty.id}`)}
                    className="flex flex-col items-center gap-2 min-w-[80px] group"
                  >
                    <div 
                      className="w-14 h-14 rounded-2xl flex items-center justify-center transition-all group-hover:scale-105"
                      style={{ backgroundColor: `${specialty.color}15` }}
                    >
                      <Icon 
                        className="h-6 w-6" 
                        style={{ color: specialty.color }}
                      />
                    </div>
                    <span className="text-xs text-center text-muted-foreground group-hover:text-foreground transition-colors line-clamp-2">
                      {specialty.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Recommended Practitioners */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold font-display">Praticiens recommandés</h2>
            </div>
            
            <div className="space-y-3">
              {practitioners.slice(0, 3).map((practitioner) => (
                <Card 
                  key={practitioner.id} 
                  hover
                  className="p-4"
                  onClick={() => navigate(`/practitioners/${practitioner.id}`)}
                >
                  <div className="flex gap-3">
                    <Avatar
                      src={practitioner.avatarUrl}
                      alt={`${practitioner.firstName} ${practitioner.lastName}`}
                      size="lg"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-semibold text-foreground">
                            Dr. {practitioner.firstName} {practitioner.lastName}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {practitioner.specialty.name}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 text-sm">
                          <Star className="h-4 w-4 fill-warning text-warning" />
                          <span className="font-medium">{practitioner.rating}</span>
                          <span className="text-muted-foreground">({practitioner.reviewCount})</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 mt-2">
                        {practitioner.teleconsultationEnabled && (
                          <Badge variant="info" icon={<Video className="h-3 w-3" />}>
                            Téléconsultation
                          </Badge>
                        )}
                        {practitioner.nextAvailability && (
                          <span className="text-xs text-success font-medium">
                            Dispo. {isToday(practitioner.nextAvailability) ? "aujourd'hui" : "demain"}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </section>
        </div>
      </PageContainer>
      <BottomNavigation />
    </>
  );
}
