import { useState, useMemo } from "react";
import { 
  BookOpen, HeartPulse, Apple, Moon, Activity, Shield, Sparkles,
  ChevronRight, Clock, Star, Play, Brain, Pill, Stethoscope
} from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { Header } from "@/components/layout/Header";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { Card } from "@/components/common/Card";
import { Badge } from "@/components/common/Badge";
import { cn } from "@/lib/utils";

type Category = "all" | "prevention" | "nutrition" | "bien-etre" | "maladies" | "droits" | "mental";
type ContentType = "article" | "video" | "story";

interface HealthArticle {
  id: string;
  title: string;
  summary: string;
  category: Category;
  categoryLabel: string;
  icon: React.ElementType;
  type: ContentType;
  readTime: string;
  expert: string;
  featured?: boolean;
}

const articles: HealthArticle[] = [
  { id: "1", title: "Bilan de santé annuel : pourquoi c'est essentiel", summary: "Les examens de prévention recommandés selon votre âge et vos facteurs de risque", category: "prevention", categoryLabel: "Prévention", icon: Shield, type: "article", readTime: "4 min", expert: "Dr. Sophie Martin, médecin généraliste", featured: true },
  { id: "2", title: "Comprendre ses résultats d'analyses sanguines", summary: "Guide complet pour décrypter les indicateurs clés de votre bilan sanguin", category: "prevention", categoryLabel: "Prévention", icon: Stethoscope, type: "article", readTime: "6 min", expert: "Dr. Pierre Blanc, biologiste" },
  { id: "3", title: "Alimentation équilibrée : les bases", summary: "Les principes fondamentaux d'une nutrition saine au quotidien", category: "nutrition", categoryLabel: "Nutrition", icon: Apple, type: "article", readTime: "5 min", expert: "Dr. Claire Dubois, nutritionniste", featured: true },
  { id: "4", title: "Bien dormir : les clés d'un sommeil réparateur", summary: "Comprendre les cycles du sommeil et améliorer sa qualité de repos", category: "bien-etre", categoryLabel: "Bien-être", icon: Moon, type: "video", readTime: "8 min", expert: "Dr. Jean Leroy, somnologue" },
  { id: "5", title: "Gérer le stress au quotidien", summary: "Techniques de relaxation et habitudes pour réduire le stress chronique", category: "mental", categoryLabel: "Santé mentale", icon: Brain, type: "article", readTime: "5 min", expert: "Dr. Anne Richard, psychologue" },
  { id: "6", title: "Activité physique : combien et comment ?", summary: "Les recommandations officielles d'exercice physique pour les adultes", category: "bien-etre", categoryLabel: "Bien-être", icon: Activity, type: "article", readTime: "4 min", expert: "Dr. Marc Petit, médecin du sport" },
  { id: "7", title: "Droits du patient : ce que vous devez savoir", summary: "Consentement éclairé, accès au dossier médical, secret médical", category: "droits", categoryLabel: "Vos droits", icon: Shield, type: "article", readTime: "6 min", expert: "Me. Julie Moreau, juriste en santé", featured: true },
  { id: "8", title: "Bien utiliser ses médicaments", summary: "Interactions, effets secondaires et bonnes pratiques de prise médicamenteuse", category: "maladies", categoryLabel: "Médicaments", icon: Pill, type: "article", readTime: "5 min", expert: "Dr. Luc Bernard, pharmacien" },
  { id: "9", title: "Hypertension : prévention et suivi", summary: "Comprendre et surveiller sa tension artérielle au quotidien", category: "maladies", categoryLabel: "Pathologies", icon: HeartPulse, type: "video", readTime: "7 min", expert: "Dr. Sophie Martin, cardiologue" },
  { id: "10", title: "Santé mentale : quand consulter ?", summary: "Reconnaître les signaux qui indiquent qu'un accompagnement professionnel serait bénéfique", category: "mental", categoryLabel: "Santé mentale", icon: Brain, type: "article", readTime: "4 min", expert: "Dr. Anne Richard, psychologue" },
  { id: "11", title: "Nutrition et maladies chroniques", summary: "Adapter son alimentation en cas de diabète, cholestérol ou hypertension", category: "nutrition", categoryLabel: "Nutrition", icon: Apple, type: "article", readTime: "6 min", expert: "Dr. Claire Dubois, nutritionniste" },
  { id: "12", title: "Téléconsultation : mode d'emploi", summary: "Comment préparer et tirer le meilleur parti d'une consultation vidéo", category: "droits", categoryLabel: "Vos droits", icon: Sparkles, type: "story", readTime: "3 min", expert: "Équipe MédiSanté" },
];

const categories: { value: Category; label: string }[] = [
  { value: "all", label: "Tous" },
  { value: "prevention", label: "Prévention" },
  { value: "nutrition", label: "Nutrition" },
  { value: "bien-etre", label: "Bien-être" },
  { value: "mental", label: "Mental" },
  { value: "maladies", label: "Pathologies" },
  { value: "droits", label: "Vos droits" },
];

const typeIcons: Record<ContentType, { icon: React.ElementType; label: string }> = {
  article: { icon: BookOpen, label: "Article" },
  video: { icon: Play, label: "Vidéo" },
  story: { icon: Sparkles, label: "Story" },
};

export default function HealthContentPage() {
  const [selectedCategory, setSelectedCategory] = useState<Category>("all");

  const filteredArticles = useMemo(() => {
    if (selectedCategory === "all") return articles;
    return articles.filter(a => a.category === selectedCategory);
  }, [selectedCategory]);

  const featuredArticles = filteredArticles.filter(a => a.featured);
  const regularArticles = filteredArticles.filter(a => !a.featured);

  return (
    <>
      <PageContainer noPadding className="overflow-x-hidden">
        <Header title="Contenus santé" showBack />

        <div className="px-4 pb-4 max-w-lg mx-auto space-y-6">
          {/* Category filter */}
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setSelectedCategory(cat.value)}
                className={cn(
                  "px-3 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all min-h-[36px]",
                  selectedCategory === cat.value
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                )}
              >
                {cat.label}
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
                              <Badge variant="info" className="text-[10px]">{article.categoryLabel}</Badge>
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
                          <Badge variant="muted" className="text-[10px]">{article.categoryLabel}</Badge>
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
              <p className="text-muted-foreground">Aucun contenu dans cette catégorie</p>
            </div>
          )}
        </div>
      </PageContainer>
      <BottomNavigation />
    </>
  );
}
