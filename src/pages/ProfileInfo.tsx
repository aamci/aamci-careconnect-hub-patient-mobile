import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Save, Loader2 } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/common/Card";
import { Avatar } from "@/components/common/Avatar";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { usePatientProfiles, useUpdateProfile } from "@/hooks/usePatientProfiles";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export default function ProfileInfoPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { data: profiles, isLoading } = usePatientProfiles();
  const updateProfile = useUpdateProfile();
  
  const currentProfile = profiles?.find(p => p.profile_type === 'self') || profiles?.[0];
  
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [initialized, setInitialized] = useState(false);

  // Update state when profile loads
  if (currentProfile && !initialized) {
    setFirstName(currentProfile.first_name);
    setLastName(currentProfile.last_name);
    setPhone(currentProfile.phone || "");
    setBirthDate(currentProfile.birth_date || "");
    setStreet(currentProfile.street || "");
    setCity(currentProfile.city || "");
    setPostalCode(currentProfile.postal_code || "");
    setInitialized(true);
  }

  const handleSave = async () => {
    if (!currentProfile) return;
    
    try {
      await updateProfile.mutateAsync({
        id: currentProfile.id,
        first_name: firstName,
        last_name: lastName,
        phone,
        birth_date: birthDate || null,
        street,
        city,
        postal_code: postalCode,
      });
      
      toast({
        title: "Profil mis à jour",
        description: "Vos informations ont été enregistrées avec succès",
      });
      
      navigate(-1);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de mettre à jour le profil",
      });
    }
  };

  if (isLoading) {
    return (
      <PageContainer noPadding>
        <Header title="Mes informations" showBack />
        <div className="px-4 py-6 space-y-4 max-w-lg mx-auto">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer noPadding className="pb-24 overflow-x-hidden">
      <Header title="Mes informations" showBack />
      
      <div className="px-4 pb-4 max-w-lg mx-auto">
        {/* Avatar Section */}
        <div className="flex flex-col items-center py-6">
          <Avatar
            src={currentProfile?.avatar_url || undefined}
            alt={`${firstName} ${lastName}`}
            size="xl"
            className="w-24 h-24"
          />
          <Button variant="ghost" size="sm" className="mt-2 text-primary">
            Modifier la photo
          </Button>
        </div>

        {/* Form */}
        <div className="space-y-6">
          <Card variant="flat" className="p-4 space-y-4">
            <h3 className="font-semibold text-sm text-muted-foreground">Identité</h3>
            
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Prénom</label>
                <Input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Votre prénom"
                  className="h-11"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Nom</label>
                <Input
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Votre nom"
                  className="h-11"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Date de naissance</label>
                <Input
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="h-11"
                />
              </div>
            </div>
          </Card>

          <Card variant="flat" className="p-4 space-y-4">
            <h3 className="font-semibold text-sm text-muted-foreground">Contact</h3>
            
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Email</label>
                <Input
                  value={user?.email || ""}
                  disabled
                  className="h-11 bg-muted"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Téléphone</label>
                <Input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+33 6 12 34 56 78"
                  className="h-11"
                />
              </div>
            </div>
          </Card>

          <Card variant="flat" className="p-4 space-y-4">
            <h3 className="font-semibold text-sm text-muted-foreground">Adresse</h3>
            
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Rue</label>
                <Input
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  placeholder="15 Rue de la Paix"
                  className="h-11"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Code postal</label>
                  <Input
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    placeholder="75002"
                    className="h-11"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Ville</label>
                  <Input
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Paris"
                    className="h-11"
                  />
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Save Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-card/95 backdrop-blur-lg border-t border-border safe-area-bottom">
        <div className="max-w-lg mx-auto">
          <Button
            className="w-full"
            size="lg"
            onClick={handleSave}
            disabled={updateProfile.isPending}
          >
            {updateProfile.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Enregistrement...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Enregistrer
              </>
            )}
          </Button>
        </div>
      </div>
    </PageContainer>
  );
}