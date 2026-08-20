import { PageContainer } from "@/components/layout/PageContainer";
import { Header } from "@/components/layout/Header";

const SECTIONS = [
  {
    title: "1. Responsable de traitement",
    body: "MédiSanté est responsable du traitement des données collectées via l'application. Le traitement est réalisé conformément au RGPD et à la loi Informatique et Libertés.",
  },
  {
    title: "2. Données collectées",
    body: "Données d'identification (nom, prénom, date de naissance, coordonnées), données de santé (rendez-vous, comptes rendus, documents, constantes, questionnaire de santé), données techniques (journaux de connexion, qualité réseau lors des téléconsultations) et contenus que vous publiez (messages, avis, signalements).",
  },
  {
    title: "3. Finalités et bases légales",
    body: "Gestion des rendez-vous et du dossier médical (exécution du contrat et intérêt vital), téléconsultation (consentement), modération des avis (intérêt légitime), notifications (consentement), obligations légales de conservation des données de santé.",
  },
  {
    title: "4. Hébergement des données de santé",
    body: "Les données de santé sont hébergées chez un hébergeur conforme aux exigences applicables aux données de santé (certification HDS). Elles sont chiffrées en transit et au repos, et l'accès est cloisonné par des règles de sécurité au niveau de la base de données (RLS).",
  },
  {
    title: "5. Partage des données",
    body: "Vos données de santé ne sont partagées avec un praticien que sur votre initiative explicite, via la fonctionnalité de partage du dossier, pour une durée limitée que vous définissez et que vous pouvez révoquer à tout moment.",
  },
  {
    title: "6. Durée de conservation",
    body: "Les données de compte sont conservées tant que le compte est actif. Les données de santé sont conservées conformément aux durées légales applicables, puis supprimées ou anonymisées.",
  },
  {
    title: "7. Vos droits",
    body: "Vous disposez des droits d'accès, de rectification, d'effacement, de limitation, d'opposition et de portabilité. L'export de vos données est disponible directement dans les paramètres de l'application. Vous pouvez introduire une réclamation auprès de la CNIL.",
  },
  {
    title: "8. Secret médical",
    body: "Conformément à la loi du 4 mars 2002 (loi Kouchner), vous êtes propriétaire des informations de votre dossier médical et disposez d'un droit d'accès direct à celles-ci. Les professionnels de santé sont soumis au secret médical.",
  },
  {
    title: "9. Intelligence artificielle",
    body: "L'assistant santé et la génération de comptes rendus utilisent des modèles d'IA. Les contenus produits sont indicatifs, ne constituent pas un diagnostic et sont toujours soumis à validation par un professionnel de santé. Aucune donnée n'est utilisée pour entraîner des modèles tiers.",
  },
  {
    title: "10. Cookies et traceurs",
    body: "L'application n'utilise que des traceurs strictement nécessaires à son fonctionnement (session d'authentification, préférences d'affichage).",
  },
];

export default function PrivacyPage() {
  return (
    <PageContainer noPadding withBottomNav={false} className="pb-10">
      <Header title="Politique de confidentialité" showBack />
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
