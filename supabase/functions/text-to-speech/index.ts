import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Curated natural voices from OpenAI (via Lovable AI Gateway) — Siri-quality
// alloy=neutral, nova=female warm, shimmer=female bright, sage=female calm
// echo=male warm, onyx=male deep, ash=male neutral, ballad=male expressive
const VOICE_MAP: Record<string, string> = {
  "female-warm": "nova",
  "female-bright": "shimmer",
  "female-calm": "sage",
  "male-warm": "echo",
  "male-deep": "onyx",
  "male-neutral": "ash",
};

const LANG_INSTRUCTIONS: Record<string, string> = {
  fr: "Parle en français naturel, avec une prononciation parisienne claire, chaleureuse et professionnelle. Ton posé, bienveillant, comme un soignant qui rassure.",
  en: "Speak in natural English with a warm, professional, reassuring tone.",
  es: "Habla en español natural, con tono cálido, profesional y tranquilizador.",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { text, voice = "female-warm", lang = "fr", speed = 1.0 } = await req.json();

    if (!text || typeof text !== "string") {
      return new Response(JSON.stringify({ error: "text is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Unsupported languages fallback with friendly error
    if (["dyu", "bci"].includes(lang)) {
      return new Response(
        JSON.stringify({
          error: "language_unsupported",
          message: "Le dioula et le baoulé ne sont pas encore disponibles en synthèse vocale. Voix française utilisée par défaut.",
        }),
        { status: 501, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "LOVABLE_API_KEY missing" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Chunk very long text (roughly under 3500 chars per request)
    const MAX = 3500;
    const input = text.length > MAX ? text.slice(0, MAX) : text;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/audio/speech", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/gpt-4o-mini-tts",
        input,
        voice: VOICE_MAP[voice] ?? "nova",
        instructions: LANG_INSTRUCTIONS[lang] ?? LANG_INSTRUCTIONS.fr,
        speed: Math.max(0.5, Math.min(1.5, Number(speed) || 1.0)),
        response_format: "mp3",
      }),
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => "");
      console.error("TTS gateway error:", response.status, errText);
      return new Response(
        JSON.stringify({ error: "tts_failed", status: response.status, details: errText }),
        { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "audio/mpeg" },
    });
  } catch (e) {
    console.error("TTS error:", e);
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
