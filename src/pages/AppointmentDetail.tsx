import { useNavigate, useParams } from "react-router-dom";
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  MapPin, 
  Video, 
  MessageCircle,
  FileText,
  X,
  RefreshCw,
  Phone,
  Loader2,
  User,
  Star
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { PageContainer } from "@/components/layout/PageContainer";
import { Card } from "@/components/common/Card";
import { Avatar } from "@/components/common/Avatar";
import { Badge } from "@/components/common/Badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAppointments, useCancelAppointment } from "@/hooks/useAppointments";
import { useCreateMessageThread } from "@/hooks/useMessages";
import { useConsultationReports, useGenerateConsultationReport } from "@/hooks/useConsultationReports";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import type { Database } from "@/integrations/supabase/types";

type AppointmentStatus = Database["public"]["Enums"]["appointment_status"];

const statusConfig: Record<AppointmentStatus, { label: string; variant: "default" | "success" | "warning" | "destructive" | "info" | "muted" }> = {
  scheduled: { label: "Planifié", variant: "info" },
  confirmed: { label: "Confirmé", variant: "success" },
  in_progress: { label: "En cours", variant: "warning" },
  completed: { label: "Terminé", variant: "muted" },
  cancelled: { label: "Annulé", variant: "destructive" },
  no_show: { label: "Absent", variant: "destructive" },
};

export default function AppointmentDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const { data: appointments, isLoading } = useAppointments();
  const cancelAppointment = useCancelAppointment();
  const createThread = useCreateMessageThread();
  const { data: reports } = useConsultationReports();
  const generateReport = useGenerateConsultationReport();

  const appointment = appointments?.find((a) => a.id === id);
  const existingReport = reports?.find((r) => r.appointment_id === id);

  if (isLoading) {
    return (
      <PageContainer noPadding>
        <div className="sticky top-0 z-10 bg-background border-b">
          <div className="flex items-center gap-4 px-4 py-3">
            <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-muted rounded-full min-w-[44px] min-h-[44px] flex items-center justify-center">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <Skeleton className="h-6 w-48" />
          </div>
        </div>
        <div className="px-4 py-6 space-y-4 max-w-lg mx-auto">
          <Skeleton className="h-8 w-24 mx-auto" />
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-48 w-full rounded-xl" />
        </div>
      </PageContainer>
    );
  }

  if (!appointment) {
    return (
      <PageContainer>
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
          <p className="text-muted-foreground text-center">Rendez-vous non trouvé</p>
          <Button variant="outline" onClick={() => navigate("/appointments")} className="mt-4">
            Retour aux rendez-vous
          </Button>
        </div>
      </PageContainer>
    );
  }

  const isPast = new Date(appointment.scheduled_at) < new Date();
  const isCancelled = appointment.status === "cancelled";
  const canCancel = !isPast && !isCancelled;
  const canReschedule = !isPast && !isCancelled;
  const canJoinTeleconsult = 
    appointment.type === "teleconsultation" && 
    !isPast && 
    !isCancelled &&
    appointment.status !== "completed";

  const handleCancel = async () => {
    try {
      await cancelAppointment.mutateAsync({
        appointmentId: appointment.id,
        reason: "Annulé par le patient"
      });
      toast({
        title: "Rendez-vous annulé",
        description: "Votre rendez-vous a été annulé avec succès",
      });
      navigate("/appointments");
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'annuler le rendez-vous",
        variant: "destructive",
      });
    }
  };

  const handleJoinTeleconsult = () => {
    navigate(`/teleconsultation/${appointment.id}`);
  };

  const handleMessage = async () => {
    try {
      const thread = await createThread.mutateAsync({
        patientProfileId: appointment.patient_profile_id,
        practitionerId: appointment.practitioner_id,
        appointmentId: appointment.id,
      });
      navigate(`/messages/${thread.id}`);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de créer la conversation",
        variant: "destructive",
      });
    }
  };

  const status = statusConfig[appointment.status];

  return (
    <PageContainer noPadding className="overflow-x-hidden">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b">
        <div className="flex items-center gap-4 px-4 py-3">
          <button 
            onClick={() => navigate(-1)} 
            className="p-2 -ml-2 hover:bg-muted rounded-full min-w-[44px] min-h-[44px] flex items-center justify-center"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-lg font-semibold truncate">Détail du rendez-vous</h1>
        </div>
      </div>

      <div className="px-4 py-6 space-y-4 max-w-lg mx-auto">
        {/* Status Badge */}
        <div className="flex justify-center">
          <Badge variant={status.variant} className="text-sm px-4 py-1.5">
            {status.label}
          </Badge>
        </div>

        {/* Practitioner Card */}
        <Card className="p-4">
          <div className="flex gap-3 sm:gap-4">
            <Avatar
              src={appointment.practitioner?.avatar_url || undefined}
              alt={`${appointment.practitioner?.first_name} ${appointment.practitioner?.last_name}`}
              size="lg"
              className="shrink-0"
            />
            <div className="flex-1 min-w-0">
              <h2 className="font-semibold text-base sm:text-lg truncate">
                Dr. {appointment.practitioner?.first_name} {appointment.practitioner?.last_name}
              </h2>
              <p className="text-sm text-muted-foreground truncate">
                {appointment.practitioner?.specialty?.name}
              </p>
              <div className="flex flex-wrap gap-2 mt-3">
                <Button variant="outline" size="sm" className="text-xs sm:text-sm h-9">
                  <Phone className="h-4 w-4 mr-1" />
                  Appeler
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleMessage}
                  disabled={createThread.isPending}
                  className="text-xs sm:text-sm h-9"
                >
                  {createThread.isPending ? (
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  ) : (
                    <MessageCircle className="h-4 w-4 mr-1" />
                  )}
                  Message
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Patient Profile */}
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg shrink-0">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-sm text-muted-foreground">Patient</p>
              <p className="font-medium truncate">
                {appointment.patient_profile?.first_name} {appointment.patient_profile?.last_name}
              </p>
            </div>
          </div>
        </Card>

        {/* Appointment Details */}
        <Card className="p-4 space-y-4">
          <h3 className="font-semibold">Informations du rendez-vous</h3>
          
          <div className="flex items-start gap-3">
            <div className="p-2 bg-primary/10 rounded-lg shrink-0">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="font-medium">
                {format(new Date(appointment.scheduled_at), "EEEE d MMMM yyyy", { locale: fr })}
              </p>
              <p className="text-sm text-muted-foreground capitalize">
                {format(new Date(appointment.scheduled_at), "EEEE", { locale: fr })}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 bg-primary/10 rounded-lg shrink-0">
              <Clock className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-medium">
                {format(new Date(appointment.scheduled_at), "HH:mm", { locale: fr })}
              </p>
              <p className="text-sm text-muted-foreground">
                Durée : {appointment.duration} minutes
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 bg-primary/10 rounded-lg shrink-0">
              {appointment.type === "teleconsultation" ? (
                <Video className="h-5 w-5 text-primary" />
              ) : (
                <MapPin className="h-5 w-5 text-primary" />
              )}
            </div>
            <div className="min-w-0">
              <p className="font-medium">
                {appointment.type === "teleconsultation" ? "Téléconsultation" : "Consultation en cabinet"}
              </p>
              {appointment.facility && (
                <button
                  type="button"
                  onClick={() => navigate(`/facilities/${appointment.facility_id}`)}
                  className="text-sm text-primary underline-offset-2 hover:underline truncate text-left"
                >
                  {appointment.facility.name}
                </button>
              )}
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 bg-primary/10 rounded-lg shrink-0">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="font-medium">Motif de consultation</p>
              <p className="text-sm text-muted-foreground">{appointment.reason}</p>
            </div>
          </div>
        </Card>

        {/* Review CTA for completed appointments */}
        {appointment.status === "completed" && (
          <Card className="p-4 border-primary/20 bg-primary/5">
            <div className="flex items-center gap-3">
              <Star className="h-8 w-8 text-primary shrink-0" />
              <div className="flex-1">
                <p className="font-semibold text-sm">Comment s'est passée votre consultation ?</p>
                <p className="text-xs text-muted-foreground">Partagez votre expérience</p>
              </div>
              <Button size="sm" onClick={() => navigate(`/review/${appointment.id}`)}>
                Évaluer
              </Button>
            </div>
          </Card>
        )}

        {/* Consultation report */}
        {appointment.status === "completed" && (
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <FileText className="h-8 w-8 text-primary shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">Compte rendu de consultation</p>
                <p className="text-xs text-muted-foreground">
                  {existingReport
                    ? "Disponible dans votre historique"
                    : "Générez le récapitulatif de votre échange"}
                </p>
              </div>
              <Button
                size="sm"
                variant={existingReport ? "outline" : "default"}
                disabled={generateReport.isPending}
                onClick={async () => {
                  if (existingReport) {
                    navigate(`/reports/${existingReport.id}`);
                    return;
                  }
                  try {
                    const id = await generateReport.mutateAsync(appointment.id);
                    navigate(`/reports/${id}`);
                  } catch (e) {
                    toast({
                      title: "Compte rendu indisponible",
                      description: e instanceof Error ? e.message : "Réessayez plus tard",
                      variant: "destructive",
                    });
                  }
                }}
              >
                {generateReport.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : existingReport ? (
                  "Consulter"
                ) : (
                  "Générer"
                )}
              </Button>
            </div>
          </Card>
        )}


        {/* Action Buttons */}
        <div className="space-y-3">
          {canJoinTeleconsult && (
            <Button className="w-full" size="lg" onClick={handleJoinTeleconsult}>
              <Video className="h-5 w-5 mr-2" />
              Rejoindre la téléconsultation
            </Button>
          )}

          {canReschedule && (
            <Button variant="outline" className="w-full" size="lg">
              <RefreshCw className="h-5 w-5 mr-2" />
              Reporter le rendez-vous
            </Button>
          )}

          {canCancel && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="w-full" size="lg">
                  <X className="h-5 w-5 mr-2" />
                  Annuler le rendez-vous
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="mx-4 max-w-sm">
                <AlertDialogHeader>
                  <AlertDialogTitle>Annuler le rendez-vous ?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Êtes-vous sûr de vouloir annuler ce rendez-vous ? Cette action est irréversible.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                  <AlertDialogCancel className="w-full sm:w-auto">Non, garder</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={handleCancel}
                    disabled={cancelAppointment.isPending}
                    className="w-full sm:w-auto"
                  >
                    {cancelAppointment.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Oui, annuler
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>

        {/* Notes Section */}
        {appointment.notes && (
          <Card className="p-4">
            <h3 className="font-semibold mb-2">Notes</h3>
            <p className="text-sm text-muted-foreground">{appointment.notes}</p>
          </Card>
        )}
      </div>
    </PageContainer>
  );
}
