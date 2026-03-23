-- App preferences (keepScreenOn, strictMode, customQuotes, etc.)
ALTER TABLE public.user_settings ADD COLUMN IF NOT EXISTS app_preferences JSONB DEFAULT '{}';
