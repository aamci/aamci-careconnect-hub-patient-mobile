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
  Sun,
  Smartphone,
  Lock,
  Download,
  Trash2,
  Globe
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { PageContainer } from "@/components/layout/PageContainer";
import { Card } from "@/components/common/Card";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
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

export default function SettingsPage() {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { toast } = useToast();

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Déconnexion réussie",
      description: "À bientôt !",
    });
    navigate("/login");
  };

  const handleExportData = () => {
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
          onClick: () => navigate("/settings/password"),
        },
        {
          icon: Smartphone,
          label: "Authentification biométrique",
          toggle: true,
          defaultValue: false,
        },
        {
          icon: Shield,
          label: "Appareils connectés",
          description: "Gérer les sessions actives",
          onClick: () => navigate("/settings/devices"),
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
        },
        {
          icon: Trash2,
          label: "Supprimer mon compte",
          description: "Cette action est irréversible",
          destructive: true,
          onClick: () => {},
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
          onClick: () => {},
        },
        {
          icon: Moon,
          label: "Mode sombre",
          toggle: true,
          defaultValue: false,
        },
      ],
    },
    {
      title: "Aide & Légal",
      items: [
        {
          icon: HelpCircle,
          label: "Centre d'aide",
          onClick: () => {},
        },
        {
          icon: FileText,
          label: "Conditions d'utilisation",
          onClick: () => navigate("/terms"),
        },
        {
          icon: Shield,
          label: "Politique de confidentialité",
          onClick: () => navigate("/privacy"),
        },
      ],
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
          <h1 className="text-lg font-semibold">Paramètres</h1>
        </div>
      </div>

      <div className="px-4 py-6 space-y-6">
        {settingsGroups.map((group) => (
          <div key={group.title}>
            <h2 className="text-sm font-medium text-muted-foreground mb-2 px-1">
              {group.title}
            </h2>
            <Card className="divide-y">
              {group.items.map((item) => (
                <div 
                  key={item.label}
                  className={`flex items-center justify-between p-4 ${item.onClick && !item.toggle ? 'cursor-pointer hover:bg-muted/50' : ''}`}
                  onClick={!item.toggle ? item.onClick : undefined}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${item.destructive ? 'bg-destructive/10' : 'bg-muted'}`}>
                      <item.icon className={`h-5 w-5 ${item.destructive ? 'text-destructive' : 'text-muted-foreground'}`} />
                    </div>
                    <div>
                      <p className={`font-medium ${item.destructive ? 'text-destructive' : ''}`}>
                        {item.label}
                      </p>
                      {item.description && (
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      )}
                    </div>
                  </div>
                  
                  {item.toggle ? (
                    <Switch defaultChecked={item.defaultValue} />
                  ) : item.value ? (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <span className="text-sm">{item.value}</span>
                      <ChevronRight className="h-5 w-5" />
                    </div>
                  ) : (
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
              ))}
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
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Se déconnecter ?</AlertDialogTitle>
              <AlertDialogDescription>
                Vous serez redirigé vers la page de connexion.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction onClick={handleSignOut}>
                Se déconnecter
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* App Version */}
        <p className="text-center text-sm text-muted-foreground">
          MédiSanté v1.0.0
        </p>
      </div>
    </PageContainer>
  );
}
