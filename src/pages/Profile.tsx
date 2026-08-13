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
  ShieldPlus,
  Bot,
  BookOpen,
  Sparkles,
  Crown,
  Mail,
  Phone,
  Flag,
  Activity,
  Share2
} from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { Header } from "@/components/layout/Header";
import { Card } from "@/components/common/Card";
import { Avatar } from "@/components/common/Avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/common/Badge";
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
  iconBg?: string;
  iconColor?: string;
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
          path: "/profile/info",
          iconBg: "bg-blue-500/10",
          iconColor: "text-blue-500",
        },
        { 
          icon: Users, 
          label: "Profils gérés", 
          description: `${profileCount} profil${profileCount > 1 ? 's' : ''}`,
          path: "/profile/managed",
          iconBg: "bg-violet-500/10",
          iconColor: "text-violet-500",
        },
        { 
          icon: ShieldPlus, 
          label: "Formulaire de santé", 
          description: "Antécédents, allergies, traitements",
          path: "/profile/health",
          iconBg: "bg-emerald-500/10",
          iconColor: "text-emerald-500",
        },
        { 
          icon: FileText, 
          label: "Mes documents", 
          description: "Ordonnances, résultats",
          path: "/documents",
          iconBg: "bg-amber-500/10",
          iconColor: "text-amber-500",
        },
        { 
          icon: Heart, 
          label: "Mes favoris", 
          description: "Praticiens favoris",
          path: "/favorites",
          iconBg: "bg-rose-500/10",
          iconColor: "text-rose-500",
        },
        { 
          icon: History, 
          label: "Historique médical", 
          description: "Consultations, prescriptions",
          path: "/history",
          iconBg: "bg-cyan-500/10",
          iconColor: "text-cyan-500",
        },
        { 
          icon: Activity, 
          label: "Mes constantes", 
          description: "Poids, tension, glycémie…",
          path: "/health/metrics",
          iconBg: "bg-sky-500/10",
          iconColor: "text-sky-500",
        },
        { 
          icon: Share2, 
          label: "Partage du dossier", 
          description: "Donner un accès temporaire à un praticien",
          path: "/share",
          iconBg: "bg-violet-500/10",
          iconColor: "text-violet-500",
        },
      ],
    },
    {
      title: "Assistance & ressources",
      items: [
        { 
          icon: Bot, 
          label: "Assistant Patient IA", 
          description: "Disponible 24h/24 · Santé, prévention, bien-être",
          path: "/assistant",
          iconBg: "bg-gradient-to-br from-primary/15 to-accent/15",
          iconColor: "text-primary",
          badge: "Nouveau",
        },
        { 
          icon: BookOpen, 
          label: "Contenus santé", 
          description: "Articles, vidéos sur la prévention et le bien-être",
          path: "/health-content",
          iconBg: "bg-teal-500/10",
          iconColor: "text-teal-500",
        },
      ],
    },
    {
      title: "Paramètres",
      items: [
        { 
          icon: Bell, 
          label: "Notifications", 
          path: "/settings/notifications",
          iconBg: "bg-orange-500/10",
          iconColor: "text-orange-500",
        },
        { 
          icon: Shield, 
          label: "Confidentialité & sécurité", 
          path: "/settings",
          iconBg: "bg-slate-500/10",
          iconColor: "text-slate-500",
        },
        { 
          icon: Settings, 
          label: "Préférences", 
          path: "/settings",
          iconBg: "bg-gray-500/10",
          iconColor: "text-gray-500",
        },
      ],
    },
    {
      title: "Aide",
      items: [
        { 
          icon: HelpCircle, 
          label: "Centre d'aide", 
          path: "/help",
          iconBg: "bg-indigo-500/10",
          iconColor: "text-indigo-500",
        },
        { 
          icon: Flag, 
          label: "Mes signalements", 
          description: "Suivre vos signalements",
          path: "/reports",
          iconBg: "bg-red-500/10",
          iconColor: "text-red-500",
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
          {/* Profile Card - Premium */}
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
            <Card className="p-0 mb-6 overflow-hidden">
              {/* Gradient header */}
              <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-accent/10 px-4 pt-5 pb-4">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="relative shrink-0">
                    <Avatar
                      src={currentProfile?.avatar_url || undefined}
                      alt={currentProfile ? `${currentProfile.first_name} ${currentProfile.last_name}` : 'User'}
                      size="xl"
                    />
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-success flex items-center justify-center border-2 border-card">
                      <Crown className="h-3 w-3 text-success-foreground" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg sm:text-xl font-bold font-display truncate text-foreground">
                      {currentProfile?.first_name} {currentProfile?.last_name}
                    </h2>
                    <div className="space-y-0.5 mt-1">
                      {user?.email && (
                        <div className="flex items-center gap-1.5">
                          <Mail className="h-3 w-3 text-muted-foreground shrink-0" />
                          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                        </div>
                      )}
                      {currentProfile?.phone && (
                        <div className="flex items-center gap-1.5">
                          <Phone className="h-3 w-3 text-muted-foreground shrink-0" />
                          <p className="text-xs text-muted-foreground truncate">{currentProfile.phone}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              {/* Quick stats */}
              <div className="grid grid-cols-3 divide-x divide-border border-t">
                <button onClick={() => navigate("/appointments")} className="py-3 text-center hover:bg-muted/50 transition-colors">
                  <p className="text-sm font-bold text-primary">RDV</p>
                  <p className="text-[10px] text-muted-foreground">Rendez-vous</p>
                </button>
                <button onClick={() => navigate("/documents")} className="py-3 text-center hover:bg-muted/50 transition-colors">
                  <p className="text-sm font-bold text-primary">Docs</p>
                  <p className="text-[10px] text-muted-foreground">Documents</p>
                </button>
                <button onClick={() => navigate("/favorites")} className="py-3 text-center hover:bg-muted/50 transition-colors">
                  <p className="text-sm font-bold text-primary">Favoris</p>
                  <p className="text-[10px] text-muted-foreground">Praticiens</p>
                </button>
              </div>
            </Card>
          )}

          {/* Menu Sections */}
          <div className="space-y-6">
            {menuSections.map((section, sectionIndex) => (
              <div key={sectionIndex}>
                {section.title && (
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 px-1">
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
                            : "hover:bg-muted/50 active:bg-muted"
                        )}
                      >
                        <div className={cn(
                          "w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0",
                          item.iconBg || (isDestructive ? "bg-destructive/10" : "bg-primary/10")
                        )}>
                          <Icon className={cn(
                            "h-4 w-4 sm:h-5 sm:w-5",
                            item.iconColor || (isDestructive ? "text-destructive" : "text-primary")
                          )} />
                        </div>
                        <div className="flex-1 text-left min-w-0">
                          <div className="flex items-center gap-2">
                            <p className={cn(
                              "font-medium text-sm sm:text-base truncate",
                              isDestructive ? "text-destructive" : "text-foreground"
                            )}>
                              {item.label}
                            </p>
                            {item.badge && (
                              <Badge variant="info" className="text-[9px] px-1.5 py-0">
                                {item.badge}
                              </Badge>
                            )}
                          </div>
                          {item.description && (
                            <p className="text-xs sm:text-sm text-muted-foreground truncate">
                              {item.description}
                            </p>
                          )}
                        </div>
                        {!isDestructive && (
                          <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground/50 shrink-0" />
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
          <p className="text-center text-xs text-muted-foreground mt-8 mb-2">
            MédiSanté v1.0.0
          </p>
        </div>
      </PageContainer>
      <BottomNavigation />
    </>
  );
}
