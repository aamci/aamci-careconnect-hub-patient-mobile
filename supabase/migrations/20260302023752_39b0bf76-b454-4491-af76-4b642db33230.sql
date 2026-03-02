
CREATE TABLE public.health_forms (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_profile_id uuid NOT NULL REFERENCES public.patient_profiles(id) ON DELETE CASCADE,
  blood_type text,
  height_cm text,
  weight_kg text,
  allergies text,
  chronic_conditions text,
  current_medications text,
  surgeries text,
  family_history text,
  lifestyle text,
  vaccination_notes text,
  emergency_contact_name text,
  emergency_contact_phone text,
  emergency_contact_relation text,
  additional_notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(patient_profile_id)
);

ALTER TABLE public.health_forms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own health forms"
  ON public.health_forms FOR SELECT
  TO authenticated
  USING (is_profile_owner(patient_profile_id));

CREATE POLICY "Users can create own health forms"
  ON public.health_forms FOR INSERT
  TO authenticated
  WITH CHECK (is_profile_owner(patient_profile_id));

CREATE POLICY "Users can update own health forms"
  ON public.health_forms FOR UPDATE
  TO authenticated
  USING (is_profile_owner(patient_profile_id))
  WITH CHECK (is_profile_owner(patient_profile_id));

CREATE POLICY "Users can delete own health forms"
  ON public.health_forms FOR DELETE
  TO authenticated
  USING (is_profile_owner(patient_profile_id));

CREATE TRIGGER update_health_forms_updated_at
  BEFORE UPDATE ON public.health_forms
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
