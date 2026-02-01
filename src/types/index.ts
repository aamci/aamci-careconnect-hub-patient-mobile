// Core domain types for e-health application

export interface User {
  id: string;
  email: string;
  phone?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PatientProfile {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  birthDate: Date;
  gender: 'male' | 'female' | 'other';
  phone: string;
  email: string;
  address?: Address;
  socialSecurityNumber?: string;
  profileType: 'self' | 'child' | 'dependent';
  avatarUrl?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Address {
  street: string;
  city: string;
  postalCode: string;
  country: string;
}

export interface Practitioner {
  id: string;
  firstName: string;
  lastName: string;
  specialtyId: string;
  specialty: Specialty;
  facilityId?: string;
  facility?: Facility;
  avatarUrl?: string;
  bio?: string;
  languages: string[];
  acceptsNewPatients: boolean;
  teleconsultationEnabled: boolean;
  rating?: number;
  reviewCount?: number;
  nextAvailability?: Date;
  consultationPrice?: number;
}

export interface Specialty {
  id: string;
  name: string;
  icon?: string;
  color?: string;
}

export interface Facility {
  id: string;
  name: string;
  type: 'clinic' | 'hospital' | 'cabinet' | 'laboratory';
  address: Address;
  phone?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface TimeSlot {
  id: string;
  practitionerId: string;
  startTime: Date;
  endTime: Date;
  isAvailable: boolean;
  isOnline: boolean;
  price?: number;
}

export interface Appointment {
  id: string;
  patientProfileId: string;
  patientProfile?: PatientProfile;
  practitionerId: string;
  practitioner?: Practitioner;
  facilityId?: string;
  facility?: Facility;
  scheduledAt: Date;
  duration: number; // in minutes
  status: AppointmentStatus;
  type: 'in_person' | 'teleconsultation';
  reason: string;
  notes?: string;
  preConsultationAnswers?: Record<string, string>;
  cancellationReason?: string;
  cancelledAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type AppointmentStatus = 
  | 'scheduled' 
  | 'confirmed' 
  | 'in_progress' 
  | 'completed' 
  | 'cancelled' 
  | 'no_show';

export interface Message {
  id: string;
  threadId: string;
  senderId: string;
  senderType: 'patient' | 'practitioner' | 'system';
  content: string;
  attachments?: MessageAttachment[];
  status: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
  createdAt: Date;
}

export interface MessageThread {
  id: string;
  patientProfileId: string;
  practitionerId: string;
  practitioner?: Practitioner;
  appointmentId?: string;
  lastMessage?: Message;
  unreadCount: number;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface MessageAttachment {
  id: string;
  type: 'image' | 'pdf' | 'document';
  name: string;
  url: string;
  size: number;
  mimeType: string;
}

export interface Document {
  id: string;
  patientProfileId: string;
  type: DocumentType;
  name: string;
  description?: string;
  fileUrl: string;
  mimeType: string;
  size: number;
  practitionerId?: string;
  practitioner?: Practitioner;
  appointmentId?: string;
  issuedAt?: Date;
  expiresAt?: Date;
  createdAt: Date;
}

export type DocumentType = 
  | 'prescription' 
  | 'lab_result' 
  | 'imaging' 
  | 'report' 
  | 'certificate' 
  | 'invoice' 
  | 'other';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  isRead: boolean;
  createdAt: Date;
}

export type NotificationType = 
  | 'appointment_reminder' 
  | 'appointment_confirmed' 
  | 'appointment_cancelled' 
  | 'new_message' 
  | 'new_document' 
  | 'teleconsultation_ready'
  | 'system';

export interface NotificationPreferences {
  push: boolean;
  email: boolean;
  sms: boolean;
  appointmentReminders: boolean;
  messageNotifications: boolean;
  documentNotifications: boolean;
  marketingEmails: boolean;
}

export interface SearchFilters {
  query?: string;
  specialtyId?: string;
  location?: string;
  radius?: number;
  teleconsultationOnly?: boolean;
  availableToday?: boolean;
  acceptsNewPatients?: boolean;
  minRating?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}
