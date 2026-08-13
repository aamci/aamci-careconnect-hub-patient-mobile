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
  SignalHigh,
  Gauge,
  ScrollText,
  ChevronDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/common/Card";
import { Avatar } from "@/components/common/Avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { useAppointments } from "@/hooks/useAppointments";
import { useCallLog } from "@/hooks/useCallLog";
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
  const [networkQuality, setNetworkQuality] = useState<"good" | "fair" | "poor">("good");
  const [mainView, setMainView] = useState<"remote" | "local">("remote");
  const [micLevel, setMicLevel] = useState(0);
  const [micGain, setMicGain] = useState(100);
  const [lowBandwidth, setLowBandwidth] = useState(false);
  const [autoLowBandwidth, setAutoLowBandwidth] = useState(true);
  const [videoProfile, setVideoProfile] = useState<"hd" | "sd" | "low">("hd");
  const [netStats, setNetStats] = useState<{ rtt?: number; downlink?: number }>({});
  const [showLog, setShowLog] = useState(false);
  const [mediaRecovering, setMediaRecovering] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const recoveryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const recoveryAttemptRef = useRef(0);
  const callTimerRef = useRef<NodeJS.Timeout | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const localVideoMainRef = useRef<HTMLVideoElement | null>(null);
  const localVideoPipRef = useRef<HTMLVideoElement | null>(null);
  const previewVideoRef = useRef<HTMLVideoElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const rafRef = useRef<number | null>(null);
  const micGainRef = useRef(1);

  const { data: appointments, isLoading } = useAppointments();
  const appointment = appointments?.find((a) => a.id === id);
  const { entries: callLog, log, startSession, saveSession } = useCallLog(id);

  const attachStreamToVideos = (stream: MediaStream | null) => {
    [previewVideoRef.current, localVideoMainRef.current, localVideoPipRef.current].forEach(v => {
      if (v && v.srcObject !== stream) {
        v.srcObject = stream;
        if (stream) v.play().catch(() => {});
      }
    });
  };

  // Profils vidéo — latence/rendu adaptés à la bande passante
  const VIDEO_PROFILES = {
    hd: { width: 1280, height: 720, frameRate: 30 },
    sd: { width: 640, height: 360, frameRate: 24 },
    low: { width: 320, height: 240, frameRate: 15 },
  } as const;

  const applyVideoProfile = async (profile: "hd" | "sd" | "low") => {
    const track = localStreamRef.current?.getVideoTracks()[0];
    if (!track) return;
    const p = VIDEO_PROFILES[profile];
    try {
      await track.applyConstraints({
        width: { ideal: p.width },
        height: { ideal: p.height },
        frameRate: { ideal: p.frameRate, max: p.frameRate },
      });
      setVideoProfile(profile);
      log("Profil vidéo appliqué", `${p.width}x${p.height} @ ${p.frameRate}fps`);
    } catch (e) {
      log("Échec du changement de profil vidéo", String(e), "warn");
    }
  };

  // Surveillance des pistes : relance silencieuse si une piste tombe
  const watchTracks = (stream: MediaStream | null) => {
    stream?.getTracks().forEach((t) => {
      t.onended = () => {
        log(`Piste ${t.kind} interrompue`, undefined, "warn");
        scheduleRecovery();
      };
    });
  };

  const acquireStream = async (mode: "user" | "environment" = facingMode) => {
    // Stop previous tracks
    localStreamRef.current?.getTracks().forEach(t => t.stop());
    localStreamRef.current = null;

    const p = VIDEO_PROFILES[lowBandwidth ? "low" : videoProfile];
    let stream: MediaStream | null = null;
    let camOk = false;
    let micOkLocal = false;
    // Tentatives progressives : contraintes idéales → contraintes minimales → audio seul
    const attempts: MediaStreamConstraints[] = [
      {
        video: {
          facingMode: { ideal: mode },
          width: { ideal: p.width },
          height: { ideal: p.height },
          frameRate: { ideal: p.frameRate, max: p.frameRate },
        },
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      },
      { video: { facingMode: { ideal: mode } }, audio: true },
      { video: true, audio: true },
      { video: true, audio: false },
    ];

    for (const constraints of attempts) {
      try {
        stream = await navigator.mediaDevices.getUserMedia(constraints);
        camOk = stream.getVideoTracks().length > 0;
        micOkLocal = stream.getAudioTracks().length > 0;
        log("Flux média acquis", `caméra: ${camOk ? "ok" : "ko"}, micro: ${micOkLocal ? "ok" : "ko"}`);
        break;
      } catch (err) {
        stream = null;
        log("Tentative d'accès média échouée", String(err), "warn");
      }
    }

    if (!stream) {
      // Repli audio uniquement
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        micOkLocal = !!stream?.getAudioTracks().length;
        log("Repli audio uniquement", undefined, "warn");
      } catch (err2) {
        stream = null;
        log("Aucun périphérique disponible", String(err2), "error");
      }
    }

    localStreamRef.current = stream;
    setCameraOk(camOk);
    setMicOk(micOkLocal);
    // apply current toggles
    stream?.getVideoTracks().forEach(t => (t.enabled = videoEnabled));
    stream?.getAudioTracks().forEach(t => (t.enabled = audioEnabled));
    watchTracks(stream);
    attachStreamToVideos(stream);
    return stream;
  };

  // Récupération automatique et progressive (backoff), sans bloquer l'interface
  const scheduleRecovery = () => {
    if (recoveryTimerRef.current) return;
    const attempt = recoveryAttemptRef.current;
    if (attempt >= 6) {
      setMediaRecovering(false);
      log("Récupération média abandonnée après plusieurs tentatives", undefined, "error");
      return;
    }
    const delay = Math.min(8000, 800 * Math.pow(2, attempt));
    recoveryAttemptRef.current = attempt + 1;
    setMediaRecovering(true);
    recoveryTimerRef.current = setTimeout(async () => {
      recoveryTimerRef.current = null;
      const stream = await acquireStream();
      const ok = !!stream && (stream.getVideoTracks().length > 0 || stream.getAudioTracks().length > 0);
      if (ok) {
        recoveryAttemptRef.current = 0;
        setMediaRecovering(false);
        log("Flux média rétabli automatiquement");
      } else {
        scheduleRecovery();
      }
    }, delay);
  };

  useEffect(() => {
    (async () => {
      setCheckingPermissions(true);
      const stream = await acquireStream();
      if (!stream) scheduleRecovery();
      setCheckingPermissions(false);
    })();
    return () => {
      localStreamRef.current?.getTracks().forEach(t => t.stop());
      localStreamRef.current = null;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (recoveryTimerRef.current) clearTimeout(recoveryTimerRef.current);
      audioCtxRef.current?.close().catch(() => {});
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-négociation sur changement de périphérique ou retour d'arrière-plan
  useEffect(() => {
    const onDeviceChange = () => {
      const s = localStreamRef.current;
      const alive = s?.getTracks().some(t => t.readyState === "live");
      if (!alive) scheduleRecovery();
    };
    const onVisibility = () => {
      if (document.visibilityState !== "visible") return;
      const s = localStreamRef.current;
      const alive = s?.getTracks().some(t => t.readyState === "live");
      if (!alive) scheduleRecovery();
      else attachStreamToVideos(s);
    };
    navigator.mediaDevices?.addEventListener?.("devicechange", onDeviceChange);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      navigator.mediaDevices?.removeEventListener?.("devicechange", onDeviceChange);
      document.removeEventListener("visibilitychange", onVisibility);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-attach stream when video elements mount (state transitions)
  useEffect(() => {
    attachStreamToVideos(localStreamRef.current);
    const raf = requestAnimationFrame(() => attachStreamToVideos(localStreamRef.current));
    return () => cancelAnimationFrame(raf);
  }, [state, mainView, videoEnabled]);

  // Apply toggles to tracks
  useEffect(() => {
    localStreamRef.current?.getVideoTracks().forEach(t => (t.enabled = videoEnabled));
    log(videoEnabled ? "Caméra activée" : "Caméra coupée");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoEnabled]);
  useEffect(() => {
    localStreamRef.current?.getAudioTracks().forEach(t => (t.enabled = audioEnabled));
    log(audioEnabled ? "Micro activé" : "Micro coupé (sourdine)");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audioEnabled]);

  // Vu-mètre micro (niveau d'entrée en temps réel)
  useEffect(() => {
    micGainRef.current = micGain / 100;
  }, [micGain]);

  useEffect(() => {
    const stream = localStreamRef.current;
    if (!micOk || !stream || (state !== "in_progress" && state !== "checking")) return;
    let cancelled = false;
    try {
      const Ctx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new Ctx();
      audioCtxRef.current = ctx;
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 512;
      source.connect(analyser);
      const data = new Uint8Array(analyser.frequencyBinCount);
      const tick = () => {
        if (cancelled) return;
        analyser.getByteTimeDomainData(data);
        let sum = 0;
        for (let i = 0; i < data.length; i++) {
          const v = (data[i] - 128) / 128;
          sum += v * v;
        }
        const rms = Math.sqrt(sum / data.length);
        const level = audioEnabled ? Math.min(100, rms * 300 * micGainRef.current) : 0;
        setMicLevel(level);
        rafRef.current = requestAnimationFrame(tick);
      };
      tick();
    } catch {
      /* AudioContext indisponible */
    }
    return () => {
      cancelled = true;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      audioCtxRef.current?.close().catch(() => {});
      audioCtxRef.current = null;
    };
  }, [micOk, state, audioEnabled]);



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

  // Network quality monitoring during call
  useEffect(() => {
    if (state !== "in_progress") return;

    const evaluate = () => {
      // Prefer Network Information API when available
      const conn = (navigator as any).connection;
      if (conn && (conn.effectiveType || typeof conn.downlink === "number")) {
        const et = conn.effectiveType as string | undefined;
        const dl = conn.downlink as number | undefined;
        const rtt = conn.rtt as number | undefined;
        setNetStats({ rtt, downlink: dl });
        if (et === "4g" && (dl ?? 5) >= 2 && (rtt ?? 100) < 300) {
          setNetworkQuality("good");
        } else if (et === "3g" || ((dl ?? 1) >= 0.7)) {
          setNetworkQuality("fair");
        } else {
          setNetworkQuality("poor");
        }
        return;
      }
      // Fallback: simulate with small variations
      const r = Math.random();
      setNetworkQuality(r < 0.7 ? "good" : r < 0.92 ? "fair" : "poor");
    };

    evaluate();
    const interval = setInterval(evaluate, 5000);

    const conn = (navigator as any).connection;
    conn?.addEventListener?.("change", evaluate);

    return () => {
      clearInterval(interval);
      conn?.removeEventListener?.("change", evaluate);
    };
  }, [state]);

  // Dégradation / restauration automatique selon la qualité réseau
  useEffect(() => {
    if (state !== "in_progress" || !autoLowBandwidth) return;
    if (networkQuality === "poor" && !lowBandwidth) {
      setLowBandwidth(true);
      log("Bande passante faible détectée — dégradation automatique", undefined, "warn");
    } else if (networkQuality === "good" && lowBandwidth) {
      setLowBandwidth(false);
      log("Réseau rétabli — qualité vidéo restaurée");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [networkQuality, state, autoLowBandwidth]);

  // Application du profil vidéo
  useEffect(() => {
    if (state !== "in_progress") return;
    const target = lowBandwidth ? "low" : networkQuality === "fair" ? "sd" : "hd";
    if (target !== videoProfile) applyVideoProfile(target);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lowBandwidth, networkQuality, state]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const enterFullscreen = async () => {
    if (document.fullscreenElement) return true;
    const el: any = document.documentElement;
    const req = el.requestFullscreen || el.webkitRequestFullscreen || el.webkitEnterFullscreen;
    try {
      await req?.call(el, { navigationUI: "hide" });
      return !!document.fullscreenElement;
    } catch {
      return false;
    }
  };

  // Suivi de l'état plein écran (sans glitch lors des bascules)
  useEffect(() => {
    const onChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onChange);
    document.addEventListener("webkitfullscreenchange", onChange as EventListener);
    onChange();
    return () => {
      document.removeEventListener("fullscreenchange", onChange);
      document.removeEventListener("webkitfullscreenchange", onChange as EventListener);
    };
  }, []);

  // Garantit le plein écran au démarrage effectif de l'appel
  useEffect(() => {
    if (state !== "in_progress" || isFullscreen) return;
    enterFullscreen().then((ok) => {
      if (!ok) log("Plein écran non accordé — bouton disponible", undefined, "warn");
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  const handleJoinCall = async () => {
    if (!localStreamRef.current) await acquireStream();
    startSession();
    log("Appel démarré");
    // Plein écran demandé pendant le geste utilisateur (obligatoire sur mobile)
    const ok = await enterFullscreen();
    log(ok ? "Passage en plein écran" : "Plein écran indisponible", undefined, ok ? "info" : "warn");
    setState("waiting");
    setTimeout(() => {
      setState("in_progress");
      log("Praticien connecté");
    }, 3000);
  };


  const handleEndCall = () => {
    if (callTimerRef.current) {
      clearInterval(callTimerRef.current);
    }
    localStreamRef.current?.getTracks().forEach(t => t.stop());
    localStreamRef.current = null;
    if (recoveryTimerRef.current) clearTimeout(recoveryTimerRef.current);
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    const finalEntry = { at: new Date().toISOString(), level: "info" as const, event: "Appel terminé", detail: `Durée ${formatDuration(callDuration)}` };
    saveSession(callDuration, [...callLog, finalEntry]);
    log("Appel terminé", `Durée ${formatDuration(callDuration)}`);
    setState("ended");
  };

  const handleLeave = () => {
    localStreamRef.current?.getTracks().forEach(t => t.stop());
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    navigate("/appointments");
  };

  const handleRetryPermissions = async () => {
    setCheckingPermissions(true);
    log("Nouvelle demande d'autorisations");
    recoveryAttemptRef.current = 0;
    const stream = await acquireStream();
    if (!stream) scheduleRecovery();
    setCheckingPermissions(false);
  };

  const handleSwitchCamera = async () => {
    const next = facingMode === "user" ? "environment" : "user";
    setFacingMode(next);
    log("Bascule caméra", next === "user" ? "avant" : "arrière");
    const stream = await acquireStream(next);
    if (!stream) {
      setFacingMode(facingMode);
      scheduleRecovery();
    }
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
              <video
                ref={previewVideoRef}
                autoPlay
                playsInline
                muted
                className={cn(
                  "absolute inset-0 w-full h-full object-cover",
                  (!cameraOk || !videoEnabled) && "hidden",
                  facingMode === "user" && "scale-x-[-1]"
                )}
              />
              {(!cameraOk || !videoEnabled) && (
                <div className="text-center relative z-10">
                  <Camera className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    {cameraOk ? "Caméra désactivée" : "Aperçu vidéo"}
                  </p>
                </div>
              )}
              {/* Controls */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-3 z-10">
                <button
                  onClick={() => setVideoEnabled(!videoEnabled)}
                  className={cn(
                    "p-3 rounded-full min-w-[48px] min-h-[48px] flex items-center justify-center backdrop-blur-sm",
                    videoEnabled ? "bg-white/80 text-foreground" : "bg-destructive text-destructive-foreground"
                  )}
                >
                  {videoEnabled ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
                </button>
                <button
                  onClick={() => setAudioEnabled(!audioEnabled)}
                  className={cn(
                    "p-3 rounded-full min-w-[48px] min-h-[48px] flex items-center justify-center backdrop-blur-sm",
                    audioEnabled ? "bg-white/80 text-foreground" : "bg-destructive text-destructive-foreground"
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
        {/* Main tile — les deux vues restent montées : bascule sans glitch */}
        <div className="absolute inset-0 overflow-hidden bg-black">
          {/* Vue praticien */}
          <div
            className={cn(
              "absolute inset-0 bg-gradient-to-b from-gray-700 via-gray-800 to-gray-900 flex items-center justify-center transition-opacity duration-200",
              mainView === "remote" ? "opacity-100" : "opacity-0 pointer-events-none"
            )}
          >
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
          {/* Vue locale */}
          <div
            className={cn(
              "absolute inset-0 transition-opacity duration-200",
              mainView === "local" ? "opacity-100" : "opacity-0 pointer-events-none"
            )}
          >
            <video
              ref={localVideoMainRef}
              autoPlay
              playsInline
              muted
              className={cn(
                "absolute inset-0 w-full h-full object-cover",
                (!cameraOk || !videoEnabled) && "invisible",
                facingMode === "user" && "scale-x-[-1]"
              )}
            />
            {(!cameraOk || !videoEnabled) && (
              <div className="absolute inset-0 bg-gradient-to-b from-gray-700 to-gray-900 flex flex-col items-center justify-center gap-2">
                <VideoOff className="h-12 w-12 text-white/40" />
                <span className="text-white/60 text-sm">Caméra désactivée</span>
              </div>
            )}
          </div>
        </div>

        {/* Top overlay — name + duration */}
        <div className="absolute top-0 left-0 right-0 pt-[calc(0.75rem+env(safe-area-inset-top,0px))] px-4 pb-3 bg-gradient-to-b from-black/60 to-transparent z-10">
          <div className="flex items-center justify-between gap-2">
            <div className="bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-full min-w-0">
              <p className="text-white text-sm font-medium truncate">
                Dr. {appointment.practitioner?.first_name} {appointment.practitioner?.last_name}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <div
                className={cn(
                  "flex items-center gap-1.5 backdrop-blur-sm px-2.5 py-1.5 rounded-full",
                  networkQuality === "good" && "bg-emerald-500/90",
                  networkQuality === "fair" && "bg-amber-500/90",
                  networkQuality === "poor" && "bg-red-500/90"
                )}
                aria-label={`Qualité réseau: ${networkQuality}`}
              >
                {networkQuality === "good" ? (
                  <SignalHigh className="h-3.5 w-3.5 text-white" />
                ) : networkQuality === "fair" ? (
                  <SignalMedium className="h-3.5 w-3.5 text-white" />
                ) : (
                  <SignalLow className="h-3.5 w-3.5 text-white" />
                )}
                <span className="text-white text-xs font-medium hidden sm:inline">
                  {networkQuality === "good" ? "Bonne" : networkQuality === "fair" ? "Moyenne" : "Faible"}
                  {typeof netStats.rtt === "number" && ` · ${netStats.rtt}ms`}
                </span>
              </div>
              <div className="bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-full">
                <p className="text-white text-sm font-mono font-medium">
                  {formatDuration(callDuration)}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-2">
            {lowBandwidth && (
              <span className="flex items-center gap-1 bg-amber-500/90 text-white text-[10px] font-medium px-2 py-1 rounded-full">
                <Gauge className="h-3 w-3" /> Mode bande passante faible
              </span>
            )}
            {!audioEnabled && (
              <span className="flex items-center gap-1 bg-destructive text-destructive-foreground text-[10px] font-medium px-2 py-1 rounded-full">
                <MicOff className="h-3 w-3" /> Micro coupé
              </span>
            )}
            <span className="bg-black/40 backdrop-blur-sm text-white/70 text-[10px] px-2 py-1 rounded-full">
              {videoProfile === "hd" ? "720p 30fps" : videoProfile === "sd" ? "360p 24fps" : "240p 15fps"}
            </span>
          </div>
        </div>


        {/* Retour discret : uniquement en cas d'incident média */}
        {mediaRecovering && (
          <div className="absolute top-[calc(6.5rem+env(safe-area-inset-top,0px))] left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 bg-black/60 backdrop-blur-sm text-white/80 text-[11px] px-3 py-1.5 rounded-full">
            <Loader2 className="h-3 w-3 animate-spin" />
            Reconnexion du média…
          </div>
        )}

        {/* Bouton plein écran discret si l'utilisateur en est sorti */}
        {!isFullscreen && (
          <button
            type="button"
            onClick={() => enterFullscreen()}
            className="absolute top-[calc(0.9rem+env(safe-area-inset-top,0px))] left-1/2 -translate-x-1/2 z-20 bg-black/50 backdrop-blur-sm text-white/80 text-[11px] px-3 py-1.5 rounded-full"
          >
            Plein écran
          </button>
        )}

        {/* PiP tile — the OTHER participant. Tap to swap. Les deux vues restent montées. */}
        <button
          type="button"
          onClick={() => setMainView(v => (v === "remote" ? "local" : "remote"))}
          className="absolute top-[calc(3.5rem+env(safe-area-inset-top,0px))] right-4 w-28 sm:w-36 aspect-[3/4] bg-gray-900/80 rounded-2xl overflow-hidden shadow-2xl border border-white/10 z-10 flex items-center justify-center active:scale-95 transition-transform"
          aria-label="Basculer la vue principale"
        >
          {/* PiP local (patient) */}
          <div
            className={cn(
              "absolute inset-0 transition-opacity duration-200",
              mainView === "remote" ? "opacity-100" : "opacity-0 pointer-events-none"
            )}
          >
            <video
              ref={localVideoPipRef}
              autoPlay
              playsInline
              muted
              className={cn(
                "absolute inset-0 w-full h-full object-cover",
                (!cameraOk || !videoEnabled) && "invisible",
                facingMode === "user" && "scale-x-[-1]"
              )}
            />
            {(!cameraOk || !videoEnabled) && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
                <VideoOff className="h-6 w-6 text-white/40" />
                <span className="text-[10px] text-white/40">Caméra off</span>
              </div>
            )}
            {cameraOk && videoEnabled && mainView === "remote" && (
              <span
                onClick={(e) => { e.stopPropagation(); handleSwitchCamera(); }}
                className="absolute bottom-2 right-2 p-1.5 rounded-full bg-black/50 text-white/80 hover:bg-black/70 transition-all cursor-pointer"
                aria-label="Basculer la caméra"
                role="button"
              >
                <RefreshCw className="h-4 w-4" />
              </span>
            )}
          </div>
          {/* PiP praticien */}
          <div
            className={cn(
              "absolute inset-0 bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center transition-opacity duration-200",
              mainView === "local" ? "opacity-100" : "opacity-0 pointer-events-none"
            )}
          >
            <Avatar
              src={appointment.practitioner?.avatar_url || undefined}
              alt="Praticien"
              size="md"
              className="ring-2 ring-white/20"
            />
          </div>
        </button>


        {/* Chat panel — messagerie réelle, plein écran au-dessus des contrôles */}
        <CallChatPanel
          open={showChat}
          onClose={() => setShowChat(false)}
          patientProfileId={appointment.patient_profile_id}
          practitionerId={appointment.practitioner_id}
          practitionerName={`Dr. ${appointment.practitioner?.first_name ?? ""} ${appointment.practitioner?.last_name ?? ""}`.trim()}
          appointmentId={appointment.id}
        />


        {/* Bottom controls — floating over video */}
        <div className="absolute bottom-0 left-0 right-0 pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))] pt-8 px-6 bg-gradient-to-t from-black/70 to-transparent z-10">
          {/* Vu-mètre micro + volume d'entrée */}
          <div className="mx-auto mb-4 max-w-xs bg-black/40 backdrop-blur-md rounded-2xl px-4 py-3 border border-white/10">
            <div className="flex items-center gap-3">
              {audioEnabled ? <Mic className="h-4 w-4 text-white/80 shrink-0" /> : <MicOff className="h-4 w-4 text-destructive shrink-0" />}
              <div className="flex-1 h-1.5 rounded-full bg-white/15 overflow-hidden" aria-label="Niveau du micro">
                <div
                  className={cn("h-full rounded-full transition-all duration-75", audioEnabled ? "bg-emerald-400" : "bg-white/20")}
                  style={{ width: `${Math.round(micLevel)}%` }}
                />
              </div>
              <span className="text-[10px] text-white/60 w-9 text-right tabular-nums">{micGain}%</span>
            </div>
            <Slider
              value={[micGain]}
              onValueChange={(v) => setMicGain(v[0])}
              min={0}
              max={200}
              step={5}
              className="mt-3"
              aria-label="Volume du micro"
            />
          </div>
          <div className="flex items-center justify-center gap-4 sm:gap-5">
            <button 
              onClick={() => setAudioEnabled(!audioEnabled)}
              aria-pressed={!audioEnabled}
              aria-label={audioEnabled ? "Couper le micro" : "Réactiver le micro"}
              className={cn(
                "relative p-4 rounded-full min-w-[56px] min-h-[56px] flex items-center justify-center shadow-lg transition-all",
                audioEnabled 
                  ? "bg-white/20 backdrop-blur-sm text-white hover:bg-white/30" 
                  : "bg-destructive text-destructive-foreground"
              )}
            >
              {audioEnabled ? <Mic className="h-6 w-6" /> : <MicOff className="h-6 w-6" />}
              {audioEnabled && micLevel > 8 && (
                <span className="absolute inset-0 rounded-full ring-2 ring-emerald-400/80 animate-pulse" />
              )}
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
    <div className="min-h-dvh bg-background flex flex-col items-center justify-center px-4 py-6 overflow-y-auto">
      <div className="text-center space-y-6 max-w-sm w-full my-auto">

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

        {/* Journal d'appel */}
        <Card className="p-4 text-left">
          <button
            type="button"
            onClick={() => setShowLog((v) => !v)}
            className="w-full flex items-center justify-between gap-2 min-h-[44px]"
            aria-expanded={showLog}
          >
            <span className="flex items-center gap-2 font-semibold">
              <ScrollText className="h-4 w-4 text-primary" />
              Journal d'appel
            </span>
            <span className="flex items-center gap-2 text-xs text-muted-foreground">
              {callLog.length} événements
              <ChevronDown className={cn("h-4 w-4 transition-transform", showLog && "rotate-180")} />
            </span>
          </button>
          {showLog && (
            <div className="mt-3 max-h-64 overflow-y-auto space-y-2 border-t pt-3">
              {callLog.length === 0 && (
                <p className="text-xs text-muted-foreground">Aucun événement enregistré.</p>
              )}
              {callLog.map((e, i) => (
                <div key={i} className="flex items-start gap-2 text-xs">
                  <span className="font-mono text-muted-foreground shrink-0">
                    {format(new Date(e.at), "HH:mm:ss")}
                  </span>
                  <span
                    className={cn(
                      "h-1.5 w-1.5 rounded-full mt-1.5 shrink-0",
                      e.level === "error" ? "bg-destructive" : e.level === "warn" ? "bg-amber-500" : "bg-primary"
                    )}
                  />
                  <span className="min-w-0">
                    <span className="font-medium">{e.event}</span>
                    {e.detail && <span className="text-muted-foreground block break-words">{e.detail}</span>}
                  </span>
                </div>
              ))}
            </div>
          )}
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
