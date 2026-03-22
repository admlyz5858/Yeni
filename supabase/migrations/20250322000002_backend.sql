-- Backend tabloları: Kullanıcı verileri
-- Her tablo user_id ile RLS ile korunur

-- 1. Plan verileri (exam_date, goals, schedule, completed_topics, topic_notes, pomodoro)
CREATE TABLE IF NOT EXISTS public.user_plan (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  exam_date DATE,
  daily_goal_hours INT DEFAULT 4,
  completed_topics JSONB DEFAULT '{}',
  schedule JSONB DEFAULT '[]',
  topic_notes JSONB DEFAULT '{}',
  has_seen_onboarding BOOLEAN DEFAULT FALSE,
  pomodoro_count INT DEFAULT 0,
  pomodoro_log JSONB DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.user_plan ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_plan_select" ON public.user_plan FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "user_plan_insert" ON public.user_plan FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "user_plan_update" ON public.user_plan FOR UPDATE USING (auth.uid() = user_id);

-- 2. Çalışma günlüğü (tarih bazlı saatler - liderlik tablosu için)
CREATE TABLE IF NOT EXISTS public.study_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  hours NUMERIC(4,2) NOT NULL DEFAULT 0,
  UNIQUE(user_id, date)
);

ALTER TABLE public.study_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "study_log_select" ON public.study_log FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "study_log_insert" ON public.study_log FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "study_log_update" ON public.study_log FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "study_log_delete" ON public.study_log FOR DELETE USING (auth.uid() = user_id);
CREATE INDEX idx_study_log_user_date ON public.study_log(user_id, date);

-- Liderlik için: Haftalık XP toplamları (profiles.xp ile birleştirilecek - gamification tablosunda)

-- 3. Dersler (subject list)
CREATE TABLE IF NOT EXISTS public.user_subjects (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  subjects JSONB DEFAULT '[]',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.user_subjects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_subjects_select" ON public.user_subjects FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "user_subjects_insert" ON public.user_subjects FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "user_subjects_update" ON public.user_subjects FOR UPDATE USING (auth.uid() = user_id);

-- 4. Gamification (XP, achievements)
CREATE TABLE IF NOT EXISTS public.user_gamification (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  xp INT DEFAULT 0,
  achievements JSONB DEFAULT '{}',
  last_login DATE,
  login_streak INT DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.user_gamification ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_gamification_select" ON public.user_gamification FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "user_gamification_insert" ON public.user_gamification FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "user_gamification_update" ON public.user_gamification FOR UPDATE USING (auth.uid() = user_id);

-- 5. Flashcards
CREATE TABLE IF NOT EXISTS public.flashcards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  subject_id TEXT NOT NULL,
  topic TEXT NOT NULL,
  front TEXT NOT NULL,
  back TEXT NOT NULL,
  next_review DATE NOT NULL,
  interval INT DEFAULT 0,
  ease_factor NUMERIC(4,2) DEFAULT 2.5,
  repetitions INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.flashcards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "flashcards_all" ON public.flashcards FOR ALL USING (auth.uid() = user_id);
CREATE INDEX idx_flashcards_user_next ON public.flashcards(user_id, next_review);

-- 6. Oyun verileri (gruplar, ünvanlar, haftalık görevler)
CREATE TABLE IF NOT EXISTS public.user_game (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  my_group_id TEXT,
  equipped_title_id TEXT DEFAULT 'yeni',
  weekly_completed JSONB DEFAULT '{}',
  last_seen_level INT DEFAULT 1,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.user_game ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_game_all" ON public.user_game FOR ALL USING (auth.uid() = user_id);

-- 7. Tema
CREATE TABLE IF NOT EXISTS public.user_settings (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  theme_mode TEXT DEFAULT 'light' CHECK (theme_mode IN ('light', 'dark')),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_settings_all" ON public.user_settings FOR ALL USING (auth.uid() = user_id);

-- 8. Günlük istatistikler (challenge, bonus)
CREATE TABLE IF NOT EXISTS public.user_daily (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  today_topics INT DEFAULT 0,
  today_pomodoro INT DEFAULT 0,
  challenge_completed BOOLEAN DEFAULT FALSE,
  challenge_progress INT DEFAULT 0,
  bonus_claimed BOOLEAN DEFAULT FALSE,
  PRIMARY KEY (user_id, date)
);

ALTER TABLE public.user_daily ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_daily_all" ON public.user_daily FOR ALL USING (auth.uid() = user_id);

-- profiles.xp sütunu (liderlik için)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS xp INT DEFAULT 0;

-- XP senkronizasyonu: user_gamification güncellenince profiles.xp güncelle
CREATE OR REPLACE FUNCTION public.sync_profile_xp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.profiles SET xp = NEW.xp WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS sync_xp_on_gamification ON public.user_gamification;
CREATE TRIGGER sync_xp_on_gamification
  AFTER INSERT OR UPDATE OF xp ON public.user_gamification
  FOR EACH ROW EXECUTE FUNCTION public.sync_profile_xp();

-- Yeni kullanıcı için varsayılan satırlar
CREATE OR REPLACE FUNCTION public.init_user_data()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_plan (user_id) VALUES (NEW.id);
  INSERT INTO public.user_subjects (user_id) VALUES (NEW.id);
  INSERT INTO public.user_gamification (user_id) VALUES (NEW.id);
  INSERT INTO public.user_game (user_id) VALUES (NEW.id);
  INSERT INTO public.user_settings (user_id) VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_profile_created ON public.profiles;
CREATE TRIGGER on_profile_created
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.init_user_data();

-- Liderlik: Tüm kullanıcıların xp sıralaması (anon okunabilir)
CREATE OR REPLACE FUNCTION public.get_leaderboard(limit_count INT DEFAULT 20)
RETURNS TABLE(rank BIGINT, user_id UUID, name TEXT, xp INT)
LANGUAGE sql SECURITY DEFINER SET search_path = public
AS $$
  SELECT ROW_NUMBER() OVER (ORDER BY p.xp DESC)::BIGINT, p.id, p.name, COALESCE(p.xp, 0)
  FROM profiles p
  ORDER BY COALESCE(p.xp, 0) DESC
  LIMIT limit_count;
$$;
