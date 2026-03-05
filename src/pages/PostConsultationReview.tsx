import { useParams, useNavigate } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { Header } from "@/components/layout/Header";
import { Card } from "@/components/common/Card";
import { Avatar } from "@/components/common/Avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ReviewForm } from "@/components/reviews/ReviewForm";
import { useAppointment } from "@/hooks/useAppointments";
import { useCreatePractitionerReview, useHasReviewedAppointment, useCreateFacilityReview } from "@/hooks/useReviews";
import { usePatientProfiles } from "@/hooks/usePatientProfiles";
import { useToast } from "@/hooks/use-toast";

export default function PostConsultationReviewPage() {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);
  const [step, setStep] = useState<"practitioner" | "facility">("practitioner");

  const { data: appointment, isLoading } = useAppointment(appointmentId || "");
  const { data: hasReviewed, isLoading: checkingReview } = useHasReviewedAppointment(appointmentId || "");
  const { data: profiles } = usePatientProfiles();
  const createPractitionerReview = useCreatePractitionerReview();
  const createFacilityReview = useCreateFacilityReview();

  if (isLoading || checkingReview) {
    return (
      <PageContainer noPadding>
        <Header title="Évaluation" showBack />
        <div className="px-4 py-6 space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </PageContainer>
    );
  }

  if (!appointment || !appointmentId) {
    return (
      <PageContainer>
        <Header title="Évaluation" showBack />
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Consultation non trouvée</p>
        </div>
      </PageContainer>
    );
  }

  if (hasReviewed || submitted) {
    return (
      <PageContainer noPadding>
        <Header title="Évaluation" showBack />
        <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
          <CheckCircle2 className="h-16 w-16 text-success mb-4" />
          <h2 className="text-xl font-bold font-display mb-2">Merci pour votre avis !</h2>
          <p className="text-muted-foreground mb-6">
            Votre évaluation aide les autres patients à choisir leur praticien.
          </p>
          <Button onClick={() => navigate("/appointments")}>Retour aux rendez-vous</Button>
        </div>
      </PageContainer>
    );
  }

  const practitioner = appointment.practitioner;
  const patientProfile = profiles?.find(p => p.id === appointment.patient_profile_id);

  const handlePractitionerReview = async (data: any) => {
    if (!patientProfile) return;
    try {
      await createPractitionerReview.mutateAsync({
        appointment_id: appointmentId,
        practitioner_id: appointment.practitioner_id,
        patient_profile_id: patientProfile.id,
        rating: data.rating,
        comment: data.comment,
        is_anonymous: data.is_anonymous,
      });

      if (appointment.facility_id) {
        setStep("facility");
        toast({ title: "Avis sur le praticien enregistré !" });
      } else {
        setSubmitted(true);
        toast({ title: "Merci pour votre avis !" });
      }
    } catch {
      toast({ variant: "destructive", title: "Erreur", description: "Impossible d'enregistrer l'avis." });
    }
  };

  const handleFacilityReview = async (data: any) => {
    if (!patientProfile || !appointment.facility_id) return;
    try {
      await createFacilityReview.mutateAsync({
        facility_id: appointment.facility_id,
        patient_profile_id: patientProfile.id,
        rating: data.rating,
        cleanliness_rating: data.cleanliness_rating,
        reception_rating: data.reception_rating,
        equipment_rating: data.equipment_rating,
        comment: data.comment,
        is_anonymous: data.is_anonymous,
      });
      setSubmitted(true);
      toast({ title: "Merci pour vos évaluations !" });
    } catch {
      toast({ variant: "destructive", title: "Erreur", description: "Impossible d'enregistrer l'avis." });
    }
  };

  return (
    <PageContainer noPadding className="pb-8">
      <Header title="Évaluation" showBack />
      <div className="px-4 space-y-6">
        {/* Appointment summary */}
        {practitioner && (
          <Card className="p-4">
            <div className="flex gap-3 items-center">
              <Avatar
                src={practitioner.avatar_url || undefined}
                alt={`${practitioner.first_name} ${practitioner.last_name}`}
                size="lg"
              />
              <div>
                <h3 className="font-semibold">Dr. {practitioner.first_name} {practitioner.last_name}</h3>
                <p className="text-sm text-muted-foreground">{practitioner.specialty?.name}</p>
              </div>
            </div>
          </Card>
        )}

        {step === "practitioner" && (
          <div>
            <h2 className="text-lg font-semibold font-display mb-4">
              Comment s'est passée votre consultation ?
            </h2>
            <ReviewForm
              onSubmit={handlePractitionerReview}
              isPending={createPractitionerReview.isPending}
            />
          </div>
        )}

        {step === "facility" && (
          <div>
            <h2 className="text-lg font-semibold font-display mb-4">
              Évaluez l'établissement
            </h2>
            <ReviewForm
              onSubmit={handleFacilityReview}
              isPending={createFacilityReview.isPending}
              showFacilityRatings
            />
            <Button
              variant="ghost"
              className="w-full mt-2"
              onClick={() => setSubmitted(true)}
            >
              Passer cette étape
            </Button>
          </div>
        )}
      </div>
    </PageContainer>
  );
}
