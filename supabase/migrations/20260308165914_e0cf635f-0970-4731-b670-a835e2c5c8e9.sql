
-- Events table
CREATE TABLE public.events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  date date NOT NULL,
  time text,
  venue text,
  description text,
  images text[] DEFAULT '{}',
  video_url text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read events" ON public.events FOR SELECT USING (true);
CREATE POLICY "Authenticated can insert events" ON public.events FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update events" ON public.events FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated can delete events" ON public.events FOR DELETE TO authenticated USING (true);

-- News table
CREATE TABLE public.news (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  excerpt text,
  category text DEFAULT 'General',
  priority text DEFAULT 'normal',
  date date NOT NULL DEFAULT CURRENT_DATE,
  images text[] DEFAULT '{}',
  video_url text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read news" ON public.news FOR SELECT USING (true);
CREATE POLICY "Authenticated can insert news" ON public.news FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update news" ON public.news FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated can delete news" ON public.news FOR DELETE TO authenticated USING (true);

-- Announcements table
CREATE TABLE public.announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  message text,
  type text DEFAULT 'General',
  display_as text DEFAULT 'Ticker',
  active boolean DEFAULT true,
  images text[] DEFAULT '{}',
  video_url text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read announcements" ON public.announcements FOR SELECT USING (true);
CREATE POLICY "Authenticated can insert announcements" ON public.announcements FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update announcements" ON public.announcements FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated can delete announcements" ON public.announcements FOR DELETE TO authenticated USING (true);
