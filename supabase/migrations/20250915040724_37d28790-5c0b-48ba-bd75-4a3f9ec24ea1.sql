-- Add YouTube and sample 360° videos
INSERT INTO tour_videos (
  title_en, title_hi, description_en, description_hi, 
  video_url, video_type, duration, is_360, is_vr_compatible, 
  plant_id, tour_id, is_active
) VALUES 
(
  'Nature 360° Experience', 
  'प्रकृति 360° अनुभव',
  'Immersive 360° nature experience with birds and forest sounds',
  'पक्षियों और जंगल की आवाज़ों के साथ इमर्सिव 360° प्रकृति अनुभव',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
  'mp4',
  888,
  true,
  true,
  'neem',
  (SELECT id FROM virtual_tours LIMIT 1),
  true
),
(
  'Garden Walk 360°',
  'उद्यान यात्रा 360°', 
  'Take a virtual walk through a beautiful botanical garden',
  'एक सुंदर वनस्पति उद्यान के माध्यम से आभासी चलना',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
  'mp4',
  734,
  true,
  true,
  'turmeric',
  (SELECT id FROM virtual_tours LIMIT 1),
  true
);

-- Add more hotspots for the new videos
INSERT INTO video_hotspots (
  video_id, timestamp_seconds, title_en, title_hi, 
  content_en, content_hi, position_x, position_y, position_z,
  hotspot_type, target_plant_id, is_active
) VALUES 
(
  (SELECT id FROM tour_videos WHERE title_en = 'Nature 360° Experience'),
  60, 'Neem Tree Benefits', 'नीम के फायदे',
  'Click to learn about the medicinal properties of Neem',
  'नीम के औषधीय गुणों के बारे में जानने के लिए क्लिक करें',
  -5, 2, -10, 'plant', 'neem', true
),
(
  (SELECT id FROM tour_videos WHERE title_en = 'Garden Walk 360°'),
  120, 'Turmeric Cultivation', 'हल्दी की खेती',
  'Discover traditional turmeric growing methods',
  'पारंपरिक हल्दी उगाने के तरीकों की खोज करें',
  3, 1, -8, 'plant', 'turmeric', true
);