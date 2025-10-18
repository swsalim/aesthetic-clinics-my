CREATE POLICY "Allow read access for all users" ON public.areas FOR SELECT USING (true);
CREATE POLICY "Allow insert for authenticated user" ON public.areas FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow insert for super admin" ON public.areas FOR INSERT TO authenticated WITH CHECK (((auth.jwt() ->> 'email'::text) = 'swsalim@gmail.com'::text));
CREATE POLICY "Allow update for super admin" ON public.areas FOR UPDATE TO authenticated USING (((auth.jwt() ->> 'email'::text) = 'swsalim@gmail.com'::text)) WITH CHECK (((auth.jwt() ->> 'email'::text) = 'swsalim@gmail.com'::text));
CREATE POLICY "Allow delete for super admin" ON public.areas FOR DELETE TO authenticated USING (((auth.jwt() ->> 'email'::text) = 'swsalim@gmail.com'::text));

CREATE POLICY "Allow read access for all users" ON public.clinic_services FOR SELECT USING (true);
CREATE POLICY "Allow insert for authenticated user" ON public.clinic_services FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow insert for super admin" ON public.clinic_services FOR INSERT TO authenticated WITH CHECK (((auth.jwt() ->> 'email'::text) = 'swsalim@gmail.com'::text));
CREATE POLICY "Allow update for super admin" ON public.clinic_services FOR UPDATE TO authenticated USING (((auth.jwt() ->> 'email'::text) = 'swsalim@gmail.com'::text)) WITH CHECK (((auth.jwt() ->> 'email'::text) = 'swsalim@gmail.com'::text));
CREATE POLICY "Allow delete for super admin" ON public.clinic_services FOR DELETE TO authenticated USING (((auth.jwt() ->> 'email'::text) = 'swsalim@gmail.com'::text));

CREATE POLICY "Allow read access for all users" ON public.clinic_service_relations FOR SELECT USING (true);
CREATE POLICY "Allow insert for authenticated user" ON public.clinic_service_relations FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow insert for super admin" ON public.clinic_service_relations FOR INSERT TO authenticated WITH CHECK (((auth.jwt() ->> 'email'::text) = 'swsalim@gmail.com'::text));
CREATE POLICY "Allow update for super admin" ON public.clinic_service_relations FOR UPDATE TO authenticated USING (((auth.jwt() ->> 'email'::text) = 'swsalim@gmail.com'::text)) WITH CHECK (((auth.jwt() ->> 'email'::text) = 'swsalim@gmail.com'::text));
CREATE POLICY "Allow delete for super admin" ON public.clinic_service_relations FOR DELETE TO authenticated USING (((auth.jwt() ->> 'email'::text) = 'swsalim@gmail.com'::text));

CREATE POLICY "Allow read access for all users" ON public.clinic_doctors FOR SELECT USING (true);
CREATE POLICY "Allow insert for authenticated user" ON public.clinic_doctors FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow insert for super admin" ON public.clinic_doctors FOR INSERT TO authenticated WITH CHECK (((auth.jwt() ->> 'email'::text) = 'swsalim@gmail.com'::text));
CREATE POLICY "Allow update for super admin" ON public.clinic_doctors FOR UPDATE TO authenticated USING (((auth.jwt() ->> 'email'::text) = 'swsalim@gmail.com'::text)) WITH CHECK (((auth.jwt() ->> 'email'::text) = 'swsalim@gmail.com'::text));
CREATE POLICY "Allow delete for super admin" ON public.clinic_doctors FOR DELETE TO authenticated USING (((auth.jwt() ->> 'email'::text) = 'swsalim@gmail.com'::text));

CREATE POLICY "Allow read access for all users" ON public.clinic_hours FOR SELECT USING (true);
CREATE POLICY "Allow insert for authenticated user" ON public.clinic_hours FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow insert for super admin" ON public.clinic_hours FOR INSERT TO authenticated WITH CHECK (((auth.jwt() ->> 'email'::text) = 'swsalim@gmail.com'::text));
CREATE POLICY "Allow update for super admin" ON public.clinic_hours FOR UPDATE TO authenticated USING (((auth.jwt() ->> 'email'::text) = 'swsalim@gmail.com'::text)) WITH CHECK (((auth.jwt() ->> 'email'::text) = 'swsalim@gmail.com'::text));
CREATE POLICY "Allow delete for super admin" ON public.clinic_hours FOR DELETE TO authenticated USING (((auth.jwt() ->> 'email'::text) = 'swsalim@gmail.com'::text));

CREATE POLICY "Allow read access for all users" ON public.clinic_reviews FOR SELECT USING (true);
CREATE POLICY "Allow insert for authenticated user" ON public.clinic_reviews FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow insert for super admin" ON public.clinic_reviews FOR INSERT TO authenticated WITH CHECK (((auth.jwt() ->> 'email'::text) = 'swsalim@gmail.com'::text));
CREATE POLICY "Allow update for super admin" ON public.clinic_reviews FOR UPDATE TO authenticated USING (((auth.jwt() ->> 'email'::text) = 'swsalim@gmail.com'::text)) WITH CHECK (((auth.jwt() ->> 'email'::text) = 'swsalim@gmail.com'::text));
CREATE POLICY "Allow delete for super admin" ON public.clinic_reviews FOR DELETE TO authenticated USING (((auth.jwt() ->> 'email'::text) = 'swsalim@gmail.com'::text));

CREATE POLICY "Allow read access for all users" ON public.clinic_special_hours FOR SELECT USING (true);
CREATE POLICY "Allow insert for authenticated user" ON public.clinic_special_hours FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow insert for super admin" ON public.clinic_special_hours FOR INSERT TO authenticated WITH CHECK (((auth.jwt() ->> 'email'::text) = 'swsalim@gmail.com'::text));
CREATE POLICY "Allow update for super admin" ON public.clinic_special_hours FOR UPDATE TO authenticated USING (((auth.jwt() ->> 'email'::text) = 'swsalim@gmail.com'::text)) WITH CHECK (((auth.jwt() ->> 'email'::text) = 'swsalim@gmail.com'::text));
CREATE POLICY "Allow delete for super admin" ON public.clinic_special_hours FOR DELETE TO authenticated USING (((auth.jwt() ->> 'email'::text) = 'swsalim@gmail.com'::text));

CREATE POLICY "Allow read access for all users" ON public.clinics FOR SELECT USING (true);
CREATE POLICY "Allow insert for authenticated user" ON public.clinics FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow insert for super admin" ON public.clinics FOR INSERT TO authenticated WITH CHECK (((auth.jwt() ->> 'email'::text) = 'swsalim@gmail.com'::text));
CREATE POLICY "Allow update for super admin" ON public.clinics FOR UPDATE TO authenticated USING (((auth.jwt() ->> 'email'::text) = 'swsalim@gmail.com'::text)) WITH CHECK (((auth.jwt() ->> 'email'::text) = 'swsalim@gmail.com'::text));
CREATE POLICY "Allow delete for super admin" ON public.clinics FOR DELETE TO authenticated USING (true);

CREATE POLICY "Allow read access for all users" ON public.states FOR SELECT USING (true);
CREATE POLICY "Allow insert for authenticated user" ON public.states FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow insert for super admin" ON public.states FOR INSERT TO authenticated WITH CHECK (((auth.jwt() ->> 'email'::text) = 'swsalim@gmail.com'::text));
CREATE POLICY "Allow update for super admin" ON public.states FOR UPDATE TO authenticated USING (((auth.jwt() ->> 'email'::text) = 'swsalim@gmail.com'::text)) WITH CHECK (((auth.jwt() ->> 'email'::text) = 'swsalim@gmail.com'::text));
CREATE POLICY "Allow delete for super admin" ON public.states FOR DELETE TO authenticated USING (((auth.jwt() ->> 'email'::text) = 'swsalim@gmail.com'::text));

CREATE POLICY "Allow read access for all users" ON public.clinic_doctor_relations FOR SELECT USING (true);
CREATE POLICY "Allow insert for authenticated user" ON public.clinic_doctor_relations FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow insert for super admin" ON public.clinic_doctor_relations FOR INSERT TO authenticated WITH CHECK (((auth.jwt() ->> 'email'::text) = 'swsalim@gmail.com'::text));
CREATE POLICY "Allow update for super admin" ON public.clinic_doctor_relations FOR UPDATE TO authenticated USING (((auth.jwt() ->> 'email'::text) = 'swsalim@gmail.com'::text)) WITH CHECK (((auth.jwt() ->> 'email'::text) = 'swsalim@gmail.com'::text));
CREATE POLICY "Allow delete for super admin" ON public.clinic_doctor_relations FOR DELETE TO authenticated USING (((auth.jwt() ->> 'email'::text) = 'swsalim@gmail.com'::text));

