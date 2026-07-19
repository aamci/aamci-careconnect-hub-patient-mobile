import { useParams, useNavigate } from "react-router-dom";
import { Star, Flag } from "lucide-react";
import { useState } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { Header } from "@/components/layout/Header";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ReviewCard } from "@/components/reviews/ReviewCard";
import { ReportDialog } from "@/components/reviews/ReportDialog";
import { StarRating } from "@/components/reviews/StarRating";
import { usePractitionerReviews, useReviewResponses } from "@/hooks/useReviews";
import { usePractitioner } from "@/hooks/usePractitioners";


export default function PractitionerReviewsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: practitioner } = usePractitioner(id || "");
  const { data: reviews, isLoading } = usePractitionerReviews(id || "");
  const reviewIds = (reviews ?? []).map(r => r.id);
  const { data: responses } = useReviewResponses(reviewIds, "practitioner");
  const [reportTarget, setReportTarget] = useState<{ type: "review" | "practitioner"; id?: string } | null>(null);


  const avgRating = reviews?.length
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  const ratingDistribution = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: reviews?.filter(r => r.rating === star).length || 0,
    percent: reviews?.length ? ((reviews.filter(r => r.rating === star).length / reviews.length) * 100) : 0,
  }));

  return (
    <PageContainer noPadding className="pb-8">
      <Header
        title={practitioner ? `Avis - Dr. ${practitioner.last_name}` : "Avis"}
        showBack
        rightElement={
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setReportTarget({ type: "practitioner", id })}
          >
            <Flag className="h-5 w-5" />
          </Button>
        }
      />

      <div className="px-4 space-y-6">
        {/* Summary */}
        <div className="flex items-center gap-6 py-4">
          <div className="text-center">
            <p className="text-4xl font-bold">{avgRating.toFixed(1)}</p>
            <StarRating rating={Math.round(avgRating)} size="sm" readonly />
            <p className="text-sm text-muted-foreground mt-1">{reviews?.length || 0} avis</p>
          </div>
          <div className="flex-1 space-y-1.5">
            {ratingDistribution.map(({ star, count, percent }) => (
              <div key={star} className="flex items-center gap-2 text-sm">
                <span className="w-3 text-right">{star}</span>
                <Star className="h-3 w-3 fill-warning text-warning" />
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-warning rounded-full transition-all"
                    style={{ width: `${percent}%` }}
                  />
                </div>
                <span className="w-6 text-right text-muted-foreground">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Reviews list */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-32 w-full" />)}
          </div>
        ) : reviews?.length === 0 ? (
          <div className="text-center py-12">
            <Star className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-muted-foreground">Aucun avis pour le moment</p>
          </div>
        ) : (
          <div className="space-y-3">
            {reviews?.map((review) => (
              <ReviewCard
                key={review.id}
                {...review}
                reviewType="practitioner"
                response={responses?.find(r => r.review_id === review.id)}
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
