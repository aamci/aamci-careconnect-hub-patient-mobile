import { useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { 
  Calendar, 
  Clock, 
  Video, 
  MapPin, 
  User,
  ChevronRight,
  Check,
  AlertCircle
} from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/common/Card";
import { Avatar } from "@/components/common/Avatar";
import { Badge } from "@/components/common/Badge";
import { practitioners, userProfiles } from "@/data/mockData";
import { format, parse } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";

type BookingStep = "profile" | "reason" | "confirm";

const consultationReasons = [
  { id: "routine", label: "Consultation de routine" },
  { id: "follow-up", label: "Consultation de suivi" },
  { id: "prescription", label: "Renouvellement ordonnance" },
  { id: "symptoms", label: "Nouveaux symptômes" },
  { id: "results", label: "Résultats d'examens" },
  { id: "other", label: "Autre" },
];

export default function BookingPage() {
  const { practitionerId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const dateParam = searchParams.get("date");
  const timeParam = searchParams.get("time");

  const [step, setStep] = useState<BookingStep>("profile");
  const [selectedProfileId, setSelectedProfileId] = useState(userProfiles[0].id);
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [consultationType, setConsultationType] = useState<"in_person" | "teleconsultation">("in_person");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const practitioner = practitioners.find(p => p.id === practitionerId);
  const selectedProfile = userProfiles.find(p => p.id === selectedProfileId);
  const appointmentDate = dateParam ? parse(dateParam, 'yyyy-MM-dd', new Date()) : new Date();

  if (!practitioner || !dateParam || !timeParam) {
    return (
      <PageContainer>
        <Header title="Réservation" showBack />
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Information de réservation manquante</p>
        </div>
      </PageContainer>
    );
  }

  const handleConfirm = async () => {
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // In a real app, this would create the appointment
    navigate("/appointments", { 
      state: { 
        success: true,
        message: "Votre rendez-vous a été confirmé"
      }
    });
  };

  const canProceed = () => {
    switch (step) {
      case "profile":
        return !!selectedProfileId;
      case "reason":
        return !!selectedReason;
      case "confirm":
        return true;
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (step === "profile") setStep("reason");
    else if (step === "reason") setStep("confirm");
  };

  const prevStep = () => {
    if (step === "reason") setStep("profile");
    else if (step === "confirm") setStep("reason");
  };

  return (
    <>
      <PageContainer noPadding className="pb-24">
        <Header title="Réserver un rendez-vous" showBack />
        
        <div className="px-4">
          {/* Progress Steps */}
          <div className="flex items-center justify-center gap-2 py-4">
            {(["profile", "reason", "confirm"] as BookingStep[]).map((s, i) => (
              <div key={s} className="flex items-center">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all",
                  step === s 
                    ? "bg-primary text-primary-foreground" 
                    : i < ["profile", "reason", "confirm"].indexOf(step)
                      ? "bg-success text-success-foreground"
                      : "bg-muted text-muted-foreground"
                )}>
                  {i < ["profile", "reason", "confirm"].indexOf(step) ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    i + 1
                  )}
                </div>
                {i < 2 && (
                  <div className={cn(
                    "w-12 h-1 mx-1 rounded-full transition-all",
                    i < ["profile", "reason", "confirm"].indexOf(step)
                      ? "bg-success"
                      : "bg-muted"
                  )} />
                )}
              </div>
            ))}
          </div>

          {/* Appointment Summary Card */}
          <Card className="p-4 mb-6">
            <div className="flex gap-3">
              <Avatar
                src={practitioner.avatarUrl}
                alt={`${practitioner.firstName} ${practitioner.lastName}`}
                size="lg"
              />
              <div>
                <h3 className="font-semibold">
                  Dr. {practitioner.firstName} {practitioner.lastName}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {practitioner.specialty.name}
                </p>
                <div className="flex items-center gap-3 mt-2 text-sm">
                  <span className="flex items-center gap-1 text-primary font-medium">
                    <Calendar className="h-3.5 w-3.5" />
                    {format(appointmentDate, "d MMMM yyyy", { locale: fr })}
                  </span>
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    {timeParam}
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* Step Content */}
          <div className="animate-fade-in">
            {step === "profile" && (
              <div>
                <h2 className="text-lg font-semibold font-display mb-4">
                  Pour qui prenez-vous rendez-vous ?
                </h2>
                <div className="space-y-3">
                  {userProfiles.map((profile) => (
                    <button
                      key={profile.id}
                      onClick={() => setSelectedProfileId(profile.id)}
                      className={cn(
                        "w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all",
                        selectedProfileId === profile.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/30"
                      )}
                    >
                      <Avatar
                        alt={`${profile.firstName} ${profile.lastName}`}
                        size="md"
                      />
                      <div className="flex-1 text-left">
                        <p className="font-medium">
                          {profile.firstName} {profile.lastName}
                        </p>
                        <p className="text-sm text-muted-foreground capitalize">
                          {profile.profileType === 'self' ? 'Moi' : profile.profileType === 'child' ? 'Enfant' : 'Proche'}
                        </p>
                      </div>
                      {selectedProfileId === profile.id && (
                        <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                          <Check className="h-4 w-4 text-primary-foreground" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === "reason" && (
              <div>
                <h2 className="text-lg font-semibold font-display mb-4">
                  Motif de la consultation
                </h2>
                
                {/* Consultation Type */}
                {practitioner.teleconsultationEnabled && (
                  <div className="mb-6">
                    <p className="text-sm font-medium text-muted-foreground mb-2">
                      Type de consultation
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => setConsultationType("in_person")}
                        className={cn(
                          "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all",
                          consultationType === "in_person"
                            ? "border-primary bg-primary/5"
                            : "border-border"
                        )}
                      >
                        <MapPin className="h-5 w-5" />
                        <span className="text-sm font-medium">En cabinet</span>
                      </button>
                      <button
                        onClick={() => setConsultationType("teleconsultation")}
                        className={cn(
                          "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all",
                          consultationType === "teleconsultation"
                            ? "border-primary bg-primary/5"
                            : "border-border"
                        )}
                      >
                        <Video className="h-5 w-5" />
                        <span className="text-sm font-medium">Téléconsultation</span>
                      </button>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  {consultationReasons.map((reason) => (
                    <button
                      key={reason.id}
                      onClick={() => setSelectedReason(reason.id)}
                      className={cn(
                        "w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all",
                        selectedReason === reason.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/30"
                      )}
                    >
                      <span className="font-medium">{reason.label}</span>
                      {selectedReason === reason.id && (
                        <Check className="h-5 w-5 text-primary" />
                      )}
                    </button>
                  ))}
                </div>

                <div className="mt-4">
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">
                    Notes additionnelles (optionnel)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Décrivez vos symptômes ou toute information utile..."
                    rows={3}
                    className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                  />
                </div>
              </div>
            )}

            {step === "confirm" && (
              <div>
                <h2 className="text-lg font-semibold font-display mb-4">
                  Confirmer le rendez-vous
                </h2>
                
                <Card variant="flat" className="divide-y divide-border">
                  <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <User className="h-5 w-5 text-muted-foreground" />
                      <span className="text-muted-foreground">Patient</span>
                    </div>
                    <span className="font-medium">
                      {selectedProfile?.firstName} {selectedProfile?.lastName}
                    </span>
                  </div>
                  <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5 text-muted-foreground" />
                      <span className="text-muted-foreground">Date</span>
                    </div>
                    <span className="font-medium">
                      {format(appointmentDate, "d MMMM yyyy", { locale: fr })}
                    </span>
                  </div>
                  <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5 text-muted-foreground" />
                      <span className="text-muted-foreground">Heure</span>
                    </div>
                    <span className="font-medium">{timeParam}</span>
                  </div>
                  <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {consultationType === "teleconsultation" ? (
                        <Video className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <MapPin className="h-5 w-5 text-muted-foreground" />
                      )}
                      <span className="text-muted-foreground">Type</span>
                    </div>
                    <Badge variant={consultationType === "teleconsultation" ? "info" : "muted"}>
                      {consultationType === "teleconsultation" ? "Téléconsultation" : "En cabinet"}
                    </Badge>
                  </div>
                  <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <AlertCircle className="h-5 w-5 text-muted-foreground" />
                      <span className="text-muted-foreground">Motif</span>
                    </div>
                    <span className="font-medium">
                      {consultationReasons.find(r => r.id === selectedReason)?.label}
                    </span>
                  </div>
                </Card>

                {practitioner.consultationPrice && (
                  <div className="mt-4 p-4 rounded-xl bg-muted/50 flex items-center justify-between">
                    <span className="font-medium">Prix de la consultation</span>
                    <span className="text-xl font-bold text-primary">
                      {practitioner.consultationPrice}€
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-card/95 backdrop-blur-lg border-t border-border safe-area-bottom">
          <div className="flex gap-3">
            {step !== "profile" && (
              <Button
                variant="outline"
                className="flex-1"
                onClick={prevStep}
              >
                Retour
              </Button>
            )}
            {step === "confirm" ? (
              <Button
                className="flex-1"
                onClick={handleConfirm}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Confirmation..." : "Confirmer"}
              </Button>
            ) : (
              <Button
                className="flex-1"
                onClick={nextStep}
                disabled={!canProceed()}
              >
                Continuer
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            )}
          </div>
        </div>
      </PageContainer>
    </>
  );
}
