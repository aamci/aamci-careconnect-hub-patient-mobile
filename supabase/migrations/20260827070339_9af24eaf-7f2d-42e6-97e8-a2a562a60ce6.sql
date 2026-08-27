REVOKE ALL ON FUNCTION public.notify_user(uuid, text, text, text, text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.on_appointment_notify() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.on_message_notify() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.on_document_notify() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.on_report_notify() FROM PUBLIC, anon, authenticated;