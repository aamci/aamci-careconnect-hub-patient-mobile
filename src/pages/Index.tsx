import { useNavigate } from "react-router-dom";
import { 
  Search, 
  Calendar, 
  Video, 
  ChevronRight,
  Clock,
  Star,
  Stethoscope,
  Smile,
  Sparkles,
  Eye,
  Heart,
  Baby,
  Activity,
  Brain,
  History,
  FileText,
  Share2,
  Bell
} from "lucide-react";
import { useUnreadNotificationCount } from "@/hooks/useNotifications";
import { PageContainer } from "@/components/layout/PageContainer";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/common/Card";
import { Avatar } from "@/components/common/Avatar";
import { Badge } from "@/components/common/Badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { useSpecialties, usePractitioners } from "@/hooks/usePractitioners";
import { useAppointments } from "@/hooks/useAppointments";
import { usePatientProfiles } from "@/hooks/usePatientProfiles";
import { format, isToday, isTomorrow, isPast } from "date-fns";
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
  shield: Sparkles,
  user: Smile,
};

export default function Index() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const { data: profiles, isLoading: profilesLoading } = usePatientProfiles();
  const { data: specialties, isLoading: specialtiesLoading } = useSpecialties();
  const { data: practitioners, isLoading: practitionersLoading } = usePractitioners();
  const { data: appointments, isLoading: appointmentsLoading } = useAppointments();
  const unreadNotifications = useUnreadNotificationCount();

  const currentProfile = profiles?.find(p => p.profile_type === 'self') || profiles?.[0];
  
  const upcomingAppointments = appointments
    ?.filter(apt => apt.status !== 'cancelled' && apt.status !== 'completed' && !isPast(new Date(apt.scheduled_at)))
    .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime())
    .slice(0, 2) || [];

  const formatAppointmentDate = (date: Date) => {
    if (isToday(date)) return "Aujourd'hui";
    if (isTomorrow(date)) return "Demain";
    return format(date, "EEE d MMM", { locale: fr });
  };

  const firstName = currentProfile?.first_name || user?.email?.split('@')[0] || 'Patient';

  return (
    <>
      <PageContainer noPadding className="overflow-x-hidden">
        {/* Header */}
        <div className="bg-gradient-hero">
          <div className="px-4 pt-[calc(1.5rem+env(safe-area-inset-top,0px))] pb-4 max-w-lg mx-auto">
            <div className="flex items-center justify-between gap-4 mb-6">
              <div className="min-w-0 flex-1">
                <p className="text-sm text-muted-foreground">Bonjour,</p>
                <h1 className="text-xl sm:text-2xl font-bold font-display text-foreground truncate">
                  {firstName} 👋
                </h1>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={
                    unreadNotifications > 0
                      ? `Notifications, ${unreadNotifications} non lues`
                      : "Notifications"
                  }
                  onClick={() => navigate("/notifications")}
                  className="relative min-h-11 min-w-11 rounded-full bg-card/70 border border-border/50"
                >
                  <Bell className="h-5 w-5" />
                  {unreadNotifications > 0 && (
                    <span className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center">
                      {unreadNotifications > 9 ? "9+" : unreadNotifications}
                    </span>
                  )}
                </Button>
                <Avatar
                  src={currentProfile?.avatar_url || undefined}
                  alt={firstName}
                  size="lg"
                  onClick={() => navigate("/profile")}
                  className="shrink-0"
                />
              </div>
            </div>

            {/* Search Bar */}
            <button
              onClick={() => navigate("/search")}
              className="w-full flex items-center gap-3 bg-card rounded-xl px-4 py-3.5 shadow-card border border-border/50 transition-all hover:shadow-lg active:scale-[0.99]"
            >
              <Search className="h-5 w-5 text-muted-foreground shrink-0" />
              <span className="text-muted-foreground text-left flex-1 text-sm sm:text-base truncate">
                Rechercher un praticien...
              </span>
            </button>
          </div>
        </div>

        <div className="px-4 space-y-6 pb-4 max-w-lg mx-auto">
          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="medical-outline"
              className="h-auto py-4 flex-col gap-2 min-h-[72px]"
              onClick={() => navigate("/search")}
            >
              <Calendar className="h-5 w-5 shrink-0" />
              <span className="text-sm font-medium">Prendre RDV</span>
            </Button>
            <Button
              variant="soft"
              className="h-auto py-4 flex-col gap-2 min-h-[72px]"
              onClick={() => navigate("/search?teleconsult=true")}
            >
              <Video className="h-5 w-5 shrink-0" />
              <span className="text-sm font-medium">Téléconsulter</span>
            </Button>
          </div>

          {/* Secondary Actions */}
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => navigate("/documents")}
              className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors min-h-[64px]"
            >
              <FileText className="h-5 w-5 text-primary" />
              <span className="text-xs text-muted-foreground">Documents</span>
            </button>
            <button
              onClick={() => navigate("/history")}
              className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors min-h-[64px]"
            >
              <History className="h-5 w-5 text-primary" />
              <span className="text-xs text-muted-foreground">Historique</span>
            </button>
            <button
              onClick={() => navigate("/health/metrics")}
              className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors min-h-[64px]"
            >
              <Activity className="h-5 w-5 text-primary" />
              <span className="text-xs text-muted-foreground">Constantes</span>
            </button>
            <button
              onClick={() => navigate("/share")}
              className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors min-h-[64px]"
            >
              <Share2 className="h-5 w-5 text-primary" />
              <span className="text-xs text-muted-foreground">Partage</span>
            </button>
            <button
              onClick={() => navigate("/favorites")}
              className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors min-h-[64px]"
            >
              <Heart className="h-5 w-5 text-primary" />
              <span className="text-xs text-muted-foreground">Favoris</span>
            </button>
            <button
              onClick={() => navigate("/assistant")}
              className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-primary/5 hover:bg-primary/10 transition-colors min-h-[64px] border border-primary/10"
            >
              <Sparkles className="h-5 w-5 text-primary" />
              <span className="text-xs text-primary font-medium">Assistant</span>
            </button>
          </div>

          {/* Upcoming Appointments */}
          {appointmentsLoading ? (
            <section>
              <Skeleton className="h-6 w-48 mb-3" />
              <Skeleton className="h-24 w-full" />
            </section>
          ) : upcomingAppointments.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-3 gap-2">
                <h2 className="text-lg font-semibold font-display truncate">Prochains RDV</h2>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-primary shrink-0"
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
                          {appointment.type === 'teleconsultation' && (
                            <Badge variant="info" icon={<Video className="h-3 w-3" />} className="shrink-0">
                              <span className="hidden xs:inline">Vidéo</span>
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-1 mt-2 text-xs sm:text-sm">
                          <Clock className="h-3.5 w-3.5 text-primary shrink-0" />
                          <span className="text-primary font-medium truncate">
                            {formatAppointmentDate(new Date(appointment.scheduled_at))} à {format(new Date(appointment.scheduled_at), "HH:mm")}
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
            <div className="flex items-center justify-between mb-3 gap-2">
              <h2 className="text-lg font-semibold font-display">Spécialités</h2>
              <Button 
                variant="ghost" 
                size="sm"
                className="text-primary shrink-0"
                onClick={() => navigate("/search")}
              >
                Voir tout
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
            
            {specialtiesLoading ? (
              <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex flex-col items-center gap-2 min-w-[70px]">
                    <Skeleton className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl" />
                    <Skeleton className="h-3 w-12" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
                {specialties?.slice(0, 6).map((specialty) => {
                  const Icon = specialtyIcons[specialty.icon || 'stethoscope'] || Stethoscope;
                  return (
                    <button
                      key={specialty.id}
                      onClick={() => navigate(`/search?specialty=${specialty.id}`)}
                      className="flex flex-col items-center gap-1.5 sm:gap-2 min-w-[70px] sm:min-w-[80px] group"
                    >
                      <div 
                        className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center transition-all group-hover:scale-105 group-active:scale-95"
                        style={{ backgroundColor: `${specialty.color || '#0D9488'}15` }}
                      >
                        <Icon 
                          className="h-5 w-5 sm:h-6 sm:w-6" 
                          style={{ color: specialty.color || '#0D9488' }}
                        />
                      </div>
                      <span className="text-[10px] sm:text-xs text-center text-muted-foreground group-hover:text-foreground transition-colors line-clamp-2 max-w-[70px] sm:max-w-[80px]">
                        {specialty.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </section>

          {/* Recommended Practitioners */}
          <section>
            <h2 className="text-lg font-semibold font-display mb-3">Praticiens recommandés</h2>
            
            {practitionersLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="p-3 sm:p-4">
                    <div className="flex gap-3">
                      <Skeleton className="w-10 h-10 sm:w-12 sm:h-12 rounded-full shrink-0" />
                      <div className="flex-1 min-w-0">
                        <Skeleton className="h-5 w-32 mb-1" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {practitioners?.slice(0, 3).map((practitioner) => (
                  <Card 
                    key={practitioner.id} 
                    hover
                    className="p-3 sm:p-4"
                    onClick={() => navigate(`/practitioners/${practitioner.id}`)}
                  >
                    <div className="flex gap-3">
                      <Avatar
                        src={practitioner.avatar_url || undefined}
                        alt={`${practitioner.first_name} ${practitioner.last_name}`}
                        size="md"
                        className="shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <h3 className="font-semibold text-foreground text-sm sm:text-base truncate">
                              Dr. {practitioner.first_name} {practitioner.last_name}
                            </h3>
                            <p className="text-xs sm:text-sm text-muted-foreground truncate">
                              {practitioner.specialty?.name}
                            </p>
                          </div>
                          <div className="flex items-center gap-1 text-xs sm:text-sm shrink-0">
                            <Star className="h-3.5 w-3.5 sm:h-4 sm:w-4 fill-warning text-warning" />
                            <span className="font-medium">{practitioner.rating}</span>
                            <span className="text-muted-foreground hidden sm:inline">({practitioner.review_count})</span>
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          {practitioner.teleconsultation_enabled && (
                            <Badge variant="info" icon={<Video className="h-3 w-3" />} className="text-[10px] sm:text-xs">
                              Vidéo
                            </Badge>
                          )}
                          {practitioner.next_availability && (
                            <span className="text-[10px] sm:text-xs text-success font-medium">
                              Dispo. {isToday(new Date(practitioner.next_availability)) ? "auj." : "bientôt"}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </section>
        </div>
      </PageContainer>
      <BottomNavigation />
    </>
  );
}
