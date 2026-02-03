-- =====================================================
-- E-HEALTH PATIENT APPLICATION DATABASE SCHEMA
-- =====================================================

-- 1. ENUMS
-- =====================================================
CREATE TYPE public.profile_type AS ENUM ('self', 'child', 'dependent');
CREATE TYPE public.gender_type AS ENUM ('male', 'female', 'other');
CREATE TYPE public.appointment_status AS ENUM ('scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show');
CREATE TYPE public.appointment_type AS ENUM ('in_person', 'teleconsultation');
CREATE TYPE public.message_status AS ENUM ('sending', 'sent', 'delivered', 'read', 'failed');
CREATE TYPE public.sender_type AS ENUM ('patient', 'practitioner', 'system');
CREATE TYPE public.document_type AS ENUM ('prescription', 'lab_result', 'imaging', 'report', 'certificate', 'invoice', 'other');
CREATE TYPE public.facility_type AS ENUM ('clinic', 'hospital', 'cabinet', 'laboratory');

-- 2. BASE TABLES
-- =====================================================

-- Specialties table
CREATE TABLE public.specialties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  icon TEXT,
  color TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Facilities table
CREATE TABLE public.facilities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type facility_type NOT NULL DEFAULT 'cabinet',
  street TEXT,
  city TEXT,
  postal_code TEXT,
  country TEXT DEFAULT 'France',
  phone TEXT,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Practitioners table
CREATE TABLE public.practitioners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  specialty_id UUID REFERENCES public.specialties(id) ON DELETE SET NULL,
  facility_id UUID REFERENCES public.facilities(id) ON DELETE SET NULL,
  avatar_url TEXT,
  bio TEXT,
  languages TEXT[] DEFAULT ARRAY['Français'],
  accepts_new_patients BOOLEAN DEFAULT true,
  teleconsultation_enabled BOOLEAN DEFAULT false,
  rating DECIMAL(2,1),
  review_count INTEGER DEFAULT 0,
  consultation_price INTEGER,
  next_availability TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Patient profiles table
CREATE TABLE public.patient_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  birth_date DATE,
  gender gender_type,
  phone TEXT,
  email TEXT,
  street TEXT,
  city TEXT,
  postal_code TEXT,
  country TEXT DEFAULT 'France',
  social_security_number TEXT,
  profile_type profile_type NOT NULL DEFAULT 'self',
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Appointments table
CREATE TABLE public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_profile_id UUID NOT NULL REFERENCES public.patient_profiles(id) ON DELETE CASCADE,
  practitioner_id UUID NOT NULL REFERENCES public.practitioners(id) ON DELETE CASCADE,
  facility_id UUID REFERENCES public.facilities(id) ON DELETE SET NULL,
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration INTEGER NOT NULL DEFAULT 30,
  status appointment_status NOT NULL DEFAULT 'scheduled',
  type appointment_type NOT NULL DEFAULT 'in_person',
  reason TEXT NOT NULL,
  notes TEXT,
  pre_consultation_answers JSONB,
  cancellation_reason TEXT,
  cancelled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Message threads table
CREATE TABLE public.message_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_profile_id UUID NOT NULL REFERENCES public.patient_profiles(id) ON DELETE CASCADE,
  practitioner_id UUID NOT NULL REFERENCES public.practitioners(id) ON DELETE CASCADE,
  appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
  unread_count INTEGER DEFAULT 0,
  is_archived BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Messages table
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID NOT NULL REFERENCES public.message_threads(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  sender_type sender_type NOT NULL,
  content TEXT NOT NULL,
  attachments JSONB,
  status message_status NOT NULL DEFAULT 'sent',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Documents table
CREATE TABLE public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_profile_id UUID NOT NULL REFERENCES public.patient_profiles(id) ON DELETE CASCADE,
  type document_type NOT NULL DEFAULT 'other',
  name TEXT NOT NULL,
  description TEXT,
  file_url TEXT NOT NULL,
  mime_type TEXT,
  size INTEGER,
  practitioner_id UUID REFERENCES public.practitioners(id) ON DELETE SET NULL,
  appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
  issued_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Notification preferences table
CREATE TABLE public.notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  push_enabled BOOLEAN DEFAULT true,
  email_enabled BOOLEAN DEFAULT true,
  sms_enabled BOOLEAN DEFAULT false,
  appointment_reminders BOOLEAN DEFAULT true,
  message_notifications BOOLEAN DEFAULT true,
  document_notifications BOOLEAN DEFAULT true,
  marketing_emails BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. HELPER FUNCTIONS (SECURITY DEFINER)
-- =====================================================

-- Check if user owns a patient profile
CREATE OR REPLACE FUNCTION public.is_profile_owner(profile_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.patient_profiles
    WHERE id = profile_id AND user_id = auth.uid()
  )
$$;

-- Check if user is participant in a message thread
CREATE OR REPLACE FUNCTION public.is_thread_participant(thread_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.message_threads mt
    JOIN public.patient_profiles pp ON mt.patient_profile_id = pp.id
    WHERE mt.id = thread_id AND pp.user_id = auth.uid()
  )
$$;

-- Check if user can access appointment
CREATE OR REPLACE FUNCTION public.can_access_appointment(appointment_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.appointments a
    JOIN public.patient_profiles pp ON a.patient_profile_id = pp.id
    WHERE a.id = appointment_id AND pp.user_id = auth.uid()
  )
$$;

-- Check if user can access document
CREATE OR REPLACE FUNCTION public.can_access_document(document_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.documents d
    JOIN public.patient_profiles pp ON d.patient_profile_id = pp.id
    WHERE d.id = document_id AND pp.user_id = auth.uid()
  )
$$;

-- 4. ENABLE RLS
-- =====================================================
ALTER TABLE public.specialties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.facilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.practitioners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

-- 5. RLS POLICIES
-- =====================================================

-- Specialties: public read
CREATE POLICY "Anyone can view specialties" ON public.specialties FOR SELECT USING (true);

-- Facilities: public read
CREATE POLICY "Anyone can view facilities" ON public.facilities FOR SELECT USING (true);

-- Practitioners: public read
CREATE POLICY "Anyone can view practitioners" ON public.practitioners FOR SELECT USING (true);

-- Patient profiles: owner only
CREATE POLICY "Users can view own profiles" ON public.patient_profiles
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create own profiles" ON public.patient_profiles
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own profiles" ON public.patient_profiles
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete own profiles" ON public.patient_profiles
  FOR DELETE USING (user_id = auth.uid());

-- Appointments: owner of patient profile
CREATE POLICY "Users can view own appointments" ON public.appointments
  FOR SELECT USING (public.is_profile_owner(patient_profile_id));

CREATE POLICY "Users can create appointments" ON public.appointments
  FOR INSERT WITH CHECK (public.is_profile_owner(patient_profile_id));

CREATE POLICY "Users can update own appointments" ON public.appointments
  FOR UPDATE USING (public.is_profile_owner(patient_profile_id));

CREATE POLICY "Users can delete own appointments" ON public.appointments
  FOR DELETE USING (public.is_profile_owner(patient_profile_id));

-- Message threads: participant only
CREATE POLICY "Users can view own threads" ON public.message_threads
  FOR SELECT USING (public.is_profile_owner(patient_profile_id));

CREATE POLICY "Users can create threads" ON public.message_threads
  FOR INSERT WITH CHECK (public.is_profile_owner(patient_profile_id));

CREATE POLICY "Users can update own threads" ON public.message_threads
  FOR UPDATE USING (public.is_profile_owner(patient_profile_id));

-- Messages: thread participant only
CREATE POLICY "Users can view messages in own threads" ON public.messages
  FOR SELECT USING (public.is_thread_participant(thread_id));

CREATE POLICY "Users can send messages in own threads" ON public.messages
  FOR INSERT WITH CHECK (public.is_thread_participant(thread_id));

-- Documents: owner of patient profile
CREATE POLICY "Users can view own documents" ON public.documents
  FOR SELECT USING (public.can_access_document(id));

CREATE POLICY "Users can upload documents" ON public.documents
  FOR INSERT WITH CHECK (public.is_profile_owner(patient_profile_id));

CREATE POLICY "Users can delete own documents" ON public.documents
  FOR DELETE USING (public.can_access_document(id));

-- Notification preferences: owner only
CREATE POLICY "Users can view own preferences" ON public.notification_preferences
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create own preferences" ON public.notification_preferences
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own preferences" ON public.notification_preferences
  FOR UPDATE USING (user_id = auth.uid());

-- 6. TRIGGERS FOR UPDATED_AT
-- =====================================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_facilities_updated_at BEFORE UPDATE ON public.facilities
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_practitioners_updated_at BEFORE UPDATE ON public.practitioners
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_patient_profiles_updated_at BEFORE UPDATE ON public.patient_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON public.appointments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_message_threads_updated_at BEFORE UPDATE ON public.message_threads
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_notification_preferences_updated_at BEFORE UPDATE ON public.notification_preferences
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 7. TRIGGER TO CREATE DEFAULT PROFILE ON SIGNUP
-- =====================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Create default patient profile
  INSERT INTO public.patient_profiles (user_id, first_name, last_name, email, profile_type)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'first_name', 'Patient'),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    NEW.email,
    'self'
  );
  
  -- Create default notification preferences
  INSERT INTO public.notification_preferences (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 8. INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX idx_patient_profiles_user_id ON public.patient_profiles(user_id);
CREATE INDEX idx_appointments_patient_profile_id ON public.appointments(patient_profile_id);
CREATE INDEX idx_appointments_practitioner_id ON public.appointments(practitioner_id);
CREATE INDEX idx_appointments_scheduled_at ON public.appointments(scheduled_at);
CREATE INDEX idx_message_threads_patient_profile_id ON public.message_threads(patient_profile_id);
CREATE INDEX idx_messages_thread_id ON public.messages(thread_id);
CREATE INDEX idx_documents_patient_profile_id ON public.documents(patient_profile_id);
CREATE INDEX idx_practitioners_specialty_id ON public.practitioners(specialty_id);