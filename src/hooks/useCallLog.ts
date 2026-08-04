import { useCallback, useRef, useState } from "react";

export type CallLogLevel = "info" | "warn" | "error";

export interface CallLogEntry {
  at: string; // ISO timestamp
  level: CallLogLevel;
  event: string;
  detail?: string;
}

export interface CallLogSession {
  appointmentId: string;
  startedAt: string;
  endedAt?: string;
  durationSeconds?: number;
  entries: CallLogEntry[];
}

const STORAGE_KEY = "medisante.callLogs";
const MAX_SESSIONS = 20;

export function readCallLogs(): CallLogSession[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CallLogSession[]) : [];
  } catch {
    return [];
  }
}

function persist(sessions: CallLogSession[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions.slice(0, MAX_SESSIONS)));
  } catch {
    /* quota — ignore */
  }
}

/**
 * Journal d'appel : trace le déroulé d'une téléconsultation
 * (début/fin, durée, statut audio/vidéo, erreurs) pour le support.
 */
export function useCallLog(appointmentId: string | undefined) {
  const [entries, setEntries] = useState<CallLogEntry[]>([]);
  const startedAtRef = useRef<string | null>(null);

  const log = useCallback((event: string, detail?: string, level: CallLogLevel = "info") => {
    const entry: CallLogEntry = { at: new Date().toISOString(), level, event, detail };
    setEntries((prev) => [...prev, entry]);
    return entry;
  }, []);

  const startSession = useCallback(() => {
    startedAtRef.current = new Date().toISOString();
  }, []);

  const saveSession = useCallback(
    (durationSeconds: number, finalEntries?: CallLogEntry[]) => {
      if (!appointmentId) return;
      const session: CallLogSession = {
        appointmentId,
        startedAt: startedAtRef.current ?? new Date().toISOString(),
        endedAt: new Date().toISOString(),
        durationSeconds,
        entries: finalEntries ?? entries,
      };
      persist([session, ...readCallLogs()]);
    },
    [appointmentId, entries]
  );

  return { entries, log, startSession, saveSession };
}
