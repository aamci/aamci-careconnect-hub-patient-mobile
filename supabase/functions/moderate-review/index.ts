import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM = `Tu es un modérateur d'avis pour une plateforme santé française.
Analyse le texte de l'avis et retourne UNIQUEMENT un JSON strict:
{"decision":"published"|"under_review"|"rejected","reason":"<courte raison en français>"}

Règles:
- "rejected": insultes, haine, harcèlement, contenu diffamatoire nominatif, données personnelles de tiers, contenu médical dangereux, spam évident, promotion.
- "under_review": accusations graves non vérifiables, propos ambigus, langage vulgaire modéré, éléments potentiellement identifiants.
- "published": avis normal (positif, négatif ou neutre) exprimant une expérience personnelle sans dérive.
Ne renvoie rien d'autre que le JSON.`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { review_id, review_type, comment, rating } = await req.json();
    if (!review_id || !review_type) {
      return new Response(JSON.stringify({ error: "Missing review_id/review_type" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    let decision: "published" | "under_review" | "rejected" = "published";
    let reason: string | null = null;

    if (comment && comment.trim().length > 0) {
      const key = Deno.env.get("LOVABLE_API_KEY");
      if (key) {
        const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "google/gemini-3-flash-preview",
            messages: [
              { role: "system", content: SYSTEM },
              { role: "user", content: `Note: ${rating}/5\nAvis: ${comment}` },
            ],
            response_format: { type: "json_object" },
          }),
        });
        if (resp.ok) {
          const data = await resp.json();
          try {
            const parsed = JSON.parse(data.choices?.[0]?.message?.content ?? "{}");
            if (["published", "under_review", "rejected"].includes(parsed.decision)) {
              decision = parsed.decision;
              reason = parsed.reason ?? null;
            }
          } catch { /* keep default */ }
        } else if (resp.status === 429 || resp.status === 402) {
          decision = "under_review";
          reason = "Modération automatique indisponible, mise en revue par précaution";
        }
      }
    }

    const table = review_type === "facility" ? "facility_reviews" : "practitioner_reviews";
    const { error } = await supabase
      .from(table)
      .update({
        moderation_status: decision,
        moderation_reason: reason,
        moderated_at: new Date().toISOString(),
        is_visible: decision === "published",
      })
      .eq("id", review_id);

    if (error) throw error;

    return new Response(JSON.stringify({ decision, reason }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
