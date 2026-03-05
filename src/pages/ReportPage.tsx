import { useState } from "react";
import { Flag, AlertTriangle, CheckCircle2, Clock, XCircle } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { Header } from "@/components/layout/Header";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { Card } from "@/components/common/Card";
import { Badge } from "@/components/common/Badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ReportDialog } from "@/components/reviews/ReportDialog";
import { useUserReports } from "@/hooks/useReviews";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

const statusConfig: Record<string, { label: string; variant: "default" | "warning" | "success" | "muted"; icon: React.ElementType }> = {
  pending: { label: "En attente", variant: "warning", icon: Clock },
  reviewed: { label: "En cours", variant: "default", icon: AlertTriangle },
  resolved: { label: "Résolu", variant: "success", icon: CheckCircle2 },
  dismissed: { label: "Rejeté", variant: "muted", icon: XCircle },
};

const reasonLabels: Record<string, string> = {
  inappropriate: "Contenu inapproprié",
  spam: "Spam",
  harassment: "Harcèlement",
  misinformation: "Informations erronées",
  technical_issue: "Problème technique",
  other: "Autre",
};

export default function ReportPage() {
  const { data: reports, isLoading } = useUserReports();
  const [showNewReport, setShowNewReport] = useState(false);

  return (
    <PageContainer noPadding className="pb-20">
      <Header
        title="Mes signalements"
        showBack
        rightElement={
          <Button size="sm" variant="outline" onClick={() => setShowNewReport(true)}>
            <Flag className="h-4 w-4 mr-1" />
            Signaler
          </Button>
        }
      />

      <div className="px-4 space-y-4">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 w-full" />)}
          </div>
        ) : reports?.length === 0 ? (
          <div className="text-center py-16">
            <Flag className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-muted-foreground mb-4">Aucun signalement</p>
            <Button variant="outline" onClick={() => setShowNewReport(true)}>
              Faire un signalement
            </Button>
          </div>
        ) : (
          reports?.map((report) => {
            const config = statusConfig[report.status] || statusConfig.pending;
            const StatusIcon = config.icon;
            return (
              <Card key={report.id} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={config.variant}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {config.label}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(report.created_at), { addSuffix: true, locale: fr })}
                      </span>
                    </div>
                    <p className="text-sm font-medium">{reasonLabels[report.reason] || report.reason}</p>
                    {report.description && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{report.description}</p>
                    )}
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>

      <ReportDialog
        open={showNewReport}
        onOpenChange={setShowNewReport}
        targetType="technical"
      />

      <BottomNavigation />
    </PageContainer>
  );
}
