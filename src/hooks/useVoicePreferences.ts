import { useEffect, useState } from "react";

export type VoiceGender = "female-warm" | "female-bright" | "female-calm" | "male-warm" | "male-deep" | "male-neutral";
export type VoiceLang = "fr" | "en" | "es" | "dyu" | "bci";

export interface VoicePreferences {
  voice: VoiceGender;
  lang: VoiceLang;
  speed: number;
}

const KEY = "medisante.voice.prefs";
const DEFAULTS: VoicePreferences = { voice: "female-warm", lang: "fr", speed: 1.0 };

export const VOICE_OPTIONS: { value: VoiceGender; label: string; description: string }[] = [
  { value: "female-warm", label: "Femme — chaleureuse", description: "Naturelle, rassurante (recommandée)" },
  { value: "female-calm", label: "Femme — posée", description: "Douce, apaisante" },
  { value: "female-bright", label: "Femme — dynamique", description: "Vive, expressive" },
  { value: "male-warm", label: "Homme — chaleureux", description: "Amical, professionnel" },
  { value: "male-deep", label: "Homme — profond", description: "Grave, autoritaire" },
  { value: "male-neutral", label: "Homme — neutre", description: "Clair, informatif" },
];

export const LANG_OPTIONS: { value: VoiceLang; label: string; available: boolean }[] = [
  { value: "fr", label: "Français", available: true },
  { value: "en", label: "English", available: true },
  { value: "es", label: "Español", available: true },
  { value: "dyu", label: "Dioula (bientôt)", available: false },
  { value: "bci", label: "Baoulé (bientôt)", available: false },
];

export function useVoicePreferences() {
  const [prefs, setPrefs] = useState<VoicePreferences>(() => {
    if (typeof window === "undefined") return DEFAULTS;
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? { ...DEFAULTS, ...JSON.parse(raw) } : DEFAULTS;
    } catch {
      return DEFAULTS;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(prefs));
    } catch {}
  }, [prefs]);

  return {
    prefs,
    setVoice: (voice: VoiceGender) => setPrefs((p) => ({ ...p, voice })),
    setLang: (lang: VoiceLang) => setPrefs((p) => ({ ...p, lang })),
    setSpeed: (speed: number) => setPrefs((p) => ({ ...p, speed })),
  };
}
