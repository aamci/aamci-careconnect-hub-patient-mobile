CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  type text NOT NULL DEFAULT 'system',
  title text NOT NULL,
  body text NOT NULL DEFAULT '',
  link text,
  data jsonb,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own notifications" ON public.notifications
  FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users insert own notifications" ON public.notifications
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users update own notifications" ON public.notifications
  FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users delete own notifications" ON public.notifications
  FOR DELETE TO authenticated USING (user_id = auth.uid());

CREATE INDEX idx_notifications_user_created ON public.notifications (user_id, created_at DESC);

-- helper: owner of a patient profile
CREATE OR REPLACE FUNCTION public.notify_user(_user_id uuid, _type text, _title text, _body text, _link text)
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  INSERT INTO public.notifications (user_id, type, title, body, link)
  VALUES (_user_id, _type, _title, _body, _link);
$$;

CREATE OR REPLACE FUNCTION public.on_appointment_notify()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE uid uuid; pname text;
BEGIN
  SELECT pp.user_id INTO uid FROM public.patient_profiles pp WHERE pp.id = NEW.patient_profile_id;
  IF uid IS NULL THEN RETURN NEW; END IF;
  SELECT 'Dr ' || p.first_name || ' ' || p.last_name INTO pname FROM public.practitioners p WHERE p.id = NEW.practitioner_id;

  IF TG_OP = 'INSERT' THEN
    PERFORM public.notify_user(uid, 'appointment_created', 'Rendez-vous enregistré',
      COALESCE(pname,'Praticien') || ' — ' || to_char(NEW.scheduled_at AT TIME ZONE 'Europe/Paris', 'DD/MM/YYYY à HH24:MI'),
      '/appointments/' || NEW.id);
  ELSIF TG_OP = 'UPDATE' AND NEW.status IS DISTINCT FROM OLD.status THEN
    IF NEW.status = 'confirmed' THEN
      PERFORM public.notify_user(uid, 'appointment_confirmed', 'Rendez-vous confirmé', COALESCE(pname,'Praticien') || ' a confirmé votre rendez-vous.', '/appointments/' || NEW.id);
    ELSIF NEW.status = 'cancelled' THEN
      PERFORM public.notify_user(uid, 'appointment_cancelled', 'Rendez-vous annulé', COALESCE(NEW.cancellation_reason, 'Votre rendez-vous a été annulé.'), '/appointments/' || NEW.id);
    ELSIF NEW.status = 'completed' THEN
      PERFORM public.notify_user(uid, 'appointment_completed', 'Consultation terminée', 'Donnez votre avis sur cette consultation.', '/review/' || NEW.id);
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_appointment_notify
AFTER INSERT OR UPDATE ON public.appointments
FOR EACH ROW EXECUTE FUNCTION public.on_appointment_notify();

CREATE OR REPLACE FUNCTION public.on_message_notify()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE uid uuid;
BEGIN
  IF NEW.sender_type = 'patient' THEN RETURN NEW; END IF;
  SELECT pp.user_id INTO uid
  FROM public.message_threads mt JOIN public.patient_profiles pp ON pp.id = mt.patient_profile_id
  WHERE mt.id = NEW.thread_id;
  IF uid IS NOT NULL THEN
    PERFORM public.notify_user(uid, 'new_message', 'Nouveau message', left(NEW.content, 120), '/messages/' || NEW.thread_id);
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_message_notify
AFTER INSERT ON public.messages
FOR EACH ROW EXECUTE FUNCTION public.on_message_notify();

CREATE OR REPLACE FUNCTION public.on_document_notify()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE uid uuid;
BEGIN
  SELECT pp.user_id INTO uid FROM public.patient_profiles pp WHERE pp.id = NEW.patient_profile_id;
  IF uid IS NOT NULL THEN
    PERFORM public.notify_user(uid, 'new_document', 'Nouveau document', NEW.name, '/documents');
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_document_notify
AFTER INSERT ON public.documents
FOR EACH ROW EXECUTE FUNCTION public.on_document_notify();

CREATE OR REPLACE FUNCTION public.on_report_notify()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE uid uuid;
BEGIN
  SELECT pp.user_id INTO uid FROM public.patient_profiles pp WHERE pp.id = NEW.patient_profile_id;
  IF uid IS NOT NULL THEN
    PERFORM public.notify_user(uid, 'new_report', 'Compte rendu disponible', NEW.title, '/reports/' || NEW.id);
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_report_notify
AFTER INSERT ON public.consultation_reports
FOR EACH ROW EXECUTE FUNCTION public.on_report_notify();

ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;