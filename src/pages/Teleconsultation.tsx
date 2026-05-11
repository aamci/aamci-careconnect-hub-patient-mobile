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
  Camera,
  RefreshCw,
  Signal,
  SignalLow,
  SignalMedium,
  SignalHigh
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
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
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

  // In Progress — Fullscreen immersive video
  if (state === "in_progress") {
    return (
      <div className="fixed inset-0 bg-black z-50 flex flex-col">
        {/* Full screen remote video (practitioner) */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Simulated practitioner video — fills entire screen */}
          <div className="w-full h-full bg-gradient-to-b from-gray-700 via-gray-800 to-gray-900 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <Avatar
                src={appointment.practitioner?.avatar_url || undefined}
                alt="Praticien"
                size="xl"
                className="w-32 h-32 sm:w-40 sm:h-40 ring-4 ring-white/20"
              />
              <p className="text-white/80 text-lg font-medium">
                Dr. {appointment.practitioner?.first_name} {appointment.practitioner?.last_name}
              </p>
            </div>
          </div>
        </div>

        {/* Top overlay — name + duration */}
        <div className="absolute top-0 left-0 right-0 pt-[calc(0.75rem+env(safe-area-inset-top,0px))] px-4 pb-3 bg-gradient-to-b from-black/60 to-transparent z-10">
          <div className="flex items-center justify-between">
            <div className="bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-full">
              <p className="text-white text-sm font-medium truncate">
                Dr. {appointment.practitioner?.first_name} {appointment.practitioner?.last_name}
              </p>
            </div>
            <div className="bg-red-500/90 backdrop-blur-sm px-3 py-1.5 rounded-full">
              <p className="text-white text-sm font-mono font-medium">
                {formatDuration(callDuration)}
              </p>
            </div>
          </div>
        </div>

        {/* Local video PiP (patient) — top right */}
        <div className="absolute top-[calc(3.5rem+env(safe-area-inset-top,0px))] right-4 w-28 sm:w-36 aspect-[3/4] bg-gray-900/80 rounded-2xl overflow-hidden shadow-2xl border border-white/10 z-10 flex items-center justify-center">
          {videoEnabled ? (
            <div className="w-full h-full bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center relative">
              <span className="text-xs text-white/60 font-medium">
                {facingMode === "user" ? "Vous" : "Arrière"}
              </span>
              <button
                onClick={() => setFacingMode(f => f === "user" ? "environment" : "user")}
                className="absolute bottom-2 right-2 p-1.5 rounded-full bg-black/50 text-white/80 hover:bg-black/70 transition-all"
                aria-label="Basculer la caméra"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1">
              <VideoOff className="h-6 w-6 text-white/40" />
              <span className="text-[10px] text-white/40">Caméra off</span>
            </div>
          )}
        </div>

        {/* Chat panel */}
        {showChat && (
          <div className="absolute bottom-36 left-4 right-4 bg-black/70 backdrop-blur-md rounded-2xl p-4 max-h-64 overflow-y-auto z-10 border border-white/10">
            <div className="text-white/60 text-sm text-center">
              Chat en cours de consultation
            </div>
          </div>
        )}

        {/* Bottom controls — floating over video */}
        <div className="absolute bottom-0 left-0 right-0 pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))] pt-8 px-6 bg-gradient-to-t from-black/70 to-transparent z-10">
          <div className="flex items-center justify-center gap-4 sm:gap-5">
            <button 
              onClick={() => setAudioEnabled(!audioEnabled)}
              className={cn(
                "p-4 rounded-full min-w-[56px] min-h-[56px] flex items-center justify-center shadow-lg transition-all",
                audioEnabled 
                  ? "bg-white/20 backdrop-blur-sm text-white hover:bg-white/30" 
                  : "bg-destructive text-destructive-foreground"
              )}
            >
              {audioEnabled ? <Mic className="h-6 w-6" /> : <MicOff className="h-6 w-6" />}
            </button>

            <button 
              onClick={() => setVideoEnabled(!videoEnabled)}
              className={cn(
                "p-4 rounded-full min-w-[56px] min-h-[56px] flex items-center justify-center shadow-lg transition-all",
                videoEnabled 
                  ? "bg-white/20 backdrop-blur-sm text-white hover:bg-white/30" 
                  : "bg-destructive text-destructive-foreground"
              )}
            >
              {videoEnabled ? <Video className="h-6 w-6" /> : <VideoOff className="h-6 w-6" />}
            </button>

            <button 
              onClick={handleEndCall}
              className="p-5 rounded-full bg-destructive text-destructive-foreground min-w-[64px] min-h-[64px] flex items-center justify-center shadow-xl transition-transform hover:scale-105"
            >
              <Phone className="h-7 w-7 rotate-[135deg]" />
            </button>

            <button 
              onClick={() => setShowChat(!showChat)}
              className={cn(
                "p-4 rounded-full min-w-[56px] min-h-[56px] flex items-center justify-center shadow-lg transition-all",
                showChat 
                  ? "bg-primary text-primary-foreground" 
                  : "bg-white/20 backdrop-blur-sm text-white hover:bg-white/30"
              )}
            >
              <MessageCircle className="h-6 w-6" />
            </button>

            <button 
              onClick={() => setSpeakerEnabled(!speakerEnabled)}
              className={cn(
                "p-4 rounded-full min-w-[56px] min-h-[56px] flex items-center justify-center shadow-lg transition-all",
                speakerEnabled 
                  ? "bg-white/20 backdrop-blur-sm text-white hover:bg-white/30" 
                  : "bg-destructive text-destructive-foreground"
              )}
            >
              {speakerEnabled ? <Volume2 className="h-6 w-6" /> : <VolumeX className="h-6 w-6" />}
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
