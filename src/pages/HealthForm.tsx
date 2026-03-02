import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  ShieldPlus, Loader2, Droplets, Ruler, Weight, AlertTriangle, 
  Pill, Syringe, HeartPulse, Users, Phone, User, FileText, 
  Activity, Stethoscope 
} from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { Header } from "@/components/layout/Header";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { Card } from "@/components/common/Card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import { usePatientProfiles } from "@/hooks/usePatientProfiles";
import { useHealthForm, useUpsertHealthForm } from "@/hooks/useHealthForm";
import { useToast } from "@/hooks/use-toast";

const bloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const healthFormSchema = z.object({
  blood_type: z.string().trim().max(10).optional(),
  height_cm: z.string().trim().max(5).optional(),
  weight_kg: z.string().trim().max(5).optional(),
  allergies: z.string().trim().max(2000).optional(),
  chronic_conditions: z.string().trim().max(2000).optional(),
  current_medications: z.string().trim().max(2000).optional(),
  surgeries: z.string().trim().max(2000).optional(),
  family_history: z.string().trim().max(2000).optional(),
  lifestyle: z.string().trim().max(2000).optional(),
  vaccination_notes: z.string().trim().max(2000).optional(),
  emergency_contact_name: z.string().trim().max(120).optional(),
  emergency_contact_phone: z.string().trim().max(30).optional(),
  emergency_contact_relation: z.string().trim().max(80).optional(),
  additional_notes: z.string().trim().max(4000).optional(),
});

type HealthFormValues = z.infer<typeof healthFormSchema>;

const defaultValues: HealthFormValues = {
  blood_type: "", height_cm: "", weight_kg: "", allergies: "",
  chronic_conditions: "", current_medications: "", surgeries: "",
  family_history: "", lifestyle: "", vaccination_notes: "",
  emergency_contact_name: "", emergency_contact_phone: "",
  emergency_contact_relation: "", additional_notes: "",
};

interface SectionHeaderProps {
  icon: React.ElementType;
  title: string;
  description?: string;
  color?: string;
}

function SectionHeader({ icon: Icon, title, description, color = "text-primary" }: SectionHeaderProps) {
  return (
    <div className="flex items-center gap-3 mb-3">
      <div className={`w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0`}>
        <Icon className={`h-4 w-4 ${color}`} />
      </div>
      <div>
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </div>
    </div>
  );
}

export default function HealthFormPage() {
  const { toast } = useToast();
  const { data: profiles } = usePatientProfiles();
  const currentProfile = profiles?.find((p) => p.profile_type === "self") || profiles?.[0];

  const { data: savedForm, isLoading: formLoading } = useHealthForm(currentProfile?.id);
  const upsertMutation = useUpsertHealthForm();

  const form = useForm<HealthFormValues>({
    resolver: zodResolver(healthFormSchema),
    defaultValues,
  });

  useEffect(() => {
    if (!savedForm) return;
    const mapped: HealthFormValues = {};
    for (const key of Object.keys(defaultValues) as (keyof HealthFormValues)[]) {
      mapped[key] = (savedForm as any)[key] ?? "";
    }
    form.reset(mapped);
  }, [savedForm, form]);

  const onSubmit = (values: HealthFormValues) => {
    if (!currentProfile?.id) {
      toast({ title: "Profil introuvable", description: "Impossible d'enregistrer sans profil patient.", variant: "destructive" });
      return;
    }

    upsertMutation.mutate(
      { ...values, patient_profile_id: currentProfile.id },
      {
        onSuccess: () => toast({ title: "✅ Formulaire enregistré", description: "Vos informations de santé ont été sauvegardées avec succès." }),
        onError: () => toast({ title: "Erreur", description: "Impossible de sauvegarder le formulaire.", variant: "destructive" }),
      }
    );
  };

  return (
    <>
      <PageContainer noPadding className="overflow-x-hidden">
        <Header title="Formulaire de santé" showBack />
        <main className="px-4 pb-24 max-w-lg mx-auto">
          {/* Info banner */}
          <Card className="p-4 mb-4 bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
                <ShieldPlus className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="font-semibold text-foreground text-sm sm:text-base">Dossier médical complet</h1>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  Ces informations sont confidentielles et sécurisées. Elles permettent aux praticiens de mieux vous prendre en charge.
                </p>
              </div>
            </div>
          </Card>

          {formLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {/* Section 1: General Data */}
                <Card className="p-4 space-y-3">
                  <SectionHeader icon={Droplets} title="Données biométriques" description="Groupe sanguin, taille et poids" />
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <FormField control={form.control} name="blood_type" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-1.5">
                          <Droplets className="h-3.5 w-3.5 text-rose-500" />
                          Groupe sanguin
                        </FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || ""}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionner" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {bloodTypes.map((bt) => (
                              <SelectItem key={bt} value={bt}>{bt}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="height_cm" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-1.5">
                          <Ruler className="h-3.5 w-3.5 text-blue-500" />
                          Taille (cm)
                        </FormLabel>
                        <FormControl><Input inputMode="numeric" placeholder="175" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="weight_kg" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-1.5">
                          <Weight className="h-3.5 w-3.5 text-amber-500" />
                          Poids (kg)
                        </FormLabel>
                        <FormControl><Input inputMode="numeric" placeholder="72" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                </Card>

                {/* Section 2: Allergies */}
                <Card className="p-4 space-y-3">
                  <SectionHeader icon={AlertTriangle} title="Allergies et intolérances" description="Médicaments, aliments, environnement" />
                  <FormField control={form.control} name="allergies" render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea placeholder="Ex: Pénicilline (urticaire), arachides (anaphylaxie), pollen (rhinite)..." className="min-h-[80px]" {...field} />
                      </FormControl>
                      <FormDescription>Précisez le type de réaction pour chaque allergie</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )} />
                </Card>

                {/* Section 3: Chronic conditions */}
                <Card className="p-4 space-y-3">
                  <SectionHeader icon={HeartPulse} title="Maladies chroniques" description="Pathologies en cours de suivi" />
                  <FormField control={form.control} name="chronic_conditions" render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea placeholder="Ex: Diabète type 2 (depuis 2019), Hypertension artérielle..." className="min-h-[80px]" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </Card>

                {/* Section 4: Surgeries */}
                <Card className="p-4 space-y-3">
                  <SectionHeader icon={Stethoscope} title="Interventions chirurgicales" description="Opérations et hospitalisations" />
                  <FormField control={form.control} name="surgeries" render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea placeholder="Ex: Appendicectomie (2015), Fracture bras droit (2020)..." className="min-h-[80px]" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </Card>

                {/* Section 5: Family history */}
                <Card className="p-4 space-y-3">
                  <SectionHeader icon={Users} title="Antécédents familiaux" description="Maladies héréditaires ou familiales" />
                  <FormField control={form.control} name="family_history" render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea placeholder="Ex: Mère – diabète type 2, Père – hypertension, Grand-père – cancer du côlon..." className="min-h-[80px]" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </Card>

                {/* Section 6: Current medications */}
                <Card className="p-4 space-y-3">
                  <SectionHeader icon={Pill} title="Traitements en cours" description="Médicaments actuellement pris" />
                  <FormField control={form.control} name="current_medications" render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea placeholder="Ex: Metformine 500mg – 2x/jour, Oméprazole 20mg – 1x/jour..." className="min-h-[80px]" {...field} />
                      </FormControl>
                      <FormDescription>Nom, dose, fréquence et durée</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )} />
                </Card>

                {/* Section 7: Vaccinations */}
                <Card className="p-4 space-y-3">
                  <SectionHeader icon={Syringe} title="Vaccinations" description="Rappels et vaccins récents" />
                  <FormField control={form.control} name="vaccination_notes" render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea placeholder="Ex: COVID-19 (3 doses, dernier: mars 2024), Grippe (oct. 2024)..." className="min-h-[80px]" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </Card>

                {/* Section 8: Lifestyle */}
                <Card className="p-4 space-y-3">
                  <SectionHeader icon={Activity} title="Mode de vie" description="Habitudes et hygiène de vie" />
                  <FormField control={form.control} name="lifestyle" render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea placeholder="Ex: Non-fumeur, sport 3x/semaine, sommeil 7h/nuit, alimentation équilibrée..." className="min-h-[80px]" {...field} />
                      </FormControl>
                      <FormDescription>Ces informations aident à personnaliser votre suivi</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )} />
                </Card>

                {/* Section 9: Emergency contact */}
                <Card className="p-4 space-y-3">
                  <SectionHeader icon={Phone} title="Contact d'urgence" description="Personne à prévenir en cas d'urgence" />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <FormField control={form.control} name="emergency_contact_name" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-1.5">
                          <User className="h-3.5 w-3.5 text-muted-foreground" />
                          Nom complet
                        </FormLabel>
                        <FormControl><Input placeholder="Jean Dupont" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="emergency_contact_relation" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-1.5">
                          <Users className="h-3.5 w-3.5 text-muted-foreground" />
                          Lien de parenté
                        </FormLabel>
                        <FormControl><Input placeholder="Conjoint, parent..." {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                  <FormField control={form.control} name="emergency_contact_phone" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1.5">
                        <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                        Téléphone
                      </FormLabel>
                      <FormControl><Input type="tel" inputMode="tel" placeholder="06 12 34 56 78" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </Card>

                {/* Section 10: Additional notes */}
                <Card className="p-4 space-y-3">
                  <SectionHeader icon={FileText} title="Notes complémentaires" description="Informations utiles au praticien" />
                  <FormField control={form.control} name="additional_notes" render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea placeholder="Toute information importante non mentionnée ci-dessus..." className="min-h-[100px]" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </Card>

                <Button type="submit" className="w-full" size="lg" disabled={upsertMutation.isPending}>
                  {upsertMutation.isPending ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Enregistrement...</> : "Enregistrer le formulaire"}
                </Button>
              </form>
            </Form>
          )}
        </main>
      </PageContainer>
      <BottomNavigation />
    </>
  );
}
