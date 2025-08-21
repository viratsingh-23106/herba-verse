-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User Profiles Table (extends auth.users)
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  preferred_language TEXT DEFAULT 'en' CHECK (preferred_language IN ('en', 'hi')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profile policies
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Health Conditions for AI Suggestions
CREATE TABLE public.health_conditions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name_en TEXT NOT NULL,
  name_hi TEXT,
  description_en TEXT,
  description_hi TEXT,
  keywords TEXT[], -- For matching user queries
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Plant Recommendations (AI Generated)
CREATE TABLE public.plant_recommendations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  query_text TEXT NOT NULL,
  health_condition_id UUID REFERENCES public.health_conditions(id),
  recommended_plants JSONB NOT NULL, -- Array of plant objects with confidence scores
  ai_response TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.plant_recommendations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own recommendations" ON public.plant_recommendations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own recommendations" ON public.plant_recommendations FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Quiz System Tables
CREATE TYPE quiz_type AS ENUM ('image_identification', 'name_matching', 'medicinal_uses', 'ayurvedic_properties');
CREATE TYPE badge_type AS ENUM ('beginner', 'intermediate', 'advanced', 'expert', 'specialist');

CREATE TABLE public.quizzes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title_en TEXT NOT NULL,
  title_hi TEXT,
  description_en TEXT,
  description_hi TEXT,
  quiz_type quiz_type NOT NULL,
  difficulty_level INTEGER DEFAULT 1 CHECK (difficulty_level BETWEEN 1 AND 5),
  questions JSONB NOT NULL, -- Array of question objects
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.user_quiz_scores (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  quiz_id UUID REFERENCES public.quizzes(id) ON DELETE CASCADE,
  score INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  time_taken INTEGER, -- seconds
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, quiz_id, completed_at)
);

-- Badges and Achievements
CREATE TABLE public.badges (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name_en TEXT NOT NULL UNIQUE,
  name_hi TEXT,
  description_en TEXT,
  description_hi TEXT,
  badge_type badge_type NOT NULL,
  icon_url TEXT,
  requirements JSONB NOT NULL, -- Criteria for earning the badge
  points INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.user_badges (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_id UUID REFERENCES public.badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

-- Enable RLS for quiz tables
ALTER TABLE public.user_quiz_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own quiz scores" ON public.user_quiz_scores FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own quiz scores" ON public.user_quiz_scores FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view own badges" ON public.user_badges FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view all badges" ON public.badges FOR SELECT USING (true);

-- User Notes and Content
CREATE TABLE public.user_plant_notes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  plant_id TEXT NOT NULL, -- References plant from our data
  title TEXT,
  content TEXT,
  tags TEXT[],
  is_private BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Remedies and Experiences
CREATE TABLE public.user_remedies (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title_en TEXT NOT NULL,
  title_hi TEXT,
  description_en TEXT,
  description_hi TEXT,
  ingredients JSONB, -- Array of plant ingredients
  preparation_method TEXT,
  dosage TEXT,
  precautions TEXT,
  effectiveness_rating INTEGER CHECK (effectiveness_rating BETWEEN 1 AND 5),
  image_urls TEXT[],
  is_approved BOOLEAN DEFAULT false, -- For moderation
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.user_plant_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_remedies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own notes" ON public.user_plant_notes FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own remedies" ON public.user_remedies FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view public remedies" ON public.user_remedies FOR SELECT USING (is_public = true AND is_approved = true);

-- Virtual Tours System
CREATE TABLE public.virtual_tours (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title_en TEXT NOT NULL,
  title_hi TEXT,
  description_en TEXT,
  description_hi TEXT,
  theme TEXT NOT NULL, -- e.g., 'digestive_health', 'immunity', 'skin_care'
  difficulty_level INTEGER DEFAULT 1 CHECK (difficulty_level BETWEEN 1 AND 5),
  estimated_duration INTEGER, -- minutes
  cover_image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.tour_stops (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  tour_id UUID REFERENCES public.virtual_tours(id) ON DELETE CASCADE,
  plant_id TEXT NOT NULL, -- References plant from our data
  stop_order INTEGER NOT NULL,
  title_en TEXT NOT NULL,
  title_hi TEXT,
  content_en TEXT,
  content_hi TEXT,
  learning_objectives TEXT[],
  interactive_elements JSONB, -- Quiz questions, activities
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.user_tour_progress (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  tour_id UUID REFERENCES public.virtual_tours(id) ON DELETE CASCADE,
  current_stop INTEGER DEFAULT 0,
  completed_stops INTEGER[] DEFAULT '{}',
  progress_percentage DECIMAL(5,2) DEFAULT 0.00,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_id, tour_id)
);

-- Enable RLS
ALTER TABLE public.user_tour_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own tour progress" ON public.user_tour_progress FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view all tours" ON public.virtual_tours FOR SELECT USING (is_active = true);
CREATE POLICY "Users can view all tour stops" ON public.tour_stops FOR SELECT USING (true);

-- User Bookmarks (migrate from localStorage)
CREATE TABLE public.user_bookmarks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  plant_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, plant_id)
);

-- Enable RLS
ALTER TABLE public.user_bookmarks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own bookmarks" ON public.user_bookmarks FOR ALL USING (auth.uid() = user_id);

-- Trigger function for updating timestamps
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_user_plant_notes_updated_at
  BEFORE UPDATE ON public.user_plant_notes
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_user_remedies_updated_at
  BEFORE UPDATE ON public.user_remedies
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, preferred_language)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'preferred_language', 'en')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for automatic profile creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();