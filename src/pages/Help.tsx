import { 
  HelpCircle, 
  MessageCircle, 
  Phone, 
  Mail, 
  FileText, 
  ChevronRight,
  ExternalLink
} from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { Header } from "@/components/layout/Header";
import { Card } from "@/components/common/Card";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "Comment prendre un rendez-vous ?",
    answer: "Recherchez un praticien via la barre de recherche ou les spécialités, sélectionnez un créneau disponible, puis confirmez votre réservation. Vous recevrez une confirmation par email."
  },
  {
    question: "Comment annuler un rendez-vous ?",
    answer: "Accédez à la section 'Mes rendez-vous', sélectionnez le rendez-vous à annuler et cliquez sur 'Annuler'. L'annulation est gratuite jusqu'à 24h avant le rendez-vous."
  },
  {
    question: "Comment fonctionne la téléconsultation ?",
    answer: "La téléconsultation se déroule en vidéo depuis l'application. Assurez-vous d'avoir une connexion internet stable, une caméra et un micro fonctionnels. Le praticien vous rejoindra à l'heure du rendez-vous."
  },
  {
    question: "Comment gérer les profils de ma famille ?",
    answer: "Dans 'Mon profil' > 'Profils gérés', vous pouvez ajouter les profils de vos enfants ou proches pour prendre des rendez-vous en leur nom."
  },
  {
    question: "Où trouver mes ordonnances ?",
    answer: "Toutes vos ordonnances et documents médicaux sont accessibles dans la section 'Mes documents'. Vous pouvez les télécharger ou les partager avec un pharmacien."
  },
  {
    question: "Comment modifier mes informations personnelles ?",
    answer: "Accédez à 'Mon profil' > 'Mes informations' pour modifier vos coordonnées, adresse et informations médicales."
  },
];

const contactOptions = [
  {
    icon: MessageCircle,
    label: "Chat en direct",
    description: "Réponse en moins de 5 min",
    action: () => console.log("Open chat"),
  },
  {
    icon: Mail,
    label: "Email",
    description: "support@medisante.fr",
    action: () => window.open("mailto:support@medisante.fr"),
  },
  {
    icon: Phone,
    label: "Téléphone",
    description: "01 23 45 67 89",
    action: () => window.open("tel:+33123456789"),
  },
];

export default function HelpPage() {
  return (
    <PageContainer noPadding className="overflow-x-hidden">
      <Header title="Centre d'aide" showBack />
      
      <div className="px-4 pb-4 max-w-lg mx-auto space-y-6">
        {/* Quick Contact */}
        <section>
          <h2 className="text-lg font-semibold font-display mb-3">Nous contacter</h2>
          <div className="grid grid-cols-3 gap-2">
            {contactOptions.map((option) => (
              <Card 
                key={option.label}
                hover
                variant="flat"
                className="p-3 text-center cursor-pointer"
                onClick={option.action}
              >
                <option.icon className="h-5 w-5 mx-auto text-primary mb-2" />
                <p className="text-xs font-medium truncate">{option.label}</p>
              </Card>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section>
          <h2 className="text-lg font-semibold font-display mb-3">Questions fréquentes</h2>
          <Card variant="flat" className="overflow-hidden">
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`} className="border-b border-border last:border-0">
                  <AccordionTrigger className="px-4 py-3 text-left text-sm font-medium hover:no-underline">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4 text-sm text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Card>
        </section>

        {/* Additional Resources */}
        <section>
          <h2 className="text-lg font-semibold font-display mb-3">Ressources</h2>
          <Card variant="flat" className="divide-y divide-border">
            <button className="w-full flex items-center gap-3 p-4 hover:bg-muted/50 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 text-left min-w-0">
                <p className="font-medium text-sm sm:text-base">Conditions d'utilisation</p>
              </div>
              <ExternalLink className="h-4 w-4 text-muted-foreground shrink-0" />
            </button>
            <button className="w-full flex items-center gap-3 p-4 hover:bg-muted/50 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 text-left min-w-0">
                <p className="font-medium text-sm sm:text-base">Politique de confidentialité</p>
              </div>
              <ExternalLink className="h-4 w-4 text-muted-foreground shrink-0" />
            </button>
          </Card>
        </section>

        {/* App Version */}
        <p className="text-center text-xs text-muted-foreground pt-4">
          MédiSanté v1.0.0 • © 2025
        </p>
      </div>
    </PageContainer>
  );
}