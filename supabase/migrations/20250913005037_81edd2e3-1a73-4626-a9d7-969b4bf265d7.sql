-- Insert sample virtual tour data for the VR Garden
INSERT INTO virtual_tours (
  id,
  title_en,
  title_hi,
  description_en,
  description_hi,
  theme,
  cover_image_url,
  starting_position,
  vr_enabled,
  environment_settings,
  estimated_duration,
  difficulty_level,
  is_active
) VALUES (
  gen_random_uuid(),
  'Introduction to Medicinal Plants',
  'औषधीय पौधों का परिचय',
  'A beginner-friendly tour exploring common medicinal plants and their healing properties. Perfect for those new to herbal medicine.',
  'सामान्य औषधीय पौधों और उनके उपचार गुणों की खोज करने वाला शुरुआती-अनुकूल दौरा। हर्बल चिकित्सा में नए लोगों के लिए बिल्कुल सही।',
  'Educational',
  '/placeholder.svg',
  '{"x": 0, "y": 1.6, "z": 5}',
  true,
  '{"weather": "clear", "lighting": "day", "ambience": "peaceful"}',
  15,
  1,
  true
);

-- Get the tour id for waypoints
WITH tour_data AS (
  SELECT id as tour_id FROM virtual_tours WHERE title_en = 'Introduction to Medicinal Plants' LIMIT 1
)
INSERT INTO tour_waypoints (
  tour_id,
  plant_id,
  order_index,
  position,
  rotation,
  title_en,
  title_hi,
  description_en,
  description_hi
) 
SELECT 
  tour_data.tour_id,
  'aloe-vera',
  1,
  '{"x": -2, "y": 0, "z": -3}',
  '{"x": 0, "y": 0, "z": 0}',
  'Aloe Vera - The Healing Plant',
  'एलो वेरा - उपचार पौधा',
  'Welcome to our medicinal garden! Let''s start with Aloe Vera, one of the most recognized healing plants. Its gel-filled leaves have been used for thousands of years to treat burns, wounds, and skin conditions.',
  'हमारे औषधीय बगीचे में आपका स्वागत है! आइए एलो वेरा से शुरुआत करते हैं, जो सबसे प्रसिद्ध उपचार पौधों में से एक है। इसकी जेल से भरी पत्तियों का उपयोग हजारों सालों से जलने, घावों और त्वचा की समस्याओं के इलाज के लिए किया जाता रहा है।'
FROM tour_data;

WITH tour_data AS (
  SELECT id as tour_id FROM virtual_tours WHERE title_en = 'Introduction to Medicinal Plants' LIMIT 1
)
INSERT INTO tour_waypoints (
  tour_id,
  plant_id,
  order_index,
  position,
  rotation,
  title_en,
  title_hi,
  description_en,
  description_hi
) 
SELECT 
  tour_data.tour_id,
  'turmeric',
  2,
  '{"x": 0, "y": 0, "z": -2}',
  '{"x": 0, "y": 0, "z": 0}',
  'Turmeric - The Golden Spice',
  'हल्दी - सुनहरा मसाला',
  'Next, we explore Turmeric, known as the "Golden Spice." This powerful anti-inflammatory root has been a cornerstone of Ayurvedic medicine, helping with everything from joint pain to digestive issues.',
  'अब हम हल्दी की खोज करते हैं, जिसे "सुनहरा मसाला" कहा जाता है। यह शक्तिशाली एंटी-इंफ्लेमेटरी जड़ आयुर्वेदिक चिकित्सा की आधारशिला रही है, जो जोड़ों के दर्द से लेकर पाचन संबंधी समस्याओं तक हर चीज में मदद करती है।'
FROM tour_data;

WITH tour_data AS (
  SELECT id as tour_id FROM virtual_tours WHERE title_en = 'Introduction to Medicinal Plants' LIMIT 1
)
INSERT INTO tour_waypoints (
  tour_id,
  plant_id,
  order_index,
  position,
  rotation,
  title_en,
  title_hi,
  description_en,
  description_hi
) 
SELECT 
  tour_data.tour_id,
  'neem',
  3,
  '{"x": 2, "y": 0, "z": -3}',
  '{"x": 0, "y": 0, "z": 0}',
  'Neem - Nature''s Pharmacy',
  'नीम - प्रकृति की फार्मेसी',
  'Our final stop is the Neem tree, often called "Nature''s Pharmacy." Every part of this tree has medicinal properties, from its antibacterial leaves to its pest-repelling qualities. It''s truly a wonder of nature!',
  'हमारा अंतिम पड़ाव नीम का पेड़ है, जिसे अक्सर "प्रकृति की फार्मेसी" कहा जाता है। इस पेड़ के हर हिस्से में औषधीय गुण हैं, इसकी एंटीबैक्टीरियल पत्तियों से लेकर इसकी कीट-प्रतिरोधी गुणों तक। यह वास्तव में प्रकृति का चमत्कार है!'
FROM tour_data;