import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  Star, 
  MapPin, 
  Video, 
  Clock, 
  Globe, 
  ChevronLeft,
  ChevronRight,
  Heart,
  Share2,
  Calendar
} from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/common/Card";
import { Badge } from "@/components/common/Badge";
import { practitioners, generateTimeSlots } from "@/data/mockData";
import { format, addDays, isToday, isTomorrow } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";

export default function PractitionerDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);

  const practitioner = practitioners.find(p => p.id === id);

  if (!practitioner) {
    return (
      <PageContainer className="flex items-center justify-center">
        <p className="text-muted-foreground">Praticien non trouvé</p>
      </PageContainer>
    );
  }

  const timeSlots = generateTimeSlots(practitioner.id, selectedDate);
  const availableSlots = timeSlots.filter(s => s.available);

  const dates = Array.from({ length: 7 }, (_, i) => addDays(new Date(), i));

  const formatDateLabel = (date: Date) => {
    if (isToday(date)) return "Auj.";
    if (isTomorrow(date)) return "Dem.";
    return format(date, "EEE", { locale: fr });
  };

  const handleBookAppointment = () => {
    if (!selectedSlot) return;
    navigate(`/booking/${practitioner.id}?date=${format(selectedDate, 'yyyy-MM-dd')}&time=${selectedSlot}`);
  };

  return (
    <>
      <div className="min-h-screen bg-background pb-24">
        {/* Hero Section */}
        <div className="relative">
          <div className="h-48 bg-gradient-primary" />
          
          {/* Back Button */}
          <button
            onClick={() => navigate(-1)}
            className="absolute top-4 left-4 w-10 h-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-lg"
          >
            <ChevronLeft className="h-5 w-5 text-foreground" />
          </button>

          {/* Actions */}
          <div className="absolute top-4 right-4 flex gap-2">
            <button
              onClick={() => setIsFavorite(!isFavorite)}
              className="w-10 h-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-lg"
            >
              <Heart 
                className={cn(
                  "h-5 w-5 transition-colors",
                  isFavorite ? "fill-accent text-accent" : "text-foreground"
                )} 
              />
            </button>
            <button
              onClick={() => console.log("Share")}
              className="w-10 h-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-lg"
            >
              <Share2 className="h-5 w-5 text-foreground" />
            </button>
          </div>

          {/* Profile Card */}
          <div className="absolute -bottom-20 left-4 right-4">
            <Card className="p-4">
              <div className="flex gap-4">
                <img
                  src={practitioner.avatarUrl}
                  alt={`${practitioner.firstName} ${practitioner.lastName}`}
                  className="w-24 h-24 rounded-2xl object-cover shadow-md"
                />
                <div className="flex-1 min-w-0">
                  <h1 className="text-xl font-bold font-display text-foreground">
                    Dr. {practitioner.firstName} {practitioner.lastName}
                  </h1>
                  <p className="text-primary font-medium">
                    {practitioner.specialty.name}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <Star className="h-4 w-4 fill-warning text-warning" />
                    <span className="font-semibold">{practitioner.rating}</span>
                    <span className="text-sm text-muted-foreground">
                      ({practitioner.reviewCount} avis)
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Content */}
        <div className="px-4 pt-24 space-y-6">
          {/* Quick Info */}
          <div className="flex flex-wrap gap-2">
            {practitioner.teleconsultationEnabled && (
              <Badge variant="info" icon={<Video className="h-3 w-3" />}>
                Téléconsultation
              </Badge>
            )}
            {practitioner.acceptsNewPatients && (
              <Badge variant="success">Accepte nouveaux patients</Badge>
            )}
            <Badge variant="muted" icon={<Globe className="h-3 w-3" />}>
              {practitioner.languages.join(", ")}
            </Badge>
          </div>

          {/* Bio */}
          {practitioner.bio && (
            <div>
              <h2 className="text-lg font-semibold font-display mb-2">À propos</h2>
              <p className="text-muted-foreground">{practitioner.bio}</p>
            </div>
          )}

          {/* Price */}
          {practitioner.consultationPrice && (
            <div className="flex items-center justify-between py-3 border-y border-border">
              <span className="text-muted-foreground">Prix de la consultation</span>
              <span className="text-xl font-bold text-foreground">
                {practitioner.consultationPrice}€
              </span>
            </div>
          )}

          {/* Date Selection */}
          <div>
            <h2 className="text-lg font-semibold font-display mb-3">Choisir une date</h2>
            <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
              {dates.map((date) => {
                const isSelected = format(date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
                return (
                  <button
                    key={date.toISOString()}
                    onClick={() => {
                      setSelectedDate(date);
                      setSelectedSlot(null);
                    }}
                    className={cn(
                      "flex flex-col items-center min-w-[60px] py-3 px-4 rounded-xl transition-all",
                      isSelected
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    )}
                  >
                    <span className="text-xs font-medium uppercase">
                      {formatDateLabel(date)}
                    </span>
                    <span className="text-xl font-bold mt-1">
                      {format(date, "d")}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Time Slots */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold font-display">Créneaux disponibles</h2>
              <span className="text-sm text-muted-foreground">
                {availableSlots.length} dispo.
              </span>
            </div>
            
            {availableSlots.length === 0 ? (
              <Card variant="flat" className="p-6 text-center">
                <Clock className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground">
                  Aucun créneau disponible pour cette date
                </p>
              </Card>
            ) : (
              <div className="grid grid-cols-4 gap-2">
                {availableSlots.map((slot) => (
                  <button
                    key={slot.time}
                    onClick={() => setSelectedSlot(slot.time)}
                    className={cn(
                      "py-2.5 px-3 rounded-xl text-sm font-medium transition-all",
                      selectedSlot === slot.time
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-foreground hover:bg-muted/80"
                    )}
                  >
                    {slot.time}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-card/95 backdrop-blur-lg border-t border-border safe-area-bottom">
          <Button
            className="w-full"
            size="lg"
            disabled={!selectedSlot}
            onClick={handleBookAppointment}
          >
            <Calendar className="h-5 w-5 mr-2" />
            {selectedSlot 
              ? `Réserver à ${selectedSlot}` 
              : "Sélectionnez un créneau"
            }
          </Button>
        </div>
      </div>
    </>
  );
}
