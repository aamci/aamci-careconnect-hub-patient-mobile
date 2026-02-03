import { useNavigate } from "react-router-dom";
import { 
  User, 
  Users, 
  FileText, 
  Bell, 
  Shield, 
  HelpCircle, 
  LogOut,
  ChevronRight,
  Settings,
  Heart,
  Plus
} from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { Header } from "@/components/layout/Header";
import { Card } from "@/components/common/Card";
import { Avatar } from "@/components/common/Avatar";
import { Button } from "@/components/ui/button";
import { currentUserProfile, userProfiles } from "@/data/mockData";
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

interface MenuItem {
  icon: React.ElementType;
  label: string;
  description?: string;
  path?: string;
  onClick?: () => void;
  variant?: "default" | "destructive";
  badge?: string;
}

export default function ProfilePage() {
  const navigate = useNavigate();
  const { signOut, user } = useAuth();
  const { toast } = useToast();

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Déconnexion réussie",
      description: "À bientôt !",
    });
    navigate("/login");
  };

  const menuSections: { title?: string; items: MenuItem[] }[] = [
    {
      items: [
        { 
          icon: User, 
          label: "Mes informations", 
          description: "Données personnelles, adresse",
          path: "/profile/info" 
        },
        { 
          icon: Users, 
          label: "Profils gérés", 
          description: `${userProfiles.length} profil${userProfiles.length > 1 ? 's' : ''}`,
          path: "/profile/managed" 
        },
        { 
          icon: FileText, 
          label: "Mes documents", 
          description: "Ordonnances, résultats",
          path: "/documents" 
        },
        { 
          icon: Heart, 
          label: "Mes favoris", 
          description: "Praticiens favoris",
          path: "/favorites" 
        },
      ],
    },
    {
      title: "Paramètres",
      items: [
        { 
          icon: Bell, 
          label: "Notifications", 
          path: "/settings/notifications" 
        },
        { 
          icon: Shield, 
          label: "Confidentialité & sécurité", 
          path: "/settings" 
        },
        { 
          icon: Settings, 
          label: "Préférences", 
          path: "/settings" 
        },
      ],
    },
    {
      title: "Aide",
      items: [
        { 
          icon: HelpCircle, 
          label: "Centre d'aide", 
          path: "/help" 
        },
      ],
    },
  ];

  return (
    <>
      <PageContainer noPadding>
        <Header 
          title="Mon profil" 
          rightElement={
            <Button
              variant="soft"
              size="icon-sm"
              onClick={() => navigate("/profile/add")}
            >
              <Plus className="h-5 w-5" />
            </Button>
          }
        />
        
        <div className="px-4 pb-4">
          {/* Profile Card */}
          <Card className="p-4 mb-6">
            <div className="flex items-center gap-4">
              <Avatar
                src={currentUserProfile.avatarUrl}
                alt={`${currentUserProfile.firstName} ${currentUserProfile.lastName}`}
                size="xl"
              />
              <div className="flex-1">
                <h2 className="text-xl font-bold font-display">
                  {currentUserProfile.firstName} {currentUserProfile.lastName}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {user?.email || currentUserProfile.email}
                </p>
                <p className="text-sm text-muted-foreground">
                  {currentUserProfile.phone}
                </p>
              </div>
            </div>
          </Card>

          {/* Menu Sections */}
          <div className="space-y-6">
            {menuSections.map((section, sectionIndex) => (
              <div key={sectionIndex}>
                {section.title && (
                  <h3 className="text-sm font-medium text-muted-foreground mb-2 px-1">
                    {section.title}
                  </h3>
                )}
                <Card variant="flat" className="divide-y divide-border">
                  {section.items.map((item, itemIndex) => {
                    const Icon = item.icon;
                    const isDestructive = item.variant === "destructive";
                    
                    return (
                      <button
                        key={itemIndex}
                        onClick={() => item.path ? navigate(item.path) : item.onClick?.()}
                        className={cn(
                          "w-full flex items-center gap-3 p-4 transition-colors",
                          isDestructive 
                            ? "text-destructive hover:bg-destructive/5" 
                            : "hover:bg-muted/50"
                        )}
                      >
                        <div className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center",
                          isDestructive 
                            ? "bg-destructive/10" 
                            : "bg-primary/10"
                        )}>
                          <Icon className={cn(
                            "h-5 w-5",
                            isDestructive ? "text-destructive" : "text-primary"
                          )} />
                        </div>
                        <div className="flex-1 text-left">
                          <p className={cn(
                            "font-medium",
                            isDestructive ? "text-destructive" : "text-foreground"
                          )}>
                            {item.label}
                          </p>
                          {item.description && (
                            <p className="text-sm text-muted-foreground">
                              {item.description}
                            </p>
                          )}
                        </div>
                        {!isDestructive && (
                          <ChevronRight className="h-5 w-5 text-muted-foreground" />
                        )}
                      </button>
                    );
                  })}
                </Card>
              </div>
            ))}

            {/* Sign Out */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Card variant="flat" className="overflow-hidden">
                  <button className="w-full flex items-center gap-3 p-4 transition-colors text-destructive hover:bg-destructive/5">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-destructive/10">
                      <LogOut className="h-5 w-5 text-destructive" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-medium text-destructive">Déconnexion</p>
                    </div>
                  </button>
                </Card>
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
          </div>

          {/* App Version */}
          <p className="text-center text-xs text-muted-foreground mt-8">
            Version 1.0.0
          </p>
        </div>
      </PageContainer>
      <BottomNavigation />
    </>
  );
}
