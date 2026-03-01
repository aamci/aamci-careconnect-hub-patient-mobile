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
  Plus,
  History,
  ShieldPlus
} from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { Header } from "@/components/layout/Header";
import { Card } from "@/components/common/Card";
import { Avatar } from "@/components/common/Avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { usePatientProfiles } from "@/hooks/usePatientProfiles";
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
  const { data: profiles, isLoading: profilesLoading } = usePatientProfiles();
  
  const currentProfile = profiles?.find(p => p.profile_type === 'self') || profiles?.[0];
  const profileCount = profiles?.length || 0;

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
          description: `${profileCount} profil${profileCount > 1 ? 's' : ''}`,
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
        {
          icon: ShieldPlus,
          label: "Formulaire de santé",
          description: "Antécédents, allergies, traitements",
          path: "/profile/health"
        },
        { 
          icon: History, 
          label: "Historique médical", 
          description: "Consultations, prescriptions",
          path: "/history" 
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
      <PageContainer noPadding className="overflow-x-hidden">
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
        
        <div className="px-4 pb-4 max-w-lg mx-auto">
          {/* Profile Card */}
          {profilesLoading ? (
            <Card className="p-4 mb-6">
              <div className="flex items-center gap-4">
                <Skeleton className="w-16 h-16 rounded-full shrink-0" />
                <div className="flex-1 min-w-0">
                  <Skeleton className="h-6 w-32 mb-2" />
                  <Skeleton className="h-4 w-48 mb-1" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
            </Card>
          ) : (
            <Card className="p-4 mb-6">
              <div className="flex items-center gap-3 sm:gap-4">
                <Avatar
                  src={currentProfile?.avatar_url || undefined}
                  alt={currentProfile ? `${currentProfile.first_name} ${currentProfile.last_name}` : 'User'}
                  size="xl"
                  className="shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg sm:text-xl font-bold font-display truncate">
                    {currentProfile?.first_name} {currentProfile?.last_name}
                  </h2>
                  <p className="text-xs sm:text-sm text-muted-foreground truncate">
                    {user?.email}
                  </p>
                  {currentProfile?.phone && (
                    <p className="text-xs sm:text-sm text-muted-foreground truncate">
                      {currentProfile.phone}
                    </p>
                  )}
                </div>
              </div>
            </Card>
          )}

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
                          "w-full flex items-center gap-3 p-3 sm:p-4 transition-colors min-h-[56px]",
                          isDestructive 
                            ? "text-destructive hover:bg-destructive/5" 
                            : "hover:bg-muted/50"
                        )}
                      >
                        <div className={cn(
                          "w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0",
                          isDestructive 
                            ? "bg-destructive/10" 
                            : "bg-primary/10"
                        )}>
                          <Icon className={cn(
                            "h-4 w-4 sm:h-5 sm:w-5",
                            isDestructive ? "text-destructive" : "text-primary"
                          )} />
                        </div>
                        <div className="flex-1 text-left min-w-0">
                          <p className={cn(
                            "font-medium text-sm sm:text-base truncate",
                            isDestructive ? "text-destructive" : "text-foreground"
                          )}>
                            {item.label}
                          </p>
                          {item.description && (
                            <p className="text-xs sm:text-sm text-muted-foreground truncate">
                              {item.description}
                            </p>
                          )}
                        </div>
                        {!isDestructive && (
                          <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground shrink-0" />
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
                  <button className="w-full flex items-center gap-3 p-3 sm:p-4 transition-colors text-destructive hover:bg-destructive/5 min-h-[56px]">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center bg-destructive/10 shrink-0">
                      <LogOut className="h-4 w-4 sm:h-5 sm:w-5 text-destructive" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-medium text-destructive text-sm sm:text-base">Déconnexion</p>
                    </div>
                  </button>
                </Card>
              </AlertDialogTrigger>
              <AlertDialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-lg">
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
