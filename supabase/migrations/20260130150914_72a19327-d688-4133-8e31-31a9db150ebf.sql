-- Create users table for username-based identity (no auth)
CREATE TABLE public.users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS but allow public access (username-only system)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read users"
  ON public.users FOR SELECT
  USING (true);

CREATE POLICY "Anyone can create users"
  ON public.users FOR INSERT
  WITH CHECK (true);

-- Create problems table
CREATE TABLE public.problems (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Home', 'Fashion', 'Tech', 'Study', 'Budget', 'Organization', 'DIY')),
  is_solved BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.problems ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read problems"
  ON public.problems FOR SELECT
  USING (true);

CREATE POLICY "Anyone can create problems"
  ON public.problems FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update their own problems"
  ON public.problems FOR UPDATE
  USING (true);

-- Create solutions table
CREATE TABLE public.solutions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  problem_id UUID REFERENCES public.problems(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  product_link TEXT,
  product_name TEXT,
  is_ai_generated BOOLEAN NOT NULL DEFAULT false,
  upvotes_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.solutions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read solutions"
  ON public.solutions FOR SELECT
  USING (true);

CREATE POLICY "Anyone can create solutions"
  ON public.solutions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update solutions"
  ON public.solutions FOR UPDATE
  USING (true);

-- Create upvotes table
CREATE TABLE public.upvotes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  solution_id UUID REFERENCES public.solutions(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(solution_id, user_id)
);

ALTER TABLE public.upvotes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read upvotes"
  ON public.upvotes FOR SELECT
  USING (true);

CREATE POLICY "Anyone can create upvotes"
  ON public.upvotes FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can delete upvotes"
  ON public.upvotes FOR DELETE
  USING (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for problems updated_at
CREATE TRIGGER update_problems_updated_at
  BEFORE UPDATE ON public.problems
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to update solution upvotes count
CREATE OR REPLACE FUNCTION public.update_upvotes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.solutions SET upvotes_count = upvotes_count + 1 WHERE id = NEW.solution_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.solutions SET upvotes_count = upvotes_count - 1 WHERE id = OLD.solution_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for upvotes count
CREATE TRIGGER on_upvote_insert
  AFTER INSERT ON public.upvotes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_upvotes_count();

CREATE TRIGGER on_upvote_delete
  AFTER DELETE ON public.upvotes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_upvotes_count();

-- Enable realtime for problems and solutions
ALTER PUBLICATION supabase_realtime ADD TABLE public.problems;
ALTER PUBLICATION supabase_realtime ADD TABLE public.solutions;

-- Insert preloaded 2025 example problems with a demo user
INSERT INTO public.users (id, username) VALUES 
  ('00000000-0000-0000-0000-000000000001', 'FixFareTeam');

INSERT INTO public.problems (id, user_id, title, description, category, created_at) VALUES 
  ('00000000-0000-0000-0001-000000000001', '00000000-0000-0000-0000-000000000001', 
   'My phone cable keeps breaking near the connector', 
   'Every charger I buy stops working within a month. The wire always bends and breaks near the head.',
   'Tech', '2025-01-15 10:30:00+00'),
  ('00000000-0000-0000-0001-000000000002', '00000000-0000-0000-0000-000000000001',
   'Jeans are too long for short people 😭',
   'Tailoring ruins the original fit and shape of my jeans.',
   'Fashion', '2025-01-18 14:20:00+00'),
  ('00000000-0000-0000-0001-000000000003', '00000000-0000-0000-0000-000000000001',
   'My study desk is always messy',
   'Books, cables, and stationery pile up and I can''t focus.',
   'Organization', '2025-01-22 09:15:00+00');

-- Insert sample solutions
INSERT INTO public.solutions (problem_id, user_id, content, product_link, product_name) VALUES
  ('00000000-0000-0000-0001-000000000001', '00000000-0000-0000-0000-000000000001',
   'Use a cable protector spring or silicone sleeve. It prevents bending stress and extends the life of your cables significantly.',
   'https://amazon.com/cable-protector', 'Cable Protector Spring Set'),
  ('00000000-0000-0000-0001-000000000002', '00000000-0000-0000-0000-000000000001',
   'Iron-on hemming tape works great and doesn''t damage the jeans. You can adjust the length without permanent alterations.',
   'https://flipkart.com/hemming-tape', 'Iron-On Hemming Tape'),
  ('00000000-0000-0000-0001-000000000003', '00000000-0000-0000-0000-000000000001',
   'Use a vertical desk organizer and cable clips to free up surface space. This creates dedicated zones for different items.',
   'https://meesho.com/desk-organizer', 'Vertical Desk Organizer Set');