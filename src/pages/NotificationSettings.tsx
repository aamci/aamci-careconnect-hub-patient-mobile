import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Bell, Mail, MessageSquare, Calendar, FileText, Megaphone } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { PageContainer } from "@/components/layout/PageContainer";
import { Card } from "@/components/common/Card";
import { useToast } from "@/hooks/use-toast";

export default function NotificationSettingsPage() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [preferences, setPreferences] = useState({
    push: true,
    email: true,
    sms: false,
    appointmentReminders: true,
    messageNotifications: true,
    documentNotifications: true,
    marketingEmails: false,
  });

  const handleToggle = (key: keyof typeof preferences) => {
    setPreferences((prev) => {
      const newPrefs = { ...prev, [key]: !prev[key] };
      toast({
        title: "Préférences mises à jour",
        description: "Vos préférences de notifications ont été enregistrées",
      });
      return newPrefs;
    });
  };

  const channelSettings = [
    {
      key: "push" as const,
      icon: Bell,
      label: "Notifications push",
      description: "Notifications sur votre appareil",
    },
    {
      key: "email" as const,
      icon: Mail,
      label: "Email",
      description: "Recevoir des emails",
    },
    {
      key: "sms" as const,
      icon: MessageSquare,
      label: "SMS",
      description: "Recevoir des SMS",
    },
  ];

  const typeSettings = [
    {
      key: "appointmentReminders" as const,
      icon: Calendar,
      label: "Rappels de rendez-vous",
      description: "Rappels avant vos consultations",
    },
    {
      key: "messageNotifications" as const,
      icon: MessageSquare,
      label: "Messages",
      description: "Nouveaux messages des praticiens",
    },
    {
      key: "documentNotifications" as const,
      icon: FileText,
      label: "Documents",
      description: "Nouveaux documents disponibles",
    },
    {
      key: "marketingEmails" as const,
      icon: Megaphone,
      label: "Actualités et conseils",
      description: "Newsletters et informations santé",
    },
  ];

  return (
    <PageContainer noPadding withBottomNav={false}>
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b">
        <div className="flex items-center gap-4 px-4 py-3">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-muted rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-lg font-semibold">Notifications</h1>
        </div>
      </div>

      <div className="px-4 py-6 space-y-6">
        {/* Channels */}
        <div>
          <h2 className="text-sm font-medium text-muted-foreground mb-2 px-1">
            Canaux de notification
          </h2>
          <Card className="divide-y">
            {channelSettings.map((setting) => (
              <div 
                key={setting.key}
                className="flex items-center justify-between p-4"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-muted">
                    <setting.icon className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium">{setting.label}</p>
                    <p className="text-sm text-muted-foreground">{setting.description}</p>
                  </div>
                </div>
                <Switch 
                  checked={preferences[setting.key]}
                  onCheckedChange={() => handleToggle(setting.key)}
                />
              </div>
            ))}
          </Card>
        </div>

        {/* Types */}
        <div>
          <h2 className="text-sm font-medium text-muted-foreground mb-2 px-1">
            Types de notifications
          </h2>
          <Card className="divide-y">
            {typeSettings.map((setting) => (
              <div 
                key={setting.key}
                className="flex items-center justify-between p-4"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-muted">
                    <setting.icon className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium">{setting.label}</p>
                    <p className="text-sm text-muted-foreground">{setting.description}</p>
                  </div>
                </div>
                <Switch 
                  checked={preferences[setting.key]}
                  onCheckedChange={() => handleToggle(setting.key)}
                />
              </div>
            ))}
          </Card>
        </div>

        <p className="text-sm text-muted-foreground text-center px-4">
          Vous pouvez modifier ces préférences à tout moment. Les notifications importantes relatives à votre santé seront toujours envoyées.
        </p>
      </div>
    </PageContainer>
  );
}
