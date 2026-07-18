import { useRef, useState } from "react";
import { Volume2, Pause, Loader2, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useVoicePreferences, VOICE_OPTIONS, LANG_OPTIONS } from "@/hooks/useVoicePreferences";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const TTS_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/text-to-speech`;

interface AudioPlayerProps {
  text: string;
  label?: string;
  compact?: boolean;
  className?: string;
}

export function AudioPlayer({ text, label = "Écouter", compact = false, className }: AudioPlayerProps) {
  const { prefs, setVoice, setLang, setSpeed } = useVoicePreferences();
  const [loading, setLoading] = useState(false);
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const urlRef = useRef<string | null>(null);

  const stop = () => {
    audioRef.current?.pause();
    if (audioRef.current) audioRef.current.currentTime = 0;
    setPlaying(false);
  };

  const play = async () => {
    if (playing) {
      stop();
      return;
    }
    if (!text.trim()) return;

    // Warn if unsupported language selected
    if (prefs.lang === "dyu" || prefs.lang === "bci") {
      toast.info("Cette langue arrive bientôt. Lecture en français à la place.");
    }

    setLoading(true);
    try {
      const res = await fetch(TTS_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          text,
          voice: prefs.voice,
          lang: prefs.lang === "dyu" || prefs.lang === "bci" ? "fr" : prefs.lang,
          speed: prefs.speed,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        if (res.status === 402) {
          toast.error("Crédits IA épuisés. Ajoutez du crédit pour continuer à utiliser la lecture audio.");
        } else if (res.status === 429) {
          toast.error("Trop de requêtes. Réessayez dans un instant.");
        } else {
          toast.error(err.message || err.error || "Impossible de lire l'audio");
        }
        return;
      }

      const blob = await res.blob();
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
      urlRef.current = URL.createObjectURL(blob);

      const audio = new Audio(urlRef.current);
      audio.playbackRate = prefs.speed;
      audioRef.current = audio;
      audio.onended = () => setPlaying(false);
      audio.onerror = () => {
        setPlaying(false);
        toast.error("Erreur de lecture audio");
      };
      await audio.play();
      setPlaying(true);
    } catch (e) {
      console.error("TTS play error", e);
      toast.error("Erreur lors de la génération audio");
    } finally {
      setLoading(false);
    }
  };

  const Icon = loading ? Loader2 : playing ? Pause : Volume2;

  if (compact) {
    return (
      <div className={cn("inline-flex items-center gap-1", className)}>
        <Button
          type="button"
          size="icon-sm"
          variant="ghost"
          onClick={play}
          disabled={loading}
          aria-label={playing ? "Arrêter la lecture" : "Écouter"}
          className="h-8 w-8"
        >
          <Icon className={cn("h-4 w-4", loading && "animate-spin")} />
        </Button>
        <VoiceSettingsMenu {...{ prefs, setVoice, setLang, setSpeed }} />
      </div>
    );
  }

  return (
    <div className={cn("inline-flex items-center gap-1 rounded-full bg-primary/10 pl-1 pr-1 py-0.5", className)}>
      <Button
        type="button"
        size="sm"
        variant="ghost"
        onClick={play}
        disabled={loading}
        aria-label={playing ? "Arrêter la lecture" : label}
        className="h-8 rounded-full text-primary hover:bg-primary/15 gap-1.5 px-2.5"
      >
        <Icon className={cn("h-4 w-4", loading && "animate-spin")} />
        <span className="text-xs font-medium">{loading ? "Génération…" : playing ? "Arrêter" : label}</span>
      </Button>
      <VoiceSettingsMenu {...{ prefs, setVoice, setLang, setSpeed }} />
    </div>
  );
}

function VoiceSettingsMenu({
  prefs,
  setVoice,
  setLang,
  setSpeed,
}: ReturnType<typeof useVoicePreferences>) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="icon-sm" variant="ghost" className="h-7 w-7 rounded-full" aria-label="Paramètres voix">
          <Settings2 className="h-3.5 w-3.5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64 max-h-[70vh] overflow-y-auto">
        <DropdownMenuLabel>Voix</DropdownMenuLabel>
        {VOICE_OPTIONS.map((v) => (
          <DropdownMenuItem
            key={v.value}
            onClick={() => setVoice(v.value)}
            className={cn("flex-col items-start gap-0.5", prefs.voice === v.value && "bg-primary/10")}
          >
            <span className="text-sm font-medium">{v.label}</span>
            <span className="text-[11px] text-muted-foreground">{v.description}</span>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Langue</DropdownMenuLabel>
        {LANG_OPTIONS.map((l) => (
          <DropdownMenuItem
            key={l.value}
            onClick={() => setLang(l.value)}
            disabled={!l.available}
            className={cn(prefs.lang === l.value && "bg-primary/10")}
          >
            {l.label}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Vitesse : {prefs.speed.toFixed(2)}×</DropdownMenuLabel>
        <div className="px-2 py-1.5">
          <input
            type="range"
            min={0.75}
            max={1.25}
            step={0.05}
            value={prefs.speed}
            onChange={(e) => setSpeed(parseFloat(e.target.value))}
            className="w-full accent-primary"
            aria-label="Vitesse de lecture"
          />
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
