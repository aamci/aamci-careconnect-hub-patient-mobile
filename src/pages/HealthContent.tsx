import { useState, useMemo } from "react";
import { 
  Baby, BookOpen, Apple, Moon, Activity, Heart, Shield, Sparkles,
  ChevronRight, Clock, Star, Play
} from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { Header } from "@/components/layout/Header";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { Card } from "@/components/common/Card";
import { Badge } from "@/components/common/Badge";
import { cn } from "@/lib/utils";
import { usePatientProfiles } from "@/hooks/usePatientProfiles";
import { differenceInMonths, differenceInYears, parse } from "date-fns";

type AgeRange = "0-3m" | "3-6m" | "6-12m" | "1-2y" | "2-4y" | "4-6y" | "6-12y" | "12+y" | "all";
type ContentType = "article" | "video" | "story";

interface HealthArticle {
  id: string;
  title: string;
  summary: string;
  category: string;
  icon: React.ElementType;
  ageRange: AgeRange;
  type: ContentType;
  readTime: string;
  expert: string;
  featured?: boolean;
}

const articles: HealthArticle[] = [
  { id: "1", title: "Les premiers sourires de bébé", summary: "Comprendre les étapes clés du développement social de votre nourrisson", category: "Éveil", icon: Baby, ageRange: "0-3m", type: "article", readTime: "3 min", expert: "Dr. Sophie Martin, pédiatre" },
  { id: "2", title: "Diversification alimentaire : le guide", summary: "Quand et comment introduire les premiers aliments solides en toute sécurité", category: "Nutrition", icon: Apple, ageRange: "3-6m", type: "article", readTime: "5 min", expert: "Dr. Claire Dubois, nutritionniste" },
  { id: "3", title: "Le sommeil de 0 à 6 mois", summary: "Créer une routine de sommeil saine pour les tout-petits", category: "Sommeil", icon: Moon, ageRange: "0-3m", type: "video", readTime: "8 min", expert: "Dr. Jean Leroy, pédopsychiatre", featured: true },
  { id: "4", title: "La motricité libre", summary: "Encourager votre bébé à explorer le mouvement à son rythme", category: "Éveil", icon: Activity, ageRange: "6-12m", type: "article", readTime: "4 min", expert: "Marie Dupont, psychomotricienne" },
  { id: "5", title: "Vaccination : le calendrier complet", summary: "Tout savoir sur les vaccins obligatoires et recommandés par âge", category: "Santé", icon: Shield, ageRange: "all", type: "article", readTime: "6 min", expert: "Dr. Pierre Blanc, pédiatre", featured: true },
  { id: "6", title: "Gérer les colères de l'enfant", summary: "Techniques bienveillantes pour accompagner les émotions fortes", category: "Développement", icon: Heart, ageRange: "2-4y", type: "story", readTime: "4 min", expert: "Dr. Anne Richard, pédopsychiatre" },
  { id: "7", title: "Alimentation de 1 à 3 ans", summary: "Les besoins nutritionnels spécifiques du jeune enfant", category: "Nutrition", icon: Apple, ageRange: "1-2y", type: "article", readTime: "5 min", expert: "Dr. Claire Dubois, nutritionniste" },
  { id: "8", title: "Les écrans et les enfants", summary: "Recommandations et limites selon l'âge de l'enfant", category: "Bien-être", icon: Sparkles, ageRange: "4-6y", type: "video", readTime: "6 min", expert: "Dr. Marc Petit, pédiatre" },
  { id: "9", title: "L'apprentissage de la propreté", summary: "Signes de préparation et conseils pour accompagner cette étape", category: "Développement", icon: Star, ageRange: "2-4y", type: "article", readTime: "4 min", expert: "Marie Dupont, psychomotricienne" },
  { id: "10", title: "Premiers secours pédiatriques", summary: "Les gestes essentiels à connaître pour protéger votre enfant", category: "Santé", icon: Shield, ageRange: "all", type: "video", readTime: "10 min", expert: "Dr. Sophie Martin, pédiatre", featured: true },
  { id: "11", title: "Le sport chez l'enfant", summary: "Activités physiques adaptées pour chaque tranche d'âge", category: "Bien-être", icon: Activity, ageRange: "6-12y", type: "article", readTime: "5 min", expert: "Dr. Marc Petit, pédiatre" },
  { id: "12", title: "Puberté : accompagner les changements", summary: "Comment préparer et soutenir votre adolescent", category: "Développement", icon: Heart, ageRange: "12+y", type: "article", readTime: "6 min", expert: "Dr. Anne Richard, pédopsychiatre" },
];

const ageRanges: { value: AgeRange; label: string }[] = [
  { value: "all", label: "Tous âges" },
  { value: "0-3m", label: "0-3 mois" },
  { value: "3-6m", label: "3-6 mois" },
  { value: "6-12m", label: "6-12 mois" },
  { value: "1-2y", label: "1-2 ans" },
  { value: "2-4y", label: "2-4 ans" },
  { value: "4-6y", label: "4-6 ans" },
  { value: "6-12y", label: "6-12 ans" },
  { value: "12+y", label: "12+ ans" },
];

function getChildAgeRange(birthDate: string | null): AgeRange | null {
  if (!birthDate) return null;
  const months = differenceInMonths(new Date(), new Date(birthDate));
  const years = differenceInYears(new Date(), new Date(birthDate));
  if (months < 3) return "0-3m";
  if (months < 6) return "3-6m";
  if (months < 12) return "6-12m";
  if (years < 2) return "1-2y";
  if (years < 4) return "2-4y";
  if (years < 6) return "4-6y";
  if (years < 12) return "6-12y";
  return "12+y";
}

const typeIcons: Record<ContentType, { icon: React.ElementType; label: string }> = {
  article: { icon: BookOpen, label: "Article" },
  video: { icon: Play, label: "Vidéo" },
  story: { icon: Sparkles, label: "Story" },
};

export default function HealthContentPage() {
  const { data: profiles } = usePatientProfiles();
  
  // Get child profiles to suggest age range
  const childProfiles = profiles?.filter(p => p.profile_type === "child") || [];
  const suggestedAge = childProfiles.length > 0 ? getChildAgeRange(childProfiles[0].birth_date) : null;

  const [selectedAge, setSelectedAge] = useState<AgeRange>(suggestedAge || "all");

  const filteredArticles = useMemo(() => {
    if (selectedAge === "all") return articles;
    return articles.filter(a => a.ageRange === selectedAge || a.ageRange === "all");
  }, [selectedAge]);

  const featuredArticles = filteredArticles.filter(a => a.featured);
  const regularArticles = filteredArticles.filter(a => !a.featured);

  return (
    <>
      <PageContainer noPadding className="overflow-x-hidden">
        <Header title="Contenus santé" showBack />

        <div className="px-4 pb-4 max-w-lg mx-auto space-y-6">
          {/* Child age selector */}
          {childProfiles.length > 0 && (
            <Card className="p-3 bg-primary/5 border-primary/20">
              <div className="flex items-center gap-2">
                <Baby className="h-4 w-4 text-primary shrink-0" />
                <p className="text-xs text-primary font-medium">
                  Contenus adaptés pour {childProfiles[0].first_name}
                  {suggestedAge && ` (${ageRanges.find(a => a.value === suggestedAge)?.label})`}
                </p>
              </div>
            </Card>
          )}

          {/* Age range filter */}
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
            {ageRanges.map((range) => (
              <button
                key={range.value}
                onClick={() => setSelectedAge(range.value)}
                className={cn(
                  "px-3 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all min-h-[36px]",
                  selectedAge === range.value
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                )}
              >
                {range.label}
              </button>
            ))}
          </div>

          {/* Featured */}
          {featuredArticles.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold font-display mb-3">À la une</h2>
              <div className="space-y-3">
                {featuredArticles.map((article) => {
                  const TypeInfo = typeIcons[article.type];
                  return (
                    <Card key={article.id} hover className="p-0 overflow-hidden">
                      <div className="bg-gradient-to-r from-primary/10 to-accent/10 p-4">
                        <div className="flex items-start gap-3">
                          <div className="w-12 h-12 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
                            <article.icon className="h-6 w-6 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="info" className="text-[10px]">{article.category}</Badge>
                              <Badge variant="muted" icon={<TypeInfo.icon className="h-3 w-3" />} className="text-[10px]">
                                {TypeInfo.label}
                              </Badge>
                            </div>
                            <h3 className="font-semibold text-foreground text-sm sm:text-base line-clamp-2">
                              {article.title}
                            </h3>
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                              {article.summary}
                            </p>
                            <div className="flex items-center gap-3 mt-2">
                              <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                <Clock className="h-3 w-3" />{article.readTime}
                              </span>
                              <span className="text-[10px] text-muted-foreground truncate">
                                {article.expert}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </section>
          )}

          {/* All articles */}
          <section>
            <h2 className="text-lg font-semibold font-display mb-3">
              {filteredArticles.length} contenu{filteredArticles.length > 1 ? "s" : ""}
            </h2>
            <div className="space-y-3">
              {regularArticles.map((article) => {
                const TypeInfo = typeIcons[article.type];
                return (
                  <Card key={article.id} hover className="p-3 sm:p-4">
                    <div className="flex gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                        <article.icon className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="muted" className="text-[10px]">{article.category}</Badge>
                          <Badge variant="muted" icon={<TypeInfo.icon className="h-3 w-3" />} className="text-[10px]">
                            {TypeInfo.label}
                          </Badge>
                        </div>
                        <h3 className="font-semibold text-foreground text-sm truncate">{article.title}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{article.summary}</p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />{article.readTime}
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 self-center" />
                    </div>
                  </Card>
                );
              })}
            </div>
          </section>

          {filteredArticles.length === 0 && (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">Aucun contenu pour cette tranche d'âge</p>
            </div>
          )}
        </div>
      </PageContainer>
      <BottomNavigation />
    </>
  );
}
