-- NotebookLM integration: user notebooks and notes
CREATE TABLE IF NOT EXISTS public.user_notebooks (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  notebook_id TEXT NOT NULL,
  notebook_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.user_notebooks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_notebooks_select" ON public.user_notebooks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "user_notebooks_insert" ON public.user_notebooks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "user_notebooks_update" ON public.user_notebooks FOR UPDATE USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.user_notebook_notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  notebook_id TEXT NOT NULL,
  source_id TEXT NOT NULL,
  content TEXT NOT NULL,
  source_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_notebook_notes_user ON public.user_notebook_notes(user_id);
ALTER TABLE public.user_notebook_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_notebook_notes_select" ON public.user_notebook_notes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "user_notebook_notes_insert" ON public.user_notebook_notes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "user_notebook_notes_delete" ON public.user_notebook_notes FOR DELETE USING (auth.uid() = user_id);
