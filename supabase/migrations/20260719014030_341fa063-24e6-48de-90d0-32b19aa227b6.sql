
-- Add moderation status to reviews
DO $$ BEGIN
  CREATE TYPE public.review_moderation_status AS ENUM ('published', 'under_review', 'rejected');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE public.practitioner_reviews
  ADD COLUMN IF NOT EXISTS moderation_status public.review_moderation_status NOT NULL DEFAULT 'published',
  ADD COLUMN IF NOT EXISTS moderation_reason text,
  ADD COLUMN IF NOT EXISTS moderated_at timestamptz;

ALTER TABLE public.facility_reviews
  ADD COLUMN IF NOT EXISTS moderation_status public.review_moderation_status NOT NULL DEFAULT 'published',
  ADD COLUMN IF NOT EXISTS moderation_reason text,
  ADD COLUMN IF NOT EXISTS moderated_at timestamptz;

-- Auto-unpublish once report_count >= 3
CREATE OR REPLACE FUNCTION public.auto_unpublish_on_reports()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.report_count >= 3 AND NEW.is_visible = true THEN
    NEW.is_visible := false;
    NEW.moderation_status := 'under_review';
    NEW.moderated_at := now();
    NEW.moderation_reason := COALESCE(NEW.moderation_reason, 'Seuil de signalements atteint');
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_auto_unpublish_prac ON public.practitioner_reviews;
CREATE TRIGGER trg_auto_unpublish_prac
BEFORE UPDATE OF report_count ON public.practitioner_reviews
FOR EACH ROW EXECUTE FUNCTION public.auto_unpublish_on_reports();

DROP TRIGGER IF EXISTS trg_auto_unpublish_fac ON public.facility_reviews;
CREATE TRIGGER trg_auto_unpublish_fac
BEFORE UPDATE OF report_count ON public.facility_reviews
FOR EACH ROW EXECUTE FUNCTION public.auto_unpublish_on_reports();

-- Auto-increment report_count when a report targets a review
CREATE OR REPLACE FUNCTION public.increment_review_report_count()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.target_type = 'review' AND NEW.target_id IS NOT NULL THEN
    UPDATE public.practitioner_reviews
      SET report_count = report_count + 1
      WHERE id = NEW.target_id;
    UPDATE public.facility_reviews
      SET report_count = report_count + 1
      WHERE id = NEW.target_id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_increment_report_count ON public.reports;
CREATE TRIGGER trg_increment_report_count
AFTER INSERT ON public.reports
FOR EACH ROW EXECUTE FUNCTION public.increment_review_report_count();

-- Review responses (practitioner or facility owner replies)
CREATE TABLE IF NOT EXISTS public.review_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id uuid NOT NULL,
  review_type text NOT NULL CHECK (review_type IN ('practitioner','facility')),
  responder_user_id uuid NOT NULL,
  response text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (review_id, review_type)
);

GRANT SELECT ON public.review_responses TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.review_responses TO authenticated;
GRANT ALL ON public.review_responses TO service_role;

ALTER TABLE public.review_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read responses"
  ON public.review_responses FOR SELECT
  USING (true);

CREATE POLICY "Owners can create their own responses"
  ON public.review_responses FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = responder_user_id);

CREATE POLICY "Owners can update their own responses"
  ON public.review_responses FOR UPDATE
  TO authenticated
  USING (auth.uid() = responder_user_id)
  WITH CHECK (auth.uid() = responder_user_id);

CREATE POLICY "Owners can delete their own responses"
  ON public.review_responses FOR DELETE
  TO authenticated
  USING (auth.uid() = responder_user_id);

DROP TRIGGER IF EXISTS trg_review_responses_updated ON public.review_responses;
CREATE TRIGGER trg_review_responses_updated
BEFORE UPDATE ON public.review_responses
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Contestation workflow
CREATE TABLE IF NOT EXISTS public.review_disputes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id uuid NOT NULL,
  review_type text NOT NULL CHECK (review_type IN ('practitioner','facility')),
  disputer_user_id uuid NOT NULL,
  reason text NOT NULL,
  details text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','accepted','rejected')),
  resolution_note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.review_disputes TO authenticated;
GRANT ALL ON public.review_disputes TO service_role;

ALTER TABLE public.review_disputes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see their own disputes"
  ON public.review_disputes FOR SELECT
  TO authenticated
  USING (auth.uid() = disputer_user_id);

CREATE POLICY "Users create their own disputes"
  ON public.review_disputes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = disputer_user_id);

DROP TRIGGER IF EXISTS trg_review_disputes_updated ON public.review_disputes;
CREATE TRIGGER trg_review_disputes_updated
BEFORE UPDATE ON public.review_disputes
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
