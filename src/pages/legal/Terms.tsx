import { PageContainer } from "@/components/layout/PageContainer";
import { Header } from "@/components/layout/Header";

const SECTIONS = [
  {
    title: "1. Objet",
    body: "MédiSanté est une plateforme de prise de rendez-vous médicaux, de téléconsultation et de suivi de dossier de santé destinée exclusivement à des personnes majeures. Les présentes conditions régissent l'utilisation de l'application.",
  },
  {
    title: "2. Nature du service",
    body: "MédiSanté n'est pas un service d'urgence et ne se substitue pas à une consultation médicale. En cas d'urgence vitale, contactez immédiatement les services de secours. Les contenus informatifs et l'assistant IA ne constituent jamais un diagnostic médical.",
  },
  {
    title: "3. Compte utilisateur",
    body: "Vous devez être majeur pour créer un compte. Vous êtes responsable de l'exactitude des informations fournies et de la confidentialité de vos identifiants. Les profils gérés (proches) doivent également être des adultes ayant consenti au partage de leurs données.",
  },
  {
    title: "4. Rendez-vous et annulations",
    body: "La confirmation d'un rendez-vous dépend de la disponibilité du praticien. Toute annulation doit intervenir dans un délai raisonnable. Les absences répétées non justifiées peuvent entraîner une restriction d'accès à la réservation.",
  },
  {
    title: "5. Téléconsultation",
    body: "La téléconsultation nécessite une connexion réseau suffisante et l'autorisation d'accès à la caméra et au microphone. Aucun enregistrement de l'appel n'est effectué par la plateforme. Le praticien reste seul responsable de l'acte médical.",
  },
  {
    title: "6. Avis et signalements",
    body: "Les avis publiés doivent être sincères, respectueux et fondés sur une expérience réelle. Ils font l'objet d'une modération a posteriori assistée par intelligence artificielle. Tout contenu diffamatoire, injurieux ou contenant des données de santé de tiers sera retiré. Les praticiens disposent d'un droit de réponse et d'un droit de contestation.",
  },
  {
    title: "7. Responsabilité",
    body: "MédiSanté met en œuvre les moyens nécessaires pour assurer la disponibilité du service, sans garantie d'absence d'interruption. La responsabilité de la plateforme ne peut être engagée pour les actes, diagnostics ou prescriptions des professionnels de santé.",
  },
  {
    title: "8. Résiliation",
    body: "Vous pouvez supprimer votre compte à tout moment depuis les paramètres. Certaines données peuvent être conservées pour la durée légale imposée aux données de santé.",
  },
  {
    title: "9. Droit applicable",
    body: "Les présentes conditions sont soumises au droit français. Tout litige relève de la compétence des juridictions françaises, après tentative de résolution amiable.",
  },
];

export default function TermsPage() {
  return (
    <PageContainer noPadding withBottomNav={false} className="pb-10">
      <Header title="Conditions d'utilisation" showBack />
      <div className="px-4 py-4 space-y-6 max-w-lg mx-auto">
        <p className="text-sm text-muted-foreground">
          Dernière mise à jour : {new Date().toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}
        </p>
        {SECTIONS.map((s) => (
          <section key={s.title} className="space-y-1.5">
            <h2 className="font-semibold text-base">{s.title}</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">{s.body}</p>
          </section>
        ))}
      </div>
    </PageContainer>
  );
}
