-- Create tour videos table
CREATE TABLE public.tour_videos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title_en TEXT NOT NULL,
  title_hi TEXT,
  description_en TEXT,
  description_hi TEXT,
  video_url TEXT NOT NULL,
  video_type TEXT DEFAULT 'mp4' CHECK (video_type IN ('mp4', 'webm', 'youtube')),
  duration INTEGER, -- duration in seconds
  is_360 BOOLEAN DEFAULT true,
  is_vr_compatible BOOLEAN DEFAULT true,
  thumbnail_url TEXT,
  tour_id UUID REFERENCES public.virtual_tours(id) ON DELETE CASCADE,
  plant_id TEXT REFERENCES public.plants(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create video hotspots table for interactive elements during video playback
CREATE TABLE public.video_hotspots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  video_id UUID REFERENCES public.tour_videos(id) ON DELETE CASCADE,
  timestamp_seconds INTEGER NOT NULL, -- when hotspot appears
  title_en TEXT NOT NULL,
  title_hi TEXT,
  content_en TEXT,
  content_hi TEXT,
  position_x FLOAT DEFAULT 0, -- 3D position for hotspot
  position_y FLOAT DEFAULT 0,
  position_z FLOAT DEFAULT 0,
  hotspot_type TEXT DEFAULT 'info' CHECK (hotspot_type IN ('info', 'plant', 'quiz', 'navigation')),
  target_plant_id TEXT REFERENCES public.plants(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.tour_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_hotspots ENABLE ROW LEVEL SECURITY;

-- Create policies for tour videos
CREATE POLICY "Anyone can view active tour videos" 
ON public.tour_videos 
FOR SELECT 
USING (is_active = true);

-- Create policies for video hotspots
CREATE POLICY "Anyone can view active video hotspots" 
ON public.video_hotspots 
FOR SELECT 
USING (is_active = true);

-- Create indexes for performance
CREATE INDEX idx_tour_videos_tour_id ON public.tour_videos(tour_id);
CREATE INDEX idx_tour_videos_plant_id ON public.tour_videos(plant_id);
CREATE INDEX idx_video_hotspots_video_id ON public.video_hotspots(video_id);
CREATE INDEX idx_video_hotspots_timestamp ON public.video_hotspots(timestamp_seconds);

-- Add trigger for updated_at
CREATE TRIGGER update_tour_videos_updated_at
BEFORE UPDATE ON public.tour_videos
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Insert sample 360° video content
INSERT INTO public.tour_videos (title_en, title_hi, description_en, description_hi, video_url, video_type, duration, tour_id, plant_id) 
VALUES 
  ('Virtual Herbal Garden Tour', 'आभासी जड़ी बूटी उद्यान यात्रा', 
   'Experience a 360° immersive tour of our herbal garden with detailed plant information', 
   'हमारे जड़ी बूटी उद्यान का 360° इमर्सिव दौरा करें और पौधों की विस्तृत जानकारी प्राप्त करें',
   'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', 
   'mp4', 596, 
   (SELECT id FROM public.virtual_tours LIMIT 1), 
   'aloe-vera'),
   
  ('Aloe Vera Cultivation Guide', 'एलोवेरा की खेती गाइड', 
   'Learn about Aloe Vera cultivation techniques in this immersive 360° experience', 
   'इस इमर्सिव 360° अनुभव में एलोवेरा की खेती तकनीकों के बारे में जानें',
   'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4', 
   'mp4', 30, 
   (SELECT id FROM public.virtual_tours LIMIT 1), 
   'aloe-vera'),
   
  ('Medicinal Plants Overview', 'औषधीय पौधों का विवरण', 
   'A comprehensive 360° overview of various medicinal plants and their benefits', 
   'विभिन्न औषधीय पौधों और उनके फायदों का एक व्यापक 360° विवरण',
   'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4', 
   'mp4', 653, 
   (SELECT id FROM public.virtual_tours LIMIT 1), 
   'turmeric');

-- Insert sample hotspots
INSERT INTO public.video_hotspots (video_id, timestamp_seconds, title_en, title_hi, content_en, content_hi, position_x, position_y, position_z, hotspot_type, target_plant_id)
VALUES 
  ((SELECT id FROM public.tour_videos WHERE title_en = 'Virtual Herbal Garden Tour' LIMIT 1), 
   30, 'Aloe Vera Plant', 'एलोवेरा का पौधा', 
   'Click to learn more about Aloe Vera benefits', 'एलोवेरा के फायदों के बारे में और जानने के लिए क्लिक करें',
   2, 0, -3, 'plant', 'aloe-vera'),
   
  ((SELECT id FROM public.tour_videos WHERE title_en = 'Virtual Herbal Garden Tour' LIMIT 1), 
   60, 'Turmeric Information', 'हल्दी की जानकारी', 
   'Discover the medicinal properties of turmeric', 'हल्दी के औषधीय गुणों की खोज करें',
   -2, 1, -2, 'info', 'turmeric');