import { useNavigate } from "react-router-dom";
import {
  Bell,
  Calendar,
  CalendarCheck,
  CalendarX,
  MessageSquare,
  FileText,
  Stethoscope,
  Trash2,
  CheckCheck,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { Header } from "@/components/layout/Header";
import { PageContainer } from "@/components/layout/PageContainer";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  useNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
  useDeleteNotification,
  type AppNotification,
} from "@/hooks/useNotifications";

const ICONS: Record<string, typeof Bell> = {
  appointment_created: Calendar,
  appointment_confirmed: CalendarCheck,
  appointment_cancelled: CalendarX,
  appointment_completed: Stethoscope,
  new_message: MessageSquare,
  new_document: FileText,
  new_report: Stethoscope,
};

export default function Notifications() {
  const navigate = useNavigate();
  const { data: notifications, isLoading } = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAll = useMarkAllNotificationsRead();
  const remove = useDeleteNotification();

  const unread = notifications?.filter((n) => !n.is_read).length ?? 0;

  const handleOpen = (n: AppNotification) => {
    if (!n.is_read) markRead.mutate(n.id);
    if (n.link) navigate(n.link);
  };

  return (
    <>
      <PageContainer noPadding>
        <Header
          title="Notifications"
          showBack
          rightElement={
            unread > 0 ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => markAll.mutate()}
                className="text-xs"
              >
                <CheckCheck className="h-4 w-4 mr-1" />
                Tout lire
              </Button>
            ) : undefined
          }
        />

        <div className="px-4 py-4 max-w-lg mx-auto space-y-2">
          {isLoading ? (
            <>
              <Skeleton className="h-20 w-full rounded-xl" />
              <Skeleton className="h-20 w-full rounded-xl" />
              <Skeleton className="h-20 w-full rounded-xl" />
            </>
          ) : !notifications?.length ? (
            <EmptyState
              icon={Bell}
              title="Aucune notification"
              description="Vos rappels de rendez-vous, messages et nouveaux documents apparaîtront ici."
            />
          ) : (
            notifications.map((n) => {
              const Icon = ICONS[n.type] ?? Bell;
              return (
                <div
                  key={n.id}
                  className={cn(
                    "flex items-start gap-3 rounded-xl border p-3 transition-colors",
                    n.is_read
                      ? "bg-card border-border/50"
                      : "bg-primary/5 border-primary/20"
                  )}
                >
                  <button
                    onClick={() => handleOpen(n)}
                    className="flex items-start gap-3 flex-1 min-w-0 text-left"
                  >
                    <span
                      className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                        n.is_read ? "bg-muted" : "bg-primary/15"
                      )}
                    >
                      <Icon
                        className={cn(
                          "h-5 w-5",
                          n.is_read ? "text-muted-foreground" : "text-primary"
                        )}
                      />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold truncate">
                        {n.title}
                      </span>
                      <span className="block text-sm text-muted-foreground line-clamp-2">
                        {n.body}
                      </span>
                      <span className="block text-xs text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(n.created_at), {
                          addSuffix: true,
                          locale: fr,
                        })}
                      </span>
                    </span>
                  </button>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Supprimer la notification"
                    onClick={() => remove.mutate(n.id)}
                    className="shrink-0 min-h-11 min-w-11 text-muted-foreground"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              );
            })
          )}
        </div>
      </PageContainer>
      <BottomNavigation />
    </>
  );
}
