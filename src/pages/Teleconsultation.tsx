import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Phone, 
  MessageCircle,
  Settings,
  Users,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/common/Card";
import { Avatar } from "@/components/common/Avatar";
import { cn } from "@/lib/utils";
import { appointments } from "@/data/mockData";

type ConsultationState = "checking" | "waiting" | "in_progress" | "ended";

export default function TeleconsultationPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [state, setState] = useState<ConsultationState>("checking");
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [cameraOk, setCameraOk] = useState(false);
  const [micOk, setMicOk] = useState(false);
  const [checkingPermissions, setCheckingPermissions] = useState(true);

  const appointment = appointments.find((a) => a.id === id);

  useEffect(() => {
    // Simulate permission checking
    const checkPermissions = async () => {
      setCheckingPermissions(true);
      
      // Simulate camera check
      await new Promise(resolve => setTimeout(resolve, 1000));
      setCameraOk(true);
      
      // Simulate mic check
      await new Promise(resolve => setTimeout(resolve, 800));
      setMicOk(true);
      
      setCheckingPermissions(false);
    };

    checkPermissions();
  }, []);

  const handleJoinCall = () => {
    setState("waiting");
    // Simulate practitioner joining after delay
    setTimeout(() => {
      setState("in_progress");
    }, 3000);
  };

  const handleEndCall = () => {
    setState("ended");
  };

  const handleLeave = () => {
    navigate("/appointments");
  };

  if (!appointment) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Consultation non trouvée</p>
          <Button variant="outline" onClick={() => navigate("/appointments")} className="mt-4">
            Retour aux rendez-vous
          </Button>
        </div>
      </div>
    );
  }

  // Device Check Screen
  if (state === "checking") {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        {/* Header */}
        <div className="border-b px-4 py-3 flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-muted rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="font-semibold">Préparation de la consultation</h1>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
          <div className="w-full max-w-sm space-y-8">
            {/* Video Preview */}
            <div className="aspect-video bg-muted rounded-2xl flex items-center justify-center relative overflow-hidden">
              <div className="text-center">
                <Video className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Aperçu vidéo</p>
              </div>
              {/* Controls */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-3">
                <button 
                  onClick={() => setVideoEnabled(!videoEnabled)}
                  className={cn(
                    "p-3 rounded-full",
                    videoEnabled ? "bg-muted" : "bg-destructive text-destructive-foreground"
                  )}
                >
                  {videoEnabled ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
                </button>
                <button 
                  onClick={() => setAudioEnabled(!audioEnabled)}
                  className={cn(
                    "p-3 rounded-full",
                    audioEnabled ? "bg-muted" : "bg-destructive text-destructive-foreground"
                  )}
                >
                  {audioEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Permission Checks */}
            <Card className="p-4 space-y-4">
              <h3 className="font-semibold">Vérification des équipements</h3>
              
              <div className="flex items-center gap-3">
                {checkingPermissions && !cameraOk ? (
                  <Loader2 className="h-5 w-5 text-muted-foreground animate-spin" />
                ) : cameraOk ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-destructive" />
                )}
                <span>Caméra</span>
              </div>

              <div className="flex items-center gap-3">
                {checkingPermissions && !micOk ? (
                  <Loader2 className="h-5 w-5 text-muted-foreground animate-spin" />
                ) : micOk ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-destructive" />
                )}
                <span>Microphone</span>
              </div>
            </Card>

            {/* Appointment Info */}
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <Avatar
                  src={appointment.practitioner?.avatarUrl}
                  alt={`${appointment.practitioner?.firstName} ${appointment.practitioner?.lastName}`}
                  size="lg"
                />
                <div>
                  <p className="font-semibold">
                    Dr. {appointment.practitioner?.firstName} {appointment.practitioner?.lastName}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {appointment.practitioner?.specialty.name}
                  </p>
                </div>
              </div>
            </Card>

            <Button 
              className="w-full" 
              size="lg" 
              onClick={handleJoinCall}
              disabled={checkingPermissions || !cameraOk || !micOk}
            >
              Rejoindre la consultation
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Waiting Room
  if (state === "waiting") {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
        <div className="text-center space-y-6 max-w-sm">
          <div className="relative">
            <Avatar
              src={appointment.practitioner?.avatarUrl}
              alt={`${appointment.practitioner?.firstName} ${appointment.practitioner?.lastName}`}
              size="xl"
              className="mx-auto"
            />
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-background px-3 py-1 rounded-full border">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 bg-yellow-500 rounded-full animate-pulse" />
                <span className="text-xs">En attente</span>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold">Salle d'attente virtuelle</h2>
            <p className="text-muted-foreground mt-2">
              Dr. {appointment.practitioner?.firstName} {appointment.practitioner?.lastName} va vous rejoindre dans un instant
            </p>
          </div>

          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Connexion en cours...</span>
          </div>

          <Button variant="destructive" onClick={handleLeave}>
            Quitter la salle d'attente
          </Button>
        </div>
      </div>
    );
  }

  // In Progress
  if (state === "in_progress") {
    return (
      <div className="min-h-screen bg-black flex flex-col">
        {/* Main Video */}
        <div className="flex-1 relative">
          {/* Remote video (practitioner) */}
          <div className="absolute inset-0 bg-muted flex items-center justify-center">
            <Avatar
              src={appointment.practitioner?.avatarUrl}
              alt="Praticien"
              size="xl"
            />
          </div>

          {/* Local video (patient) */}
          <div className="absolute top-4 right-4 w-28 aspect-video bg-muted-foreground/20 rounded-lg flex items-center justify-center">
            {videoEnabled ? (
              <span className="text-xs text-white/70">Vous</span>
            ) : (
              <VideoOff className="h-6 w-6 text-white/50" />
            )}
          </div>

          {/* Practitioner name */}
          <div className="absolute top-4 left-4 bg-black/50 px-3 py-2 rounded-lg">
            <p className="text-white text-sm">
              Dr. {appointment.practitioner?.firstName} {appointment.practitioner?.lastName}
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-black/80 px-6 py-6 safe-area-inset-bottom">
          <div className="flex items-center justify-center gap-4">
            <button 
              onClick={() => setAudioEnabled(!audioEnabled)}
              className={cn(
                "p-4 rounded-full",
                audioEnabled ? "bg-white/20 text-white" : "bg-destructive text-destructive-foreground"
              )}
            >
              {audioEnabled ? <Mic className="h-6 w-6" /> : <MicOff className="h-6 w-6" />}
            </button>

            <button 
              onClick={() => setVideoEnabled(!videoEnabled)}
              className={cn(
                "p-4 rounded-full",
                videoEnabled ? "bg-white/20 text-white" : "bg-destructive text-destructive-foreground"
              )}
            >
              {videoEnabled ? <Video className="h-6 w-6" /> : <VideoOff className="h-6 w-6" />}
            </button>

            <button 
              onClick={handleEndCall}
              className="p-4 rounded-full bg-destructive text-destructive-foreground"
            >
              <Phone className="h-6 w-6 rotate-[135deg]" />
            </button>

            <button className="p-4 rounded-full bg-white/20 text-white">
              <MessageCircle className="h-6 w-6" />
            </button>

            <button className="p-4 rounded-full bg-white/20 text-white">
              <Settings className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Ended
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
      <div className="text-center space-y-6 max-w-sm">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30">
          <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
        </div>

        <div>
          <h2 className="text-xl font-semibold">Consultation terminée</h2>
          <p className="text-muted-foreground mt-2">
            Votre téléconsultation avec Dr. {appointment.practitioner?.firstName} {appointment.practitioner?.lastName} est terminée
          </p>
        </div>

        <Card className="p-4 text-left space-y-3">
          <h3 className="font-semibold">Prochaines étapes</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              Ordonnance disponible dans vos documents
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              Compte-rendu envoyé par email
            </li>
          </ul>
        </Card>

        <div className="space-y-3">
          <Button className="w-full" onClick={() => navigate("/documents")}>
            Voir mes documents
          </Button>
          <Button variant="outline" className="w-full" onClick={() => navigate("/")}>
            Retour à l'accueil
          </Button>
        </div>
      </div>
    </div>
  );
}
