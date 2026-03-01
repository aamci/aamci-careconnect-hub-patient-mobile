import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ShieldPlus } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { Header } from "@/components/layout/Header";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { Card } from "@/components/common/Card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { usePatientProfiles } from "@/hooks/usePatientProfiles";
import { useToast } from "@/hooks/use-toast";

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
  blood_type: "",
  height_cm: "",
  weight_kg: "",
  allergies: "",
  chronic_conditions: "",
  current_medications: "",
  surgeries: "",
  family_history: "",
  lifestyle: "",
  vaccination_notes: "",
  emergency_contact_name: "",
  emergency_contact_phone: "",
  emergency_contact_relation: "",
  additional_notes: "",
};

export default function HealthFormPage() {
  const { toast } = useToast();
  const { data: profiles } = usePatientProfiles();
  const currentProfile = profiles?.find((p) => p.profile_type === "self") || profiles?.[0];

  const form = useForm<HealthFormValues>({
    resolver: zodResolver(healthFormSchema),
    defaultValues,
  });

  const storageKey = currentProfile ? `health-form:${currentProfile.id}` : null;

  useEffect(() => {
    if (!storageKey) return;
    const raw = localStorage.getItem(storageKey);
    if (!raw) return;

    try {
      const parsed = healthFormSchema.partial().parse(JSON.parse(raw));
      form.reset({ ...defaultValues, ...parsed });
    } catch {
      localStorage.removeItem(storageKey);
    }
  }, [storageKey, form]);

  const onSubmit = (values: HealthFormValues) => {
    if (!storageKey) {
      toast({
        title: "Profil introuvable",
        description: "Impossible d'enregistrer sans profil patient.",
        variant: "destructive",
      });
      return;
    }

    localStorage.setItem(storageKey, JSON.stringify(values));
    toast({
      title: "Formulaire enregistré",
      description: "Vos informations de santé ont été sauvegardées.",
    });
  };

  return (
    <>
      <PageContainer noPadding className="overflow-x-hidden">
        <Header title="Formulaire de santé" showBack />

        <main className="px-4 pb-24 max-w-lg mx-auto">
          <Card className="p-4 mb-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <ShieldPlus className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="font-semibold text-foreground">Informations médicales complètes</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Renseignez vos antécédents, traitements, allergies et contacts d'urgence.
                </p>
              </div>
            </div>
          </Card>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <Card className="p-4 space-y-3">
                <h2 className="text-sm font-medium text-muted-foreground">Données générales</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <FormField
                    control={form.control}
                    name="blood_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Groupe sanguin</FormLabel>
                        <FormControl>
                          <Input placeholder="A+, O-..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="height_cm"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Taille (cm)</FormLabel>
                        <FormControl>
                          <Input inputMode="numeric" placeholder="175" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="weight_kg"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Poids (kg)</FormLabel>
                        <FormControl>
                          <Input inputMode="numeric" placeholder="72" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </Card>

              <Card className="p-4 space-y-3">
                <h2 className="text-sm font-medium text-muted-foreground">Antécédents médicaux</h2>
                <FormField
                  control={form.control}
                  name="allergies"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Allergies</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Médicaments, aliments, réactions..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="chronic_conditions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Maladies chroniques</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Diabète, asthme, HTA, etc." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="surgeries"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Interventions / hospitalisations</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Dates, type d'intervention, complications" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="family_history"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Antécédents familiaux</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Cardiaque, cancers, diabète, etc." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </Card>

              <Card className="p-4 space-y-3">
                <h2 className="text-sm font-medium text-muted-foreground">Traitements et prévention</h2>
                <FormField
                  control={form.control}
                  name="current_medications"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Traitements en cours</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Nom, dose, fréquence, durée" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="vaccination_notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vaccinations / rappels</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Vaccins récents, rappels à prévoir" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lifestyle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Habitudes de vie</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Sommeil, activité physique, tabac, alcool..." {...field} />
                      </FormControl>
                      <FormDescription>Ces informations aident à personnaliser le suivi.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </Card>

              <Card className="p-4 space-y-3">
                <h2 className="text-sm font-medium text-muted-foreground">Contact d'urgence</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <FormField
                    control={form.control}
                    name="emergency_contact_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nom</FormLabel>
                        <FormControl>
                          <Input placeholder="Jean Dupont" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="emergency_contact_relation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Lien</FormLabel>
                        <FormControl>
                          <Input placeholder="Conjoint, parent..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="emergency_contact_phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Téléphone</FormLabel>
                      <FormControl>
                        <Input placeholder="06 12 34 56 78" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </Card>

              <Card className="p-4 space-y-3">
                <FormField
                  control={form.control}
                  name="additional_notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes complémentaires</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Informations utiles au praticien" className="min-h-[120px]" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </Card>

              <Button type="submit" className="w-full">Enregistrer le formulaire</Button>
            </form>
          </Form>
        </main>
      </PageContainer>
      <BottomNavigation />
    </>
  );
}
