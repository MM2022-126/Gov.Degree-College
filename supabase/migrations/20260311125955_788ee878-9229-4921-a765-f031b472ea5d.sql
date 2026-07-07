
CREATE TABLE public.site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value text NOT NULL,
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read site_settings" ON public.site_settings
FOR SELECT TO public USING (true);

CREATE POLICY "Authenticated can insert site_settings" ON public.site_settings
FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated can update site_settings" ON public.site_settings
FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated can delete site_settings" ON public.site_settings
FOR DELETE TO authenticated USING (true);

INSERT INTO public.site_settings (key, value) VALUES
  ('contact_address', 'Ravi Road, Shahdara, Lahore, Punjab 54000'),
  ('contact_phone', '+92-42-XXXXXXX'),
  ('contact_email', 'info@ggc.edu.pk'),
  ('contact_hours', 'Mon - Sat: 8:00 AM - 3:00 PM');
