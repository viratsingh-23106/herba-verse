-- Create storage bucket for 3D plant models
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
VALUES (
  'plant-models', 
  'plant-models', 
  true, 
  52428800, -- 50MB limit
  ARRAY['model/gltf-binary', 'model/gltf+json', 'application/octet-stream']
);

-- Create plants table to replace mock data
CREATE TABLE public.plants (
  id TEXT PRIMARY KEY,
  name_en TEXT NOT NULL,
  name_hi TEXT,
  scientific_name TEXT,
  description_en TEXT,
  description_hi TEXT,
  uses_en TEXT[],
  uses_hi TEXT[],
  image_url TEXT,
  real_images TEXT[],
  color TEXT DEFAULT '#4ade80',
  habitat_en TEXT,
  habitat_hi TEXT,
  cultivation_en TEXT,
  cultivation_hi TEXT,
  medicinal_parts_en TEXT[],
  medicinal_parts_hi TEXT[],
  preparation_methods_en TEXT[],
  preparation_methods_hi TEXT[],
  dosage_en TEXT,
  dosage_hi TEXT,
  precautions_en TEXT,
  precautions_hi TEXT,
  references TEXT[],
  ayurvedic_properties JSONB,
  glb_url TEXT, -- URL to 3D model in storage
  vr_position JSONB DEFAULT '{"x": 0, "y": 0, "z": 0}', -- Position in VR garden
  vr_scale JSONB DEFAULT '{"x": 1, "y": 1, "z": 1}', -- Scale in VR
  vr_rotation JSONB DEFAULT '{"x": 0, "y": 0, "z": 0}', -- Rotation in VR
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on plants table
ALTER TABLE public.plants ENABLE ROW LEVEL SECURITY;

-- Create policy for plants - publicly readable
CREATE POLICY "Anyone can view plants" 
ON public.plants 
FOR SELECT 
USING (true);

-- Create tour waypoints table for VR navigation
CREATE TABLE public.tour_waypoints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tour_id UUID REFERENCES public.virtual_tours(id) ON DELETE CASCADE,
  plant_id TEXT REFERENCES public.plants(id) ON DELETE CASCADE,
  position JSONB NOT NULL, -- Camera position for this waypoint
  rotation JSONB DEFAULT '{"x": 0, "y": 0, "z": 0}', -- Camera rotation
  order_index INTEGER NOT NULL,
  title_en TEXT,
  title_hi TEXT,
  description_en TEXT,
  description_hi TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on tour waypoints
ALTER TABLE public.tour_waypoints ENABLE ROW LEVEL SECURITY;

-- Create policy for tour waypoints - publicly readable
CREATE POLICY "Anyone can view tour waypoints" 
ON public.tour_waypoints 
FOR SELECT 
USING (true);

-- Add VR-specific fields to virtual tours
ALTER TABLE public.virtual_tours 
ADD COLUMN vr_enabled BOOLEAN DEFAULT true,
ADD COLUMN environment_settings JSONB DEFAULT '{"lighting": "day", "weather": "clear"}',
ADD COLUMN starting_position JSONB DEFAULT '{"x": 0, "y": 1.6, "z": 5}';

-- Create storage policies for plant models
CREATE POLICY "Plant models are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'plant-models');

-- Insert sample plants data from existing plantsData.ts
INSERT INTO public.plants (
  id, name_en, scientific_name, description_en, uses_en, image_url, 
  real_images, color, habitat_en, cultivation_en, medicinal_parts_en, 
  preparation_methods_en, dosage_en, precautions_en, references, 
  ayurvedic_properties, vr_position
) VALUES 
(
  'aloe-vera',
  'Aloe Vera',
  'Aloe barbadensis miller',
  'Aloe Vera is a succulent plant species that has been used for medicinal purposes for thousands of years.',
  ARRAY['Wound healing', 'Skin conditions', 'Digestive health', 'Anti-inflammatory'],
  '/src/assets/aloe-vera.jpg',
  ARRAY['/src/assets/real-aloe-vera.jpg'],
  '#4ade80',
  'Native to the Arabian Peninsula, now cultivated worldwide in tropical and semi-tropical regions',
  'Requires well-drained soil and full sun to partial shade. Water deeply but infrequently.',
  ARRAY['Leaves (gel and latex)'],
  ARRAY['Fresh gel application', 'Dried latex powder', 'Juice extraction'],
  'Apply gel topically 2-3 times daily. For internal use: 1-2 tablespoons of juice daily.',
  'Avoid internal use during pregnancy and breastfeeding. May cause allergic reactions in sensitive individuals.',
  ARRAY['Journal of Ethnopharmacology', 'Phytotherapy Research'],
  '{"rasa": ["Tikta", "Kashaya"], "virya": "Shita", "vipaka": "Katu", "doshaEffect": "Reduces Pitta and Kapha"}',
  '{"x": -3, "y": 0, "z": 2}'
),
(
  'turmeric',
  'Turmeric', 
  'Curcuma longa',
  'Turmeric is a flowering plant whose rhizome is commonly used as a spice and traditional medicine.',
  ARRAY['Anti-inflammatory', 'Antioxidant', 'Joint health', 'Digestive support'],
  '/src/assets/turmeric.jpg',
  ARRAY['/src/assets/real-turmeric.jpg'],
  '#f59e0b',
  'Native to Southeast Asia, cultivated in tropical regions with high rainfall',
  'Grows in well-drained, fertile soil. Requires warm, humid climate with regular watering.',
  ARRAY['Rhizome'],
  ARRAY['Powder form', 'Fresh paste', 'Oil extraction', 'Milk decoction'],
  '1-3 grams of turmeric powder daily. For paste: mix with water or milk.',
  'May increase bleeding risk. Avoid high doses during pregnancy. Can interact with blood thinners.',
  ARRAY['Journal of Medicinal Food', 'Clinical Interventions in Aging'],
  '{"rasa": ["Tikta", "Katu"], "virya": "Ushna", "vipaka": "Katu", "doshaEffect": "Reduces Kapha and Vata, may increase Pitta in excess"}',
  '{"x": 0, "y": 0, "z": 0}'
),
(
  'neem',
  'Neem',
  'Azadirachta indica', 
  'Neem is a tree native to the Indian subcontinent, known for its medicinal properties and natural pesticide qualities.',
  ARRAY['Antimicrobial', 'Skin conditions', 'Oral health', 'Blood purification'],
  '/src/assets/neem.jpg',
  ARRAY['/src/assets/real-neem.jpg'],
  '#22c55e',
  'Native to India and Myanmar, grows in tropical and semi-tropical regions',
  'Hardy tree that grows in various soil types. Drought tolerant once established.',
  ARRAY['Leaves', 'Bark', 'Seeds', 'Oil'],
  ARRAY['Leaf paste', 'Oil application', 'Decoction', 'Powder'],
  '2-4 neem leaves daily or 1-2ml neem oil for topical use.',
  'Avoid during pregnancy and breastfeeding. May affect blood sugar levels.',
  ARRAY['Journal of Ethnobiology and Ethnomedicine', 'Asian Pacific Journal of Tropical Medicine'],
  '{"rasa": ["Tikta"], "virya": "Shita", "vipaka": "Katu", "doshaEffect": "Reduces Pitta and Kapha"}',
  '{"x": 3, "y": 0, "z": -2}'
);

-- Create trigger for updated_at on plants table
CREATE TRIGGER update_plants_updated_at
BEFORE UPDATE ON public.plants
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();