import { useNavigate } from "react-router-dom";
import { Plus, ChevronRight, User, Baby, Users } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/common/Card";
import { Avatar } from "@/components/common/Avatar";
import { Badge } from "@/components/common/Badge";
import { Skeleton } from "@/components/ui/skeleton";
import { usePatientProfiles } from "@/hooks/usePatientProfiles";

const profileTypeConfig = {
  self: { label: "Moi", icon: User, color: "primary" },
  child: { label: "Enfant", icon: Baby, color: "info" },
  dependent: { label: "Proche", icon: Users, color: "muted" },
};

export default function ManagedProfilesPage() {
  const navigate = useNavigate();
  const { data: profiles, isLoading } = usePatientProfiles();

  return (
    <PageContainer noPadding className="overflow-x-hidden">
      <Header 
        title="Profils gérés" 
        showBack
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
        <p className="text-sm text-muted-foreground mb-4">
          Gérez les profils de vos enfants et proches pour prendre des rendez-vous en leur nom.
        </p>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <Card key={i} variant="flat" className="p-4">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-12 h-12 rounded-full" />
                  <div className="flex-1">
                    <Skeleton className="h-5 w-32 mb-1" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {profiles?.map((profile) => {
              const config = profileTypeConfig[profile.profile_type as keyof typeof profileTypeConfig] || profileTypeConfig.dependent;
              const Icon = config.icon;
              
              return (
                <Card 
                  key={profile.id} 
                  hover
                  variant="flat"
                  className="p-3 sm:p-4"
                  onClick={() => navigate(`/profile/edit/${profile.id}`)}
                >
                  <div className="flex items-center gap-3">
                    <Avatar
                      src={profile.avatar_url || undefined}
                      alt={`${profile.first_name} ${profile.last_name}`}
                      size="lg"
                      className="shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground text-sm sm:text-base truncate">
                        {profile.first_name} {profile.last_name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={config.color as any} icon={<Icon className="h-3 w-3" />} className="text-[10px] sm:text-xs">
                          {config.label}
                        </Badge>
                        {profile.birth_date && (
                          <span className="text-xs text-muted-foreground">
                            {new Date().getFullYear() - new Date(profile.birth_date).getFullYear()} ans
                          </span>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground shrink-0" />
                  </div>
                </Card>
              );
            })}

            {/* Add Profile Card */}
            <Card 
              hover
              variant="flat"
              className="p-3 sm:p-4 border-dashed"
              onClick={() => navigate("/profile/add")}
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Plus className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-primary text-sm sm:text-base">
                    Ajouter un profil
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Enfant ou proche
                  </p>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </PageContainer>
  );
}