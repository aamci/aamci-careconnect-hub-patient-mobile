import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `Tu rédiges des comptes rendus de consultation destinés au PATIENT ADULTE (plateforme MédiSanté, France/Côte d'Ivoire).

RÈGLES ABSOLUES :
- Tu ne poses AUCUN diagnostic nouveau et ne prescris AUCUN traitement.
- Tu te limites STRICTEMENT aux informations fournies (motif, notes, échanges). Tu n'inventes jamais de symptôme, de résultat ou de médicament.
- Si une information manque, tu restes général ou tu l'omets ; tu n'extrapoles pas.
- Langage clair, accessible, vouvoiement, en français.
- Toujours rappeler que ce compte rendu est un récapitulatif informatif qui ne remplace pas le document officiel du praticien.
- Public exclusivement adulte : jamais de contexte parental ou pédiatrique.

Tu réponds UNIQUEMENT avec un objet JSON valide, sans texte autour, au format :
{"title":"...","summary":"...","reason":"...","symptoms":"...","observations":"...","recommendations":"...","treatment":"...","follow_up":"..."}
Chaque champ est du texte simple (2 à 6 phrases max), ou une chaîne vide si l'information n'est pas disponible.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { appointment, transcript } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const practitioner = appointment?.practitioner
      ? `Dr ${appointment.practitioner.first_name} ${appointment.practitioner.last_name}${
          appointment.practitioner.specialty?.name ? ` (${appointment.practitioner.specialty.name})` : ""
        }`
      : "Praticien";

    const conversation = Array.isArray(transcript) && transcript.length
      ? transcript
          .map((m: { sender: string; content: string }) =>
            `${m.sender === "patient" ? "Patient" : m.sender === "practitioner" ? "Praticien" : "Système"} : ${m.content}`
          )
          .join("\n")
      : "Aucun échange écrit disponible.";

    const userPrompt = `Consultation à résumer :
- Praticien : ${practitioner}
- Date : ${appointment?.scheduled_at ?? "non précisée"}
- Type : ${appointment?.type === "teleconsultation" ? "Téléconsultation" : "Consultation en cabinet"}
- Durée : ${appointment?.duration ?? "?"} minutes
- Motif déclaré : ${appointment?.reason ?? "non précisé"}
- Notes du rendez-vous : ${appointment?.notes ?? "aucune"}

Échanges liés à cette consultation :
${conversation}

Rédige le compte rendu patient au format JSON demandé.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const status = response.status;
      const text = await response.text();
      console.error("AI gateway error:", status, text);
      if (status === 429) {
        return new Response(
          JSON.stringify({ error: "Trop de requêtes, réessayez dans un instant." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (status === 402) {
        return new Response(
          JSON.stringify({ error: "Service temporairement indisponible." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      return new Response(JSON.stringify({ error: "Erreur du service IA" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const raw = data.choices?.[0]?.message?.content ?? "{}";

    let parsed: Record<string, string> = {};
    try {
      parsed = JSON.parse(raw);
    } catch {
      const match = raw.match(/\{[\s\S]*\}/);
      parsed = match ? JSON.parse(match[0]) : {};
    }

    const clean = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim() : "");

    const result = {
      title: clean(parsed.title) || "Compte rendu de consultation",
      summary:
        clean(parsed.summary) ||
        `Consultation avec ${practitioner}. Motif : ${appointment?.reason ?? "non précisé"}.`,
      reason: clean(parsed.reason) || clean(appointment?.reason),
      symptoms: clean(parsed.symptoms),
      observations: clean(parsed.observations),
      recommendations: clean(parsed.recommendations),
      treatment: clean(parsed.treatment),
      follow_up: clean(parsed.follow_up),
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-consultation-report error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Erreur inconnue" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
