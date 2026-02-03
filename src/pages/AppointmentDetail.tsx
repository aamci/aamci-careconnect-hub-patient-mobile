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
  Phone
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { PageContainer } from "@/components/layout/PageContainer";
import { Card } from "@/components/common/Card";
import { Avatar } from "@/components/common/Avatar";
import { Badge } from "@/components/common/Badge";
import { appointments } from "@/data/mockData";
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

export default function AppointmentDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();

  const appointment = appointments.find((a) => a.id === id);

  if (!appointment) {
    return (
      <PageContainer>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <p className="text-muted-foreground">Rendez-vous non trouvé</p>
          <Button variant="outline" onClick={() => navigate("/appointments")} className="mt-4">
            Retour aux rendez-vous
          </Button>
        </div>
      </PageContainer>
    );
  }

  const isPast = new Date(appointment.scheduledAt) < new Date();
  const isCancelled = appointment.status === "cancelled";
  const canCancel = !isPast && !isCancelled;
  const canReschedule = !isPast && !isCancelled;
  const canJoinTeleconsult = 
    appointment.type === "teleconsultation" && 
    !isPast && 
    !isCancelled &&
    appointment.status !== "completed";

  const handleCancel = () => {
    toast({
      title: "Rendez-vous annulé",
      description: "Votre rendez-vous a été annulé avec succès",
    });
    navigate("/appointments");
  };

  const handleJoinTeleconsult = () => {
    navigate(`/teleconsultation/${appointment.id}`);
  };

  const statusConfig = {
    scheduled: { label: "Programmé", variant: "secondary" as const },
    confirmed: { label: "Confirmé", variant: "default" as const },
    in_progress: { label: "En cours", variant: "default" as const },
    completed: { label: "Terminé", variant: "outline" as const },
    cancelled: { label: "Annulé", variant: "destructive" as const },
    no_show: { label: "Absent", variant: "destructive" as const },
  };

  const status = statusConfig[appointment.status];

  return (
    <PageContainer noPadding>
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b">
        <div className="flex items-center gap-4 px-4 py-3">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-muted rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-lg font-semibold">Détail du rendez-vous</h1>
        </div>
      </div>

      <div className="px-4 py-6 space-y-6">
        {/* Status Badge */}
        <div className="flex justify-center">
          <Badge variant={status.variant} className="text-base px-4 py-1">
            {status.label}
          </Badge>
        </div>

        {/* Practitioner Card */}
        <Card className="p-4">
          <div className="flex gap-4">
            <Avatar
              src={appointment.practitioner?.avatarUrl}
              alt={`${appointment.practitioner?.firstName} ${appointment.practitioner?.lastName}`}
              size="xl"
            />
            <div className="flex-1">
              <h2 className="font-semibold text-lg">
                Dr. {appointment.practitioner?.firstName} {appointment.practitioner?.lastName}
              </h2>
              <p className="text-muted-foreground">
                {appointment.practitioner?.specialty.name}
              </p>
              <div className="flex gap-2 mt-3">
                <Button variant="outline" size="sm">
                  <Phone className="h-4 w-4 mr-1" />
                  Appeler
                </Button>
                <Button variant="outline" size="sm" onClick={() => navigate("/messages")}>
                  <MessageCircle className="h-4 w-4 mr-1" />
                  Message
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Appointment Details */}
        <Card className="p-4 space-y-4">
          <h3 className="font-semibold">Informations du rendez-vous</h3>
          
          <div className="flex items-start gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-medium">
                {format(new Date(appointment.scheduledAt), "EEEE d MMMM yyyy", { locale: fr })}
              </p>
              <p className="text-sm text-muted-foreground capitalize">
                {format(new Date(appointment.scheduledAt), "EEEE", { locale: fr })}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Clock className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-medium">
                {format(new Date(appointment.scheduledAt), "HH:mm", { locale: fr })}
              </p>
              <p className="text-sm text-muted-foreground">
                Durée : {appointment.duration} minutes
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              {appointment.type === "teleconsultation" ? (
                <Video className="h-5 w-5 text-primary" />
              ) : (
                <MapPin className="h-5 w-5 text-primary" />
              )}
            </div>
            <div>
              <p className="font-medium">
                {appointment.type === "teleconsultation" ? "Téléconsultation" : "Consultation en cabinet"}
              </p>
              {appointment.facility && (
                <p className="text-sm text-muted-foreground">
                  {appointment.facility.name}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-medium">Motif de consultation</p>
              <p className="text-sm text-muted-foreground">{appointment.reason}</p>
            </div>
          </div>
        </Card>

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
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Annuler le rendez-vous ?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Êtes-vous sûr de vouloir annuler ce rendez-vous ? Cette action est irréversible.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Non, garder</AlertDialogCancel>
                  <AlertDialogAction onClick={handleCancel}>
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
