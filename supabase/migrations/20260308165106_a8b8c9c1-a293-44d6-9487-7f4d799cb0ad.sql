
-- Departments table
CREATE TABLE public.departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  icon TEXT DEFAULT '📚',
  description TEXT,
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read departments" ON public.departments FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Authenticated can insert departments" ON public.departments FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update departments" ON public.departments FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated can delete departments" ON public.departments FOR DELETE TO authenticated USING (true);

-- Programs table
CREATE TABLE public.programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  department_id UUID REFERENCES public.departments(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  level TEXT NOT NULL DEFAULT 'Intermediate',
  duration TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read programs" ON public.programs FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Authenticated can insert programs" ON public.programs FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update programs" ON public.programs FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated can delete programs" ON public.programs FOR DELETE TO authenticated USING (true);
