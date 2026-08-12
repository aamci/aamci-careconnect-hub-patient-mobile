-- Consultation reports
CREATE TYPE public.report_source AS ENUM ('ai_generated', 'practitioner', 'patient_note');

CREATE TABLE public.consultation_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id uuid REFERENCES public.appointments(id) ON DELETE CASCADE,
  patient_profile_id uuid NOT NULL REFERENCES public.patient_profiles(id) ON DELETE CASCADE,
  practitioner_id uuid REFERENCES public.practitioners(id) ON DELETE SET NULL,
  title text NOT NULL DEFAULT 'Compte rendu de consultation',
  summary text NOT NULL,
  reason text,
  symptoms text,
  observations text,
  recommendations text,
  treatment text,
  follow_up text,
  follow_up_date timestamptz,
  source public.report_source NOT NULL DEFAULT 'ai_generated',
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.consultation_reports TO authenticated;
GRANT ALL ON public.consultation_reports TO service_role;

ALTER TABLE public.consultation_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patients view own reports" ON public.consultation_reports
  FOR SELECT TO authenticated USING (public.is_profile_owner(patient_profile_id));
CREATE POLICY "Patients create own reports" ON public.consultation_reports
  FOR INSERT TO authenticated WITH CHECK (public.is_profile_owner(patient_profile_id));
CREATE POLICY "Patients update own reports" ON public.consultation_reports
  FOR UPDATE TO authenticated USING (public.is_profile_owner(patient_profile_id))
  WITH CHECK (public.is_profile_owner(patient_profile_id));
CREATE POLICY "Patients delete own reports" ON public.consultation_reports
  FOR DELETE TO authenticated USING (public.is_profile_owner(patient_profile_id));

CREATE INDEX idx_consultation_reports_profile ON public.consultation_reports(patient_profile_id, created_at DESC);
CREATE UNIQUE INDEX idx_consultation_reports_appointment ON public.consultation_reports(appointment_id) WHERE appointment_id IS NOT NULL;

CREATE TRIGGER trg_consultation_reports_updated
  BEFORE UPDATE ON public.consultation_reports
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Health metrics (evolution tracking)
CREATE TABLE public.health_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_profile_id uuid NOT NULL REFERENCES public.patient_profiles(id) ON DELETE CASCADE,
  metric_type text NOT NULL,
  value numeric NOT NULL,
  secondary_value numeric,
  unit text NOT NULL DEFAULT '',
  note text,
  measured_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.health_metrics TO authenticated;
GRANT ALL ON public.health_metrics TO service_role;

ALTER TABLE public.health_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patients view own metrics" ON public.health_metrics
  FOR SELECT TO authenticated USING (public.is_profile_owner(patient_profile_id));
CREATE POLICY "Patients create own metrics" ON public.health_metrics
  FOR INSERT TO authenticated WITH CHECK (public.is_profile_owner(patient_profile_id));
CREATE POLICY "Patients update own metrics" ON public.health_metrics
  FOR UPDATE TO authenticated USING (public.is_profile_owner(patient_profile_id))
  WITH CHECK (public.is_profile_owner(patient_profile_id));
CREATE POLICY "Patients delete own metrics" ON public.health_metrics
  FOR DELETE TO authenticated USING (public.is_profile_owner(patient_profile_id));

CREATE INDEX idx_health_metrics_profile ON public.health_metrics(patient_profile_id, metric_type, measured_at DESC);

CREATE TRIGGER trg_health_metrics_updated
  BEFORE UPDATE ON public.health_metrics
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Record shares
CREATE TABLE public.record_shares (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_profile_id uuid NOT NULL REFERENCES public.patient_profiles(id) ON DELETE CASCADE,
  practitioner_id uuid REFERENCES public.practitioners(id) ON DELETE CASCADE,
  share_reports boolean NOT NULL DEFAULT true,
  share_documents boolean NOT NULL DEFAULT true,
  share_metrics boolean NOT NULL DEFAULT true,
  share_health_form boolean NOT NULL DEFAULT false,
  message text,
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '30 days'),
  revoked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.record_shares TO authenticated;
GRANT ALL ON public.record_shares TO service_role;

ALTER TABLE public.record_shares ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patients manage own shares" ON public.record_shares
  FOR ALL TO authenticated USING (public.is_profile_owner(patient_profile_id))
  WITH CHECK (public.is_profile_owner(patient_profile_id));

CREATE POLICY "Practitioners view active shares" ON public.record_shares
  FOR SELECT TO authenticated USING (
    revoked_at IS NULL
    AND expires_at > now()
    AND EXISTS (
      SELECT 1 FROM public.practitioners p
      WHERE p.id = record_shares.practitioner_id AND p.user_id = auth.uid()
    )
  );

CREATE INDEX idx_record_shares_profile ON public.record_shares(patient_profile_id, created_at DESC);

CREATE TRIGGER trg_record_shares_updated
  BEFORE UPDATE ON public.record_shares
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();