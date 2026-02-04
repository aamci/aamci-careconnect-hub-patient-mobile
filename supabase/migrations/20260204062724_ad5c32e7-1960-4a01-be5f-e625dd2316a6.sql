-- =====================================================
-- SEED DATA FOR E-HEALTH APPLICATION
-- =====================================================

-- Insert specialties
INSERT INTO public.specialties (id, name, icon, color) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Médecine générale', 'stethoscope', '#0D9488'),
  ('22222222-2222-2222-2222-222222222222', 'Dermatologie', 'shield', '#8B5CF6'),
  ('33333333-3333-3333-3333-333333333333', 'Cardiologie', 'heart', '#EF4444'),
  ('44444444-4444-4444-4444-444444444444', 'Pédiatrie', 'baby', '#F59E0B'),
  ('55555555-5555-5555-5555-555555555555', 'Ophtalmologie', 'eye', '#3B82F6'),
  ('66666666-6666-6666-6666-666666666666', 'Gynécologie', 'user', '#EC4899'),
  ('77777777-7777-7777-7777-777777777777', 'Psychiatrie', 'brain', '#6366F1'),
  ('88888888-8888-8888-8888-888888888888', 'Kinésithérapie', 'activity', '#10B981');

-- Insert facilities
INSERT INTO public.facilities (id, name, type, street, city, postal_code, phone, lat, lng) VALUES
  ('aaaa1111-1111-1111-1111-111111111111', 'Centre Médical Saint-Michel', 'clinic', '15 Rue de la Santé', 'Paris', '75014', '01 42 00 00 00', 48.8566, 2.3522),
  ('aaaa2222-2222-2222-2222-222222222222', 'Cabinet Dr. Martin', 'cabinet', '8 Avenue des Champs-Élysées', 'Paris', '75008', '01 43 00 00 00', 48.8698, 2.3076),
  ('aaaa3333-3333-3333-3333-333333333333', 'Clinique du Parc', 'clinic', '25 Boulevard Voltaire', 'Lyon', '69003', '04 72 00 00 00', 45.7640, 4.8357),
  ('aaaa4444-4444-4444-4444-444444444444', 'Hôpital Central', 'hospital', '1 Place de l''Hôpital', 'Marseille', '13001', '04 91 00 00 00', 43.2965, 5.3698);

-- Insert practitioners
INSERT INTO public.practitioners (id, first_name, last_name, specialty_id, facility_id, avatar_url, bio, languages, accepts_new_patients, teleconsultation_enabled, rating, review_count, consultation_price, next_availability) VALUES
  ('bbbb1111-1111-1111-1111-111111111111', 'Marie', 'Martin', '11111111-1111-1111-1111-111111111111', 'aaaa1111-1111-1111-1111-111111111111', 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400', 'Médecin généraliste avec 15 ans d''expérience. Spécialisée dans la médecine préventive et le suivi des maladies chroniques.', ARRAY['Français', 'Anglais'], true, true, 4.8, 127, 25, now() + interval '1 day'),
  ('bbbb2222-2222-2222-2222-222222222222', 'Jean', 'Dupont', '33333333-3333-3333-3333-333333333333', 'aaaa2222-2222-2222-2222-222222222222', 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400', 'Cardiologue interventionnel. Expert en échocardiographie et maladies cardiovasculaires.', ARRAY['Français'], true, false, 4.9, 89, 55, now() + interval '3 days'),
  ('bbbb3333-3333-3333-3333-333333333333', 'Sophie', 'Bernard', '22222222-2222-2222-2222-222222222222', 'aaaa1111-1111-1111-1111-111111111111', 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400', 'Dermatologue spécialisée en dermatologie esthétique et traitement de l''acné.', ARRAY['Français', 'Espagnol'], true, true, 4.7, 203, 45, now() + interval '2 days'),
  ('bbbb4444-4444-4444-4444-444444444444', 'Pierre', 'Laurent', '44444444-4444-4444-4444-444444444444', 'aaaa3333-3333-3333-3333-333333333333', 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400', 'Pédiatre passionné par le bien-être des enfants. Spécialisé en néonatologie.', ARRAY['Français', 'Anglais', 'Italien'], true, true, 4.9, 156, 35, now()),
  ('bbbb5555-5555-5555-5555-555555555555', 'Claire', 'Moreau', '55555555-5555-5555-5555-555555555555', 'aaaa2222-2222-2222-2222-222222222222', 'https://images.unsplash.com/photo-1651008376811-b90baee60c1f?w=400', 'Ophtalmologue avec expertise en chirurgie réfractive et traitement du glaucome.', ARRAY['Français'], false, false, 4.6, 78, 50, now() + interval '1 week'),
  ('bbbb6666-6666-6666-6666-666666666666', 'Antoine', 'Petit', '77777777-7777-7777-7777-777777777777', 'aaaa4444-4444-4444-4444-444444444444', 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=400', 'Psychiatre spécialisé en thérapies cognitivo-comportementales et gestion du stress.', ARRAY['Français', 'Anglais'], true, true, 4.8, 92, 70, now() + interval '1 day'),
  ('bbbb7777-7777-7777-7777-777777777777', 'Isabelle', 'Roux', '66666666-6666-6666-6666-666666666666', 'aaaa1111-1111-1111-1111-111111111111', 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400', 'Gynécologue-obstétricienne. Suivi de grossesse et médecine de la femme.', ARRAY['Français', 'Arabe'], true, true, 4.7, 167, 45, now() + interval '4 days'),
  ('bbbb8888-8888-8888-8888-888888888888', 'Thomas', 'Girard', '88888888-8888-8888-8888-888888888888', 'aaaa3333-3333-3333-3333-333333333333', 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400', 'Kinésithérapeute du sport. Rééducation post-opératoire et blessures sportives.', ARRAY['Français'], true, false, 4.5, 45, 40, now());