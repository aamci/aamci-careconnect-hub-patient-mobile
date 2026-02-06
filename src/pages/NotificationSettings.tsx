import { useNavigate } from "react-router-dom";
import { ArrowLeft, Bell, Mail, MessageSquare, Calendar, FileText, Megaphone, Loader2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { PageContainer } from "@/components/layout/PageContainer";
import { Card } from "@/components/common/Card";
import { Skeleton } from "@/components/ui/skeleton";
import { useNotificationPreferences, useUpdateNotificationPreferences } from "@/hooks/useNotificationPreferences";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export default function NotificationSettingsPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: preferences, isLoading } = useNotificationPreferences();
  const updatePreferences = useUpdateNotificationPreferences();

  const handleToggle = async (key: string, value: boolean) => {
    try {
      await updatePreferences.mutateAsync({ [key]: value });
      toast({
        title: "Préférences mises à jour",
        description: "Vos préférences de notifications ont été enregistrées",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour les préférences",
        variant: "destructive",
      });
    }
  };

  const channelSettings = [
    {
      key: "push_enabled",
      icon: Bell,
      label: "Notifications push",
      description: "Notifications sur votre appareil",
    },
    {
      key: "email_enabled",
      icon: Mail,
      label: "Email",
      description: "Recevoir des emails",
    },
    {
      key: "sms_enabled",
      icon: MessageSquare,
      label: "SMS",
      description: "Recevoir des SMS",
    },
  ];

  const typeSettings = [
    {
      key: "appointment_reminders",
      icon: Calendar,
      label: "Rappels de rendez-vous",
      description: "Rappels avant vos consultations",
    },
    {
      key: "message_notifications",
      icon: MessageSquare,
      label: "Messages",
      description: "Nouveaux messages des praticiens",
    },
    {
      key: "document_notifications",
      icon: FileText,
      label: "Documents",
      description: "Nouveaux documents disponibles",
    },
    {
      key: "marketing_emails",
      icon: Megaphone,
      label: "Actualités et conseils",
      description: "Newsletters et informations santé",
    },
  ];

  const getPreferenceValue = (key: string): boolean => {
    if (!preferences) return true;
    const prefKey = key as keyof typeof preferences;
    const value = preferences[prefKey];
    return value === null || value === undefined ? true : Boolean(value);
  };

  return (
    <PageContainer noPadding withBottomNav={false} className="overflow-x-hidden">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b">
        <div className="flex items-center gap-4 px-4 py-3">
          <button 
            onClick={() => navigate(-1)} 
            className="p-2 -ml-2 hover:bg-muted rounded-full min-w-[44px] min-h-[44px] flex items-center justify-center"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-lg font-semibold">Notifications</h1>
        </div>
      </div>

      <div className="px-4 py-6 space-y-6 max-w-lg mx-auto">
        {/* Channels */}
        <div>
          <h2 className="text-sm font-medium text-muted-foreground mb-2 px-1">
            Canaux de notification
          </h2>
          <Card variant="flat" className="divide-y divide-border">
            {isLoading ? (
              <>
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between p-3 sm:p-4">
                    <div className="flex items-center gap-3">
                      <Skeleton className="w-9 h-9 rounded-lg" />
                      <div>
                        <Skeleton className="h-4 w-32 mb-1" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
                    <Skeleton className="h-6 w-11 rounded-full" />
                  </div>
                ))}
              </>
            ) : (
              channelSettings.map((setting) => (
                <div 
                  key={setting.key}
                  className="flex items-center justify-between p-3 sm:p-4 min-h-[56px]"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                      <setting.icon className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm sm:text-base truncate">{setting.label}</p>
                      <p className="text-xs sm:text-sm text-muted-foreground truncate">
                        {setting.description}
                      </p>
                    </div>
                  </div>
                  <Switch 
                    checked={getPreferenceValue(setting.key)}
                    onCheckedChange={(checked) => handleToggle(setting.key, checked)}
                    disabled={updatePreferences.isPending}
                  />
                </div>
              ))
            )}
          </Card>
        </div>

        {/* Types */}
        <div>
          <h2 className="text-sm font-medium text-muted-foreground mb-2 px-1">
            Types de notifications
          </h2>
          <Card variant="flat" className="divide-y divide-border">
            {isLoading ? (
              <>
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center justify-between p-3 sm:p-4">
                    <div className="flex items-center gap-3">
                      <Skeleton className="w-9 h-9 rounded-lg" />
                      <div>
                        <Skeleton className="h-4 w-36 mb-1" />
                        <Skeleton className="h-3 w-28" />
                      </div>
                    </div>
                    <Skeleton className="h-6 w-11 rounded-full" />
                  </div>
                ))}
              </>
            ) : (
              typeSettings.map((setting) => (
                <div 
                  key={setting.key}
                  className="flex items-center justify-between p-3 sm:p-4 min-h-[56px]"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                      <setting.icon className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm sm:text-base truncate">{setting.label}</p>
                      <p className="text-xs sm:text-sm text-muted-foreground truncate">
                        {setting.description}
                      </p>
                    </div>
                  </div>
                  <Switch 
                    checked={getPreferenceValue(setting.key)}
                    onCheckedChange={(checked) => handleToggle(setting.key, checked)}
                    disabled={updatePreferences.isPending}
                  />
                </div>
              ))
            )}
          </Card>
        </div>

        <p className="text-xs sm:text-sm text-muted-foreground text-center px-4">
          Vous pouvez modifier ces préférences à tout moment. Les notifications importantes relatives à votre santé seront toujours envoyées.
        </p>
      </div>
    </PageContainer>
  );
}
