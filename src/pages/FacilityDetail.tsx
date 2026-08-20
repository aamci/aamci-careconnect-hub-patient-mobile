import { useParams } from "react-router-dom";
import { useState } from "react";
import { Star, Flag, MapPin, Phone, Building2, Sparkles, Users, Stethoscope } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { Header } from "@/components/layout/Header";
import { Card } from "@/components/common/Card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { StarRating } from "@/components/reviews/StarRating";
import { ReviewCard } from "@/components/reviews/ReviewCard";
import { ReportDialog } from "@/components/reviews/ReportDialog";
import { useFacilityReviews, useReviewResponses } from "@/hooks/useReviews";
import { useFacility, FACILITY_TYPE_LABELS } from "@/hooks/useFacilities";

export default function FacilityDetailPage() {
  const { id = "" } = useParams();
  const { data: facility, isLoading: loadingFacility } = useFacility(id);
  const { data: reviews, isLoading } = useFacilityReviews(id);
  const reviewIds = (reviews ?? []).map((r) => r.id);
  const { data: responses } = useReviewResponses(reviewIds, "facility");
  const [reportTarget, setReportTarget] = useState<{ type: "review" | "facility"; id?: string } | null>(null);

  const avg = (key: "rating" | "cleanliness_rating" | "reception_rating" | "equipment_rating") => {
    const values = (reviews ?? []).map((r) => (r as any)[key]).filter((v: number | null) => typeof v === "number");
    if (!values.length) return 0;
    return values.reduce((s: number, v: number) => s + v, 0) / values.length;
  };

  const globalAvg = avg("rating");
  const subRatings = [
    { label: "Propreté", value: avg("cleanliness_rating"), icon: Sparkles },
    { label: "Accueil", value: avg("reception_rating"), icon: Users },
    { label: "Équipements", value: avg("equipment_rating"), icon: Stethoscope },
  ];

  return (
    <PageContainer noPadding className="pb-8">
      <Header
        title={facility?.name || "Établissement"}
        showBack
        rightElement={
          <Button
            variant="ghost"
            size="icon"
            aria-label="Signaler cet établissement"
            onClick={() => setReportTarget({ type: "facility", id })}
          >
            <Flag className="h-5 w-5" />
          </Button>
        }
      />

      <div className="px-4 space-y-6">
        {loadingFacility ? (
          <Skeleton className="h-28 w-full" />
        ) : facility ? (
          <Card variant="flat" className="p-4 space-y-3">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                <Building2 className="h-5 w-5 text-primary" />
              </div>
              <div className="min-w-0">
                <h1 className="font-semibold text-base truncate">{facility.name}</h1>
                <p className="text-sm text-muted-foreground">
                  {FACILITY_TYPE_LABELS[facility.type] ?? facility.type}
                </p>
              </div>
            </div>
            {(facility.street || facility.city) && (
              <p className="flex items-start gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                <span>
                  {[facility.street, facility.postal_code, facility.city].filter(Boolean).join(", ")}
                </span>
              </p>
            )}
            {facility.phone && (
              <a
                href={`tel:${facility.phone}`}
                className="flex items-center gap-2 text-sm text-primary min-h-[44px]"
              >
                <Phone className="h-4 w-4" />
                {facility.phone}
              </a>
            )}
          </Card>
        ) : (
          <p className="text-sm text-muted-foreground py-6">Établissement introuvable.</p>
        )}

        {/* Ratings summary */}
        <Card variant="flat" className="p-4">
          <div className="flex items-center gap-6">
            <div className="text-center">
              <p className="text-4xl font-bold">{globalAvg.toFixed(1)}</p>
              <StarRating rating={Math.round(globalAvg)} size="sm" readonly />
              <p className="text-sm text-muted-foreground mt-1">{reviews?.length || 0} avis</p>
            </div>
            <div className="flex-1 space-y-2">
              {subRatings.map(({ label, value, icon: Icon }) => (
                <div key={label} className="flex items-center gap-2 text-sm">
                  <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="flex-1 truncate text-muted-foreground">{label}</span>
                  <span className="font-medium">{value ? value.toFixed(1) : "—"}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Reviews */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-32 w-full" />)}
          </div>
        ) : !reviews?.length ? (
          <div className="text-center py-12">
            <Star className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-muted-foreground">Aucun avis pour le moment</p>
          </div>
        ) : (
          <div className="space-y-3">
            {reviews.map((review) => (
              <ReviewCard
                key={review.id}
                {...(review as any)}
                reviewType="facility"
                response={responses?.find((r) => r.review_id === review.id)}
                onReport={() => setReportTarget({ type: "review", id: review.id })}
              />
            ))}
          </div>
        )}
      </div>

      <ReportDialog
        open={!!reportTarget}
        onOpenChange={(open) => !open && setReportTarget(null)}
        targetType={reportTarget?.type || "review"}
        targetId={reportTarget?.id}
      />
    </PageContainer>
  );
}
