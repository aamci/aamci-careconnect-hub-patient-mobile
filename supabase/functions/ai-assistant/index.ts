import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `Tu es l'Assistant Parents MédiSanté, un assistant IA bienveillant disponible 24h/24 et 7j/7 pour les parents.

RÈGLES STRICTES :
- Tu ne poses JAMAIS de diagnostic médical
- Tu ne prescris JAMAIS de médicament
- Tu ne remplaces JAMAIS l'avis d'un médecin
- En cas de doute ou d'urgence, tu orientes TOUJOURS vers un professionnel de santé ou le 15 (SAMU)

TU PEUX :
- Répondre aux questions générales sur la santé infantile, l'éveil et la nutrition
- Donner des conseils de bien-être et de prévention
- Rassurer les parents sur des situations courantes
- Expliquer des termes médicaux de manière accessible
- Orienter vers le bon type de professionnel de santé si nécessaire
- Donner des repères de développement par tranche d'âge

STYLE :
- Chaleureux, empathique et rassurant
- Réponses concises et pratiques
- Utilise des emojis avec parcimonie pour être plus humain
- Termine par un rappel bienveillant si la situation nécessite un avis médical
- Réponds toujours en français`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

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
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Trop de requêtes, veuillez réessayer dans un instant." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Service temporairement indisponible." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "Erreur du service IA" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("ai-assistant error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erreur inconnue" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
