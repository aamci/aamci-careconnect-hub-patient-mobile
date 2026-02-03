import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, User, Baby, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageContainer } from "@/components/layout/PageContainer";
import { Card } from "@/components/common/Card";
import { useToast } from "@/hooks/use-toast";

type ProfileType = "child" | "dependent";

export default function AddProfilePage() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [profileType, setProfileType] = useState<ProfileType>("child");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [gender, setGender] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    toast({
      title: "Profil créé",
      description: `Le profil de ${firstName} a été ajouté avec succès`,
    });

    setLoading(false);
    navigate("/profile");
  };

  const profileTypes = [
    {
      value: "child" as const,
      icon: Baby,
      label: "Enfant",
      description: "Moins de 18 ans",
    },
    {
      value: "dependent" as const,
      icon: Users,
      label: "Proche dépendant",
      description: "Parent, conjoint, etc.",
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
          <h1 className="text-lg font-semibold">Ajouter un profil</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="px-4 py-6 space-y-6">
        {/* Profile Type */}
        <div className="space-y-3">
          <Label>Type de profil</Label>
          <div className="grid grid-cols-2 gap-3">
            {profileTypes.map((type) => (
              <Card
                key={type.value}
                className={`p-4 cursor-pointer transition-all ${
                  profileType === type.value
                    ? "border-primary bg-primary/5"
                    : "hover:border-primary/50"
                }`}
                onClick={() => setProfileType(type.value)}
              >
                <div className="text-center">
                  <div className={`inline-flex p-3 rounded-full mb-2 ${
                    profileType === type.value ? "bg-primary/10" : "bg-muted"
                  }`}>
                    <type.icon className={`h-6 w-6 ${
                      profileType === type.value ? "text-primary" : "text-muted-foreground"
                    }`} />
                  </div>
                  <p className="font-medium">{type.label}</p>
                  <p className="text-xs text-muted-foreground">{type.description}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Personal Info */}
        <Card className="p-4 space-y-4">
          <h3 className="font-semibold flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            Informations personnelles
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">Prénom *</Label>
              <Input
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Prénom"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Nom *</Label>
              <Input
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Nom"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="birthDate">Date de naissance *</Label>
            <Input
              id="birthDate"
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Genre *</Label>
            <RadioGroup value={gender} onValueChange={setGender} className="flex gap-4">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="male" id="male" />
                <Label htmlFor="male" className="font-normal">Masculin</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="female" id="female" />
                <Label htmlFor="female" className="font-normal">Féminin</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="other" id="other" />
                <Label htmlFor="other" className="font-normal">Autre</Label>
              </div>
            </RadioGroup>
          </div>

          {profileType === "dependent" && (
            <div className="space-y-2">
              <Label htmlFor="relationship">Lien de parenté</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="parent">Parent</SelectItem>
                  <SelectItem value="spouse">Conjoint(e)</SelectItem>
                  <SelectItem value="sibling">Frère/Sœur</SelectItem>
                  <SelectItem value="other">Autre</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </Card>

        <div className="pt-4">
          <Button type="submit" className="w-full" size="lg" disabled={loading}>
            {loading ? "Création en cours..." : "Créer le profil"}
          </Button>
        </div>

        <p className="text-sm text-muted-foreground text-center">
          En créant ce profil, vous certifiez être le représentant légal ou avoir l'autorisation de gérer les informations de santé de cette personne.
        </p>
      </form>
    </PageContainer>
  );
}
