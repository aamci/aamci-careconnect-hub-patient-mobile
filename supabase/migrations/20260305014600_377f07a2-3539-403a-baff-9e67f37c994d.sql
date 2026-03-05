
-- Table: practitioner_reviews (évaluations post-consultation + avis publics)
CREATE TABLE public.practitioner_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id uuid REFERENCES public.appointments(id) ON DELETE CASCADE,
  practitioner_id uuid NOT NULL REFERENCES public.practitioners(id) ON DELETE CASCADE,
  patient_profile_id uuid NOT NULL REFERENCES public.patient_profiles(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  is_anonymous boolean NOT NULL DEFAULT false,
  is_visible boolean NOT NULL DEFAULT true,
  report_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(appointment_id)
);

-- Table: facility_reviews (évaluation des centres de santé)
CREATE TABLE public.facility_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id uuid NOT NULL REFERENCES public.facilities(id) ON DELETE CASCADE,
  patient_profile_id uuid NOT NULL REFERENCES public.patient_profiles(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  cleanliness_rating integer CHECK (cleanliness_rating >= 1 AND cleanliness_rating <= 5),
  reception_rating integer CHECK (reception_rating >= 1 AND reception_rating <= 5),
  equipment_rating integer CHECK (equipment_rating >= 1 AND equipment_rating <= 5),
  comment text,
  is_anonymous boolean NOT NULL DEFAULT false,
  is_visible boolean NOT NULL DEFAULT true,
  report_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Table: reports (signalements)
CREATE TABLE public.reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_user_id uuid NOT NULL,
  target_type text NOT NULL CHECK (target_type IN ('practitioner', 'review', 'facility', 'technical')),
  target_id uuid,
  reason text NOT NULL CHECK (reason IN ('inappropriate', 'spam', 'harassment', 'misinformation', 'technical_issue', 'other')),
  description text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- RLS: practitioner_reviews
ALTER TABLE public.practitioner_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view visible reviews"
  ON public.practitioner_reviews FOR SELECT
  USING (is_visible = true);

CREATE POLICY "Users can create reviews for own profiles"
  ON public.practitioner_reviews FOR INSERT
  WITH CHECK (is_profile_owner(patient_profile_id));

CREATE POLICY "Users can update own reviews"
  ON public.practitioner_reviews FOR UPDATE
  USING (is_profile_owner(patient_profile_id));

CREATE POLICY "Users can delete own reviews"
  ON public.practitioner_reviews FOR DELETE
  USING (is_profile_owner(patient_profile_id));

-- RLS: facility_reviews
ALTER TABLE public.facility_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view visible facility reviews"
  ON public.facility_reviews FOR SELECT
  USING (is_visible = true);

CREATE POLICY "Users can create facility reviews"
  ON public.facility_reviews FOR INSERT
  WITH CHECK (is_profile_owner(patient_profile_id));

CREATE POLICY "Users can update own facility reviews"
  ON public.facility_reviews FOR UPDATE
  USING (is_profile_owner(patient_profile_id));

CREATE POLICY "Users can delete own facility reviews"
  ON public.facility_reviews FOR DELETE
  USING (is_profile_owner(patient_profile_id));

-- RLS: reports
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create reports"
  ON public.reports FOR INSERT
  WITH CHECK (reporter_user_id = auth.uid());

CREATE POLICY "Users can view own reports"
  ON public.reports FOR SELECT
  USING (reporter_user_id = auth.uid());

-- Triggers for updated_at
CREATE TRIGGER update_practitioner_reviews_updated_at
  BEFORE UPDATE ON public.practitioner_reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_facility_reviews_updated_at
  BEFORE UPDATE ON public.facility_reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reports_updated_at
  BEFORE UPDATE ON public.reports
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
