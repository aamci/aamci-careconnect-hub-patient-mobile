import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft,
  Bell,
  Shield,
  HelpCircle,
  FileText,
  LogOut,
  ChevronRight,
  Moon,
  Smartphone,
  Lock,
  Download,
  Trash2,
  Globe,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { PageContainer } from "@/components/layout/PageContainer";
import { Card } from "@/components/common/Card";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useState } from "react";

import { ChangePasswordDialog } from "@/components/settings/ChangePasswordDialog";
import { useDarkMode } from "@/hooks/useDarkMode";

export default function SettingsPage() {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { toast } = useToast();
  const { enabled: darkMode, toggle: toggleDarkMode } = useDarkMode();
  const [biometric, setBiometric] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);


  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Déconnexion réussie",
      description: "À bientôt !",
    });
    navigate("/login");
  };

  const handleExportData = async () => {
    setExporting(true);
    // Simulate export
    await new Promise(resolve => setTimeout(resolve, 2000));
    setExporting(false);
    toast({
      title: "Export en cours",
      description: "Vous recevrez vos données par email dans quelques minutes",
    });
  };

  const settingsGroups = [
    {
      title: "Notifications",
      items: [
        {
          icon: Bell,
          label: "Préférences de notifications",
          description: "Gérer les alertes et rappels",
          onClick: () => navigate("/settings/notifications"),
        },
      ],
    },
    {
      title: "Sécurité",
      items: [
        {
          icon: Lock,
          label: "Changer le mot de passe",
          onClick: () => setPasswordOpen(true),
        },

        {
          icon: Smartphone,
          label: "Authentification biométrique",
          toggle: true,
          checked: biometric,
          onToggle: () => {
            setBiometric(!biometric);
            toast({
              title: biometric ? "Biométrie désactivée" : "Biométrie activée",
              description: biometric 
                ? "L'authentification biométrique a été désactivée" 
                : "Utilisez votre empreinte ou Face ID pour vous connecter",
            });
          },
        },
        {
          icon: Shield,
          label: "Appareils connectés",
          description: "Gérer les sessions actives",
          onClick: () => {
            toast({
              title: "Sessions actives",
              description: "Vous êtes connecté sur 1 appareil",
            });
          },
        },
      ],
    },
    {
      title: "Données personnelles",
      items: [
        {
          icon: Download,
          label: "Exporter mes données",
          description: "Télécharger une copie de vos données",
          onClick: handleExportData,
          loading: exporting,
        },
        {
          icon: Trash2,
          label: "Supprimer mon compte",
          description: "Cette action est irréversible",
          destructive: true,
          showDialog: true,
        },
      ],
    },
    {
      title: "Préférences",
      items: [
        {
          icon: Globe,
          label: "Langue",
          value: "Français",
          onClick: () => {
            toast({
              title: "Langue",
              description: "Seul le français est disponible pour le moment",
            });
          },
        },
        {
          icon: Moon,
          label: "Mode sombre",
          toggle: true,
          checked: darkMode,
          onToggle: () => {
            toggleDarkMode();
            toast({
              title: darkMode ? "Mode clair activé" : "Mode sombre activé",
              description: "Le thème a été modifié",
            });
          },

        },
      ],
    },
    {
      title: "Aide & Légal",
      items: [
        {
          icon: HelpCircle,
          label: "Centre d'aide",
          onClick: () => navigate("/help"),
        },
        {
          icon: FileText,
          label: "Conditions d'utilisation",
          onClick: () => {
            toast({
              title: "Conditions d'utilisation",
              description: "Les conditions seront disponibles prochainement",
            });
          },
        },
        {
          icon: Shield,
          label: "Politique de confidentialité",
          onClick: () => {
            toast({
              title: "Politique de confidentialité",
              description: "La politique de confidentialité sera disponible prochainement",
            });
          },
        },
      ],
    },
  ];

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
          <h1 className="text-lg font-semibold">Paramètres</h1>
        </div>
      </div>

      <div className="px-4 py-6 space-y-6 max-w-lg mx-auto">
        {settingsGroups.map((group) => (
          <div key={group.title}>
            <h2 className="text-sm font-medium text-muted-foreground mb-2 px-1">
              {group.title}
            </h2>
            <Card variant="flat" className="divide-y divide-border">
              {group.items.map((item) => {
                const content = (
                  <div 
                    key={item.label}
                    className={cn(
                      "flex items-center justify-between p-3 sm:p-4 min-h-[56px]",
                      item.onClick && !item.toggle ? 'cursor-pointer hover:bg-muted/50' : '',
                      item.destructive ? 'text-destructive' : ''
                    )}
                    onClick={!item.toggle && !item.showDialog ? item.onClick : undefined}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className={cn(
                        "p-2 rounded-lg shrink-0",
                        item.destructive ? 'bg-destructive/10' : 'bg-primary/10'
                      )}>
                        <item.icon className={cn(
                          "h-4 w-4 sm:h-5 sm:w-5",
                          item.destructive ? 'text-destructive' : 'text-primary'
                        )} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className={cn(
                          "font-medium text-sm sm:text-base truncate",
                          item.destructive ? 'text-destructive' : 'text-foreground'
                        )}>
                          {item.label}
                        </p>
                        {item.description && (
                          <p className="text-xs sm:text-sm text-muted-foreground truncate">
                            {item.description}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    {item.toggle ? (
                      <Switch 
                        checked={item.checked} 
                        onCheckedChange={item.onToggle}
                      />
                    ) : item.loading ? (
                      <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    ) : item.value ? (
                      <div className="flex items-center gap-2 text-muted-foreground shrink-0">
                        <span className="text-xs sm:text-sm">{item.value}</span>
                        <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
                      </div>
                    ) : !item.showDialog ? (
                      <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground shrink-0" />
                    ) : null}
                  </div>
                );

                if (item.showDialog) {
                  return (
                    <AlertDialog key={item.label}>
                      <AlertDialogTrigger asChild>
                        {content}
                      </AlertDialogTrigger>
                      <AlertDialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-md mx-4">
                        <AlertDialogHeader>
                          <AlertDialogTitle>Supprimer votre compte ?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Cette action est irréversible. Toutes vos données seront définitivement supprimées, 
                            y compris vos rendez-vous, documents et messages.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                          <AlertDialogCancel className="w-full sm:w-auto">Annuler</AlertDialogCancel>
                          <AlertDialogAction 
                            className="w-full sm:w-auto bg-destructive hover:bg-destructive/90"
                            onClick={() => {
                              toast({
                                title: "Demande envoyée",
                                description: "Votre demande de suppression sera traitée sous 30 jours",
                              });
                            }}
                          >
                            Supprimer définitivement
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  );
                }

                return content;
              })}
            </Card>
          </div>
        ))}

        {/* Sign Out Button */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" className="w-full" size="lg">
              <LogOut className="h-5 w-5 mr-2" />
              Se déconnecter
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-md mx-4">
            <AlertDialogHeader>
              <AlertDialogTitle>Se déconnecter ?</AlertDialogTitle>
              <AlertDialogDescription>
                Vous serez redirigé vers la page de connexion.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex-col sm:flex-row gap-2">
              <AlertDialogCancel className="w-full sm:w-auto">Annuler</AlertDialogCancel>
              <AlertDialogAction onClick={handleSignOut} className="w-full sm:w-auto">
                Se déconnecter
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* App Version */}
        <p className="text-center text-xs sm:text-sm text-muted-foreground">
          MédiSanté v1.0.0
        </p>
      </div>
    </PageContainer>
  );
}
