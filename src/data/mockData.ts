import type { 
  PatientProfile, 
  Practitioner, 
  Specialty, 
  Appointment, 
  MessageThread, 
  Message,
  Document,
  Notification 
} from "@/types";

// Specialties
export const specialties: Specialty[] = [
  { id: "1", name: "Médecin généraliste", icon: "stethoscope", color: "#0891b2" },
  { id: "2", name: "Dentiste", icon: "tooth", color: "#7c3aed" },
  { id: "3", name: "Dermatologue", icon: "sparkles", color: "#ec4899" },
  { id: "4", name: "Ophtalmologue", icon: "eye", color: "#3b82f6" },
  { id: "5", name: "Gynécologue", icon: "heart", color: "#f43f5e" },
  { id: "6", name: "Pédiatre", icon: "baby", color: "#22c55e" },
  { id: "7", name: "Kinésithérapeute", icon: "activity", color: "#f59e0b" },
  { id: "8", name: "Psychologue", icon: "brain", color: "#8b5cf6" },
  { id: "9", name: "Cardiologue", icon: "heart-pulse", color: "#ef4444" },
  { id: "10", name: "ORL", icon: "ear", color: "#06b6d4" },
];

// Practitioners
export const practitioners: Practitioner[] = [
  {
    id: "1",
    firstName: "Marie",
    lastName: "Dupont",
    specialtyId: "1",
    specialty: specialties[0],
    avatarUrl: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&h=200&fit=crop&crop=face",
    bio: "Médecin généraliste avec 15 ans d'expérience, spécialisée en médecine préventive.",
    languages: ["Français", "Anglais"],
    acceptsNewPatients: true,
    teleconsultationEnabled: true,
    rating: 4.8,
    reviewCount: 234,
    nextAvailability: new Date(Date.now() + 1000 * 60 * 60 * 2),
    consultationPrice: 25,
  },
  {
    id: "2",
    firstName: "Pierre",
    lastName: "Martin",
    specialtyId: "2",
    specialty: specialties[1],
    avatarUrl: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200&h=200&fit=crop&crop=face",
    bio: "Chirurgien-dentiste, expert en implantologie et esthétique dentaire.",
    languages: ["Français"],
    acceptsNewPatients: true,
    teleconsultationEnabled: false,
    rating: 4.9,
    reviewCount: 189,
    nextAvailability: new Date(Date.now() + 1000 * 60 * 60 * 24),
    consultationPrice: 45,
  },
  {
    id: "3",
    firstName: "Sophie",
    lastName: "Bernard",
    specialtyId: "3",
    specialty: specialties[2],
    avatarUrl: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=200&h=200&fit=crop&crop=face",
    bio: "Dermatologue spécialisée en dermatologie esthétique et traitement de l'acné.",
    languages: ["Français", "Espagnol"],
    acceptsNewPatients: false,
    teleconsultationEnabled: true,
    rating: 4.7,
    reviewCount: 156,
    nextAvailability: new Date(Date.now() + 1000 * 60 * 60 * 48),
    consultationPrice: 55,
  },
  {
    id: "4",
    firstName: "Jean",
    lastName: "Leroy",
    specialtyId: "4",
    specialty: specialties[3],
    avatarUrl: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=200&h=200&fit=crop&crop=face",
    bio: "Ophtalmologue avec expertise en chirurgie réfractive et cataracte.",
    languages: ["Français", "Allemand"],
    acceptsNewPatients: true,
    teleconsultationEnabled: true,
    rating: 4.6,
    reviewCount: 98,
    nextAvailability: new Date(Date.now() + 1000 * 60 * 60 * 3),
    consultationPrice: 60,
  },
  {
    id: "5",
    firstName: "Claire",
    lastName: "Moreau",
    specialtyId: "5",
    specialty: specialties[4],
    avatarUrl: "https://images.unsplash.com/photo-1651008376811-b90baee60c1f?w=200&h=200&fit=crop&crop=face",
    bio: "Gynécologue-obstétricienne, suivi de grossesse et contraception.",
    languages: ["Français"],
    acceptsNewPatients: true,
    teleconsultationEnabled: true,
    rating: 4.9,
    reviewCount: 312,
    nextAvailability: new Date(Date.now() + 1000 * 60 * 60 * 5),
    consultationPrice: 50,
  },
];

// Current user profile
export const currentUserProfile: PatientProfile = {
  id: "user-1",
  userId: "auth-1",
  firstName: "Thomas",
  lastName: "Dubois",
  birthDate: new Date("1988-05-15"),
  gender: "male",
  phone: "+33 6 12 34 56 78",
  email: "thomas.dubois@email.com",
  address: {
    street: "15 Rue de la Paix",
    city: "Paris",
    postalCode: "75002",
    country: "France",
  },
  profileType: "self",
  isActive: true,
  createdAt: new Date("2023-01-15"),
  updatedAt: new Date(),
};

// User's profiles (self + dependents)
export const userProfiles: PatientProfile[] = [
  currentUserProfile,
  {
    id: "user-2",
    userId: "auth-1",
    firstName: "Emma",
    lastName: "Dubois",
    birthDate: new Date("2018-09-20"),
    gender: "female",
    phone: "+33 6 12 34 56 78",
    email: "thomas.dubois@email.com",
    profileType: "child",
    isActive: true,
    createdAt: new Date("2023-01-15"),
    updatedAt: new Date(),
  },
];

// Appointments
export const appointments: Appointment[] = [
  {
    id: "apt-1",
    patientProfileId: "user-1",
    patientProfile: currentUserProfile,
    practitionerId: "1",
    practitioner: practitioners[0],
    scheduledAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2), // In 2 days
    duration: 30,
    status: "confirmed",
    type: "teleconsultation",
    reason: "Consultation de suivi",
    notes: "Renouvellement ordonnance",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "apt-2",
    patientProfileId: "user-2",
    practitionerId: "6",
    practitioner: practitioners[0],
    scheduledAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5), // In 5 days
    duration: 30,
    status: "scheduled",
    type: "in_person",
    reason: "Visite de routine",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "apt-3",
    patientProfileId: "user-1",
    practitionerId: "2",
    practitioner: practitioners[1],
    scheduledAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7), // 7 days ago
    duration: 45,
    status: "completed",
    type: "in_person",
    reason: "Détartrage annuel",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

// Message threads
export const messageThreads: MessageThread[] = [
  {
    id: "thread-1",
    patientProfileId: "user-1",
    practitionerId: "1",
    practitioner: practitioners[0],
    appointmentId: "apt-1",
    lastMessage: {
      id: "msg-1",
      threadId: "thread-1",
      senderId: "1",
      senderType: "practitioner",
      content: "Bonjour, n'oubliez pas de prendre votre tension avant notre consultation de vendredi.",
      status: "read",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
    },
    unreadCount: 0,
    isArchived: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "thread-2",
    patientProfileId: "user-1",
    practitionerId: "2",
    practitioner: practitioners[1],
    lastMessage: {
      id: "msg-2",
      threadId: "thread-2",
      senderId: "2",
      senderType: "practitioner",
      content: "Votre compte-rendu de consultation est disponible dans vos documents.",
      status: "delivered",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
    },
    unreadCount: 1,
    isArchived: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

// Messages for thread-1
export const messagesThread1: Message[] = [
  {
    id: "msg-1-1",
    threadId: "thread-1",
    senderId: "user-1",
    senderType: "patient",
    content: "Bonjour Dr. Dupont, j'aurais une question concernant mon traitement.",
    status: "read",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
  },
  {
    id: "msg-1-2",
    threadId: "thread-1",
    senderId: "1",
    senderType: "practitioner",
    content: "Bonjour Thomas, je vous écoute. De quoi s'agit-il ?",
    status: "read",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 20),
  },
  {
    id: "msg-1-3",
    threadId: "thread-1",
    senderId: "user-1",
    senderType: "patient",
    content: "Je ressens quelques effets secondaires depuis que j'ai commencé le nouveau médicament. Est-ce normal ?",
    status: "read",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 18),
  },
  {
    id: "msg-1-4",
    threadId: "thread-1",
    senderId: "1",
    senderType: "practitioner",
    content: "C'est tout à fait normal dans les premiers jours. Ces effets devraient diminuer progressivement. Si cela persiste plus d'une semaine, revenez vers moi.",
    status: "read",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 16),
  },
  {
    id: "msg-1-5",
    threadId: "thread-1",
    senderId: "1",
    senderType: "practitioner",
    content: "Bonjour, n'oubliez pas de prendre votre tension avant notre consultation de vendredi.",
    status: "read",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
  },
];

// Documents
export const documents: Document[] = [
  {
    id: "doc-1",
    patientProfileId: "user-1",
    type: "prescription",
    name: "Ordonnance - Traitement hypertension",
    description: "Renouvellement mensuel",
    fileUrl: "/documents/ordonnance-001.pdf",
    mimeType: "application/pdf",
    size: 125000,
    practitionerId: "1",
    practitioner: practitioners[0],
    issuedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
  },
  {
    id: "doc-2",
    patientProfileId: "user-1",
    type: "lab_result",
    name: "Bilan sanguin complet",
    description: "Analyses de routine",
    fileUrl: "/documents/analyses-001.pdf",
    mimeType: "application/pdf",
    size: 450000,
    issuedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14),
  },
  {
    id: "doc-3",
    patientProfileId: "user-1",
    type: "report",
    name: "Compte-rendu consultation dentaire",
    fileUrl: "/documents/cr-dentaire.pdf",
    mimeType: "application/pdf",
    size: 89000,
    practitionerId: "2",
    practitioner: practitioners[1],
    issuedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
  },
];

// Notifications
export const notifications: Notification[] = [
  {
    id: "notif-1",
    userId: "auth-1",
    type: "appointment_reminder",
    title: "Rappel de rendez-vous",
    body: "Votre téléconsultation avec Dr. Dupont est demain à 14h30",
    data: { appointmentId: "apt-1" },
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 30),
  },
  {
    id: "notif-2",
    userId: "auth-1",
    type: "new_document",
    title: "Nouveau document",
    body: "Dr. Martin a partagé un compte-rendu avec vous",
    data: { documentId: "doc-3" },
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
  },
  {
    id: "notif-3",
    userId: "auth-1",
    type: "new_message",
    title: "Nouveau message",
    body: "Dr. Dupont vous a envoyé un message",
    data: { threadId: "thread-1" },
    isRead: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3),
  },
];

// Generate time slots for a practitioner
export function generateTimeSlots(practitionerId: string, date: Date): { time: string; available: boolean }[] {
  const slots = [];
  const baseHour = 8;
  const endHour = 18;
  
  for (let hour = baseHour; hour < endHour; hour++) {
    for (const minutes of [0, 30]) {
      const available = Math.random() > 0.3; // 70% availability
      slots.push({
        time: `${hour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`,
        available,
      });
    }
  }
  
  return slots;
}
