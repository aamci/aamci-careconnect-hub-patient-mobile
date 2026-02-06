import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Phone, 
  MessageCircle,
  Settings,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ScreenShare,
  ScreenShareOff,
  Volume2,
  VolumeX,
  RotateCcw,
  Camera
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/common/Card";
import { Avatar } from "@/components/common/Avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useAppointments } from "@/hooks/useAppointments";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

type ConsultationState = "checking" | "waiting" | "in_progress" | "ended";

export default function TeleconsultationPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [state, setState] = useState<ConsultationState>("checking");
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [speakerEnabled, setSpeakerEnabled] = useState(true);
  const [screenShare, setScreenShare] = useState(false);
  const [cameraOk, setCameraOk] = useState(false);
  const [micOk, setMicOk] = useState(false);
  const [checkingPermissions, setCheckingPermissions] = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  const [showChat, setShowChat] = useState(false);
  const callTimerRef = useRef<NodeJS.Timeout | null>(null);

  const { data: appointments, isLoading } = useAppointments();
  const appointment = appointments?.find((a) => a.id === id);

  useEffect(() => {
    const checkPermissions = async () => {
      setCheckingPermissions(true);
      
      try {
        // Request camera permission
        await navigator.mediaDevices.getUserMedia({ video: true });
        setCameraOk(true);
      } catch {
        setCameraOk(false);
      }
      
      try {
        // Request mic permission
        await navigator.mediaDevices.getUserMedia({ audio: true });
        setMicOk(true);
      } catch {
        setMicOk(false);
      }
      
      setCheckingPermissions(false);
    };

    checkPermissions();
  }, []);

  useEffect(() => {
    if (state === "in_progress") {
      callTimerRef.current = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    
    return () => {
      if (callTimerRef.current) {
        clearInterval(callTimerRef.current);
      }
    };
  }, [state]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleJoinCall = () => {
    setState("waiting");
    // Simulate practitioner joining after delay
    setTimeout(() => {
      setState("in_progress");
    }, 3000);
  };

  const handleEndCall = () => {
    if (callTimerRef.current) {
      clearInterval(callTimerRef.current);
    }
    setState("ended");
  };

  const handleLeave = () => {
    navigate("/appointments");
  };

  const handleRetryPermissions = async () => {
    setCheckingPermissions(true);
    setCameraOk(false);
    setMicOk(false);
    
    try {
      await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setCameraOk(true);
      setMicOk(true);
    } catch (error) {
      console.error("Permission error:", error);
    }
    
    setCheckingPermissions(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-dvh bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="min-h-dvh bg-background flex flex-col items-center justify-center px-4">
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
      <div className="min-h-dvh bg-background flex flex-col">
        {/* Header */}
        <div className="border-b px-4 py-3 flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)} 
            className="p-2 -ml-2 hover:bg-muted rounded-full min-w-[44px] min-h-[44px] flex items-center justify-center"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="font-semibold">Préparation de la consultation</h1>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-4 py-6 overflow-y-auto">
          <div className="w-full max-w-sm space-y-6">
            {/* Video Preview */}
            <div className="aspect-video bg-muted rounded-2xl flex items-center justify-center relative overflow-hidden">
              <div className="text-center">
                <Camera className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Aperçu vidéo</p>
              </div>
              {/* Controls */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-3">
                <button 
                  onClick={() => setVideoEnabled(!videoEnabled)}
                  className={cn(
                    "p-3 rounded-full min-w-[48px] min-h-[48px] flex items-center justify-center",
                    videoEnabled ? "bg-muted" : "bg-destructive text-destructive-foreground"
                  )}
                >
                  {videoEnabled ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
                </button>
                <button 
                  onClick={() => setAudioEnabled(!audioEnabled)}
                  className={cn(
                    "p-3 rounded-full min-w-[48px] min-h-[48px] flex items-center justify-center",
                    audioEnabled ? "bg-muted" : "bg-destructive text-destructive-foreground"
                  )}
                >
                  {audioEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Permission Checks */}
            <Card className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Vérification des équipements</h3>
                {(!cameraOk || !micOk) && !checkingPermissions && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleRetryPermissions}
                    className="text-xs"
                  >
                    <RotateCcw className="h-4 w-4 mr-1" />
                    Réessayer
                  </Button>
                )}
              </div>
              
              <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                {checkingPermissions && !cameraOk ? (
                  <Loader2 className="h-5 w-5 text-muted-foreground animate-spin shrink-0" />
                ) : cameraOk ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-destructive shrink-0" />
                )}
                <span className="text-sm">Caméra</span>
                {!cameraOk && !checkingPermissions && (
                  <span className="text-xs text-destructive ml-auto">Non autorisée</span>
                )}
              </div>

              <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                {checkingPermissions && !micOk ? (
                  <Loader2 className="h-5 w-5 text-muted-foreground animate-spin shrink-0" />
                ) : micOk ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-destructive shrink-0" />
                )}
                <span className="text-sm">Microphone</span>
                {!micOk && !checkingPermissions && (
                  <span className="text-xs text-destructive ml-auto">Non autorisé</span>
                )}
              </div>
            </Card>

            {/* Appointment Info */}
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <Avatar
                  src={appointment.practitioner?.avatar_url || undefined}
                  alt={`${appointment.practitioner?.first_name} ${appointment.practitioner?.last_name}`}
                  size="lg"
                  className="shrink-0"
                />
                <div className="min-w-0">
                  <p className="font-semibold truncate">
                    Dr. {appointment.practitioner?.first_name} {appointment.practitioner?.last_name}
                  </p>
                  <p className="text-sm text-muted-foreground truncate">
                    {appointment.practitioner?.specialty?.name}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {format(new Date(appointment.scheduled_at), "d MMM à HH:mm", { locale: fr })}
                  </p>
                </div>
              </div>
            </Card>

            <Button 
              className="w-full" 
              size="lg" 
              onClick={handleJoinCall}
              disabled={checkingPermissions || (!cameraOk && !micOk)}
            >
              Rejoindre la consultation
            </Button>
            
            {(!cameraOk || !micOk) && !checkingPermissions && (
              <p className="text-xs text-center text-muted-foreground">
                Autorisez l'accès à votre caméra et microphone dans les paramètres de votre navigateur
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Waiting Room
  if (state === "waiting") {
    return (
      <div className="min-h-dvh bg-background flex flex-col items-center justify-center px-4 py-6">
        <div className="text-center space-y-6 max-w-sm">
          <div className="relative">
            <Avatar
              src={appointment.practitioner?.avatar_url || undefined}
              alt={`${appointment.practitioner?.first_name} ${appointment.practitioner?.last_name}`}
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
              Dr. {appointment.practitioner?.first_name} {appointment.practitioner?.last_name} va vous rejoindre dans un instant
            </p>
          </div>

          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Connexion en cours...</span>
          </div>

          <Button variant="destructive" onClick={handleLeave} className="w-full">
            Quitter la salle d'attente
          </Button>
        </div>
      </div>
    );
  }

  // In Progress
  if (state === "in_progress") {
    return (
      <div className="min-h-dvh bg-black flex flex-col">
        {/* Main Video */}
        <div className="flex-1 relative">
          {/* Remote video (practitioner) */}
          <div className="absolute inset-0 bg-muted flex items-center justify-center">
            <Avatar
              src={appointment.practitioner?.avatar_url || undefined}
              alt="Praticien"
              size="xl"
            />
          </div>

          {/* Local video (patient) */}
          <div className="absolute top-4 right-4 w-24 sm:w-32 aspect-video bg-muted-foreground/20 rounded-lg flex items-center justify-center">
            {videoEnabled ? (
              <span className="text-xs text-white/70">Vous</span>
            ) : (
              <VideoOff className="h-6 w-6 text-white/50" />
            )}
          </div>

          {/* Top bar */}
          <div className="absolute top-4 left-4 right-36 sm:right-40 flex items-center gap-3">
            <div className="bg-black/50 px-3 py-2 rounded-lg">
              <p className="text-white text-sm truncate">
                Dr. {appointment.practitioner?.first_name} {appointment.practitioner?.last_name}
              </p>
            </div>
            <div className="bg-red-500/90 px-3 py-2 rounded-lg">
              <p className="text-white text-sm font-mono">
                {formatDuration(callDuration)}
              </p>
            </div>
          </div>

          {/* Chat panel */}
          {showChat && (
            <div className="absolute bottom-24 left-4 right-4 bg-black/80 rounded-xl p-4 max-h-64 overflow-y-auto">
              <div className="text-white text-sm text-center text-muted-foreground">
                Chat en cours de consultation
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="bg-black/80 px-4 py-4 pb-[calc(1rem+env(safe-area-inset-bottom,0px))]">
          <div className="flex items-center justify-center gap-3 sm:gap-4 flex-wrap">
            <button 
              onClick={() => setAudioEnabled(!audioEnabled)}
              className={cn(
                "p-3 sm:p-4 rounded-full min-w-[48px] min-h-[48px] flex items-center justify-center",
                audioEnabled ? "bg-white/20 text-white" : "bg-destructive text-destructive-foreground"
              )}
            >
              {audioEnabled ? <Mic className="h-5 w-5 sm:h-6 sm:w-6" /> : <MicOff className="h-5 w-5 sm:h-6 sm:w-6" />}
            </button>

            <button 
              onClick={() => setVideoEnabled(!videoEnabled)}
              className={cn(
                "p-3 sm:p-4 rounded-full min-w-[48px] min-h-[48px] flex items-center justify-center",
                videoEnabled ? "bg-white/20 text-white" : "bg-destructive text-destructive-foreground"
              )}
            >
              {videoEnabled ? <Video className="h-5 w-5 sm:h-6 sm:w-6" /> : <VideoOff className="h-5 w-5 sm:h-6 sm:w-6" />}
            </button>

            <button 
              onClick={() => setSpeakerEnabled(!speakerEnabled)}
              className={cn(
                "p-3 sm:p-4 rounded-full min-w-[48px] min-h-[48px] flex items-center justify-center",
                speakerEnabled ? "bg-white/20 text-white" : "bg-destructive text-destructive-foreground"
              )}
            >
              {speakerEnabled ? <Volume2 className="h-5 w-5 sm:h-6 sm:w-6" /> : <VolumeX className="h-5 w-5 sm:h-6 sm:w-6" />}
            </button>

            <button 
              onClick={handleEndCall}
              className="p-3 sm:p-4 rounded-full bg-destructive text-destructive-foreground min-w-[48px] min-h-[48px] flex items-center justify-center"
            >
              <Phone className="h-5 w-5 sm:h-6 sm:w-6 rotate-[135deg]" />
            </button>

            <button 
              onClick={() => setShowChat(!showChat)}
              className={cn(
                "p-3 sm:p-4 rounded-full min-w-[48px] min-h-[48px] flex items-center justify-center",
                showChat ? "bg-primary text-primary-foreground" : "bg-white/20 text-white"
              )}
            >
              <MessageCircle className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>

            <button 
              onClick={() => setScreenShare(!screenShare)}
              className={cn(
                "p-3 sm:p-4 rounded-full min-w-[48px] min-h-[48px] hidden sm:flex items-center justify-center",
                screenShare ? "bg-primary text-primary-foreground" : "bg-white/20 text-white"
              )}
            >
              {screenShare ? <ScreenShareOff className="h-5 w-5 sm:h-6 sm:w-6" /> : <ScreenShare className="h-5 w-5 sm:h-6 sm:w-6" />}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Ended
  return (
    <div className="min-h-dvh bg-background flex flex-col items-center justify-center px-4 py-6">
      <div className="text-center space-y-6 max-w-sm">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30">
          <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
        </div>

        <div>
          <h2 className="text-xl font-semibold">Consultation terminée</h2>
          <p className="text-muted-foreground mt-2">
            Votre téléconsultation avec Dr. {appointment.practitioner?.first_name} {appointment.practitioner?.last_name} est terminée
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Durée : {formatDuration(callDuration)}
          </p>
        </div>

        <Card className="p-4 text-left space-y-3">
          <h3 className="font-semibold">Prochaines étapes</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
              <span>Ordonnance disponible dans vos documents</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
              <span>Compte-rendu envoyé par email</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
              <span>Vous pouvez contacter votre praticien par messagerie</span>
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
