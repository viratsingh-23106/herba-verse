import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface TourVideo {
  id: string;
  title_en: string;
  title_hi?: string;
  description_en?: string;
  description_hi?: string;
  video_url: string;
  video_type: string;
  duration?: number;
  is_360: boolean;
  is_vr_compatible: boolean;
  thumbnail_url?: string;
  tour_id?: string;
  plant_id?: string;
  is_active: boolean;
}

interface VideoHotspot {
  id: string;
  video_id: string;
  timestamp_seconds: number;
  title_en: string;
  title_hi?: string;
  content_en?: string;
  content_hi?: string;
  position_x: number;
  position_y: number;
  position_z: number;
  hotspot_type: 'info' | 'plant' | 'quiz' | 'navigation';
  target_plant_id?: string;
  is_active: boolean;
}

export const useVRVideo = (tourId?: string) => {
  const [videos, setVideos] = useState<TourVideo[]>([]);
  const [currentVideo, setCurrentVideo] = useState<TourVideo | null>(null);
  const [hotspots, setHotspots] = useState<VideoHotspot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load videos for a specific tour
  const loadTourVideos = async (id?: string) => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('tour_videos')
        .select('*')
        .eq('is_active', true);

      if (id) {
        query = query.eq('tour_id', id);
      }

      const { data, error: videoError } = await query
        .order('created_at', { ascending: true });

      if (videoError) {
        throw videoError;
      }

      setVideos(data || []);
      
      // Set the first video as current if available
      if (data && data.length > 0) {
        setCurrentVideo(data[0]);
        await loadVideoHotspots(data[0].id);
      }
    } catch (err) {
      console.error('Error loading tour videos:', err);
      setError(err instanceof Error ? err.message : 'Failed to load videos');
    } finally {
      setLoading(false);
    }
  };

  // Load hotspots for a specific video
  const loadVideoHotspots = async (videoId: string) => {
    try {
      const { data, error: hotspotsError } = await supabase
        .from('video_hotspots')
        .select('*')
        .eq('video_id', videoId)
        .eq('is_active', true)
        .order('timestamp_seconds', { ascending: true });

      if (hotspotsError) {
        throw hotspotsError;
      }

      setHotspots((data || []).map(hotspot => ({
        ...hotspot,
        hotspot_type: hotspot.hotspot_type as 'info' | 'plant' | 'quiz' | 'navigation'
      })));
    } catch (err) {
      console.error('Error loading video hotspots:', err);
      // Don't set error for hotspots, just log it
    }
  };

  // Switch to a different video
  const switchVideo = async (video: TourVideo) => {
    setCurrentVideo(video);
    await loadVideoHotspots(video.id);
  };

  // Get video by plant ID
  const getVideoByPlant = async (plantId: string) => {
    try {
      const { data, error } = await supabase
        .from('tour_videos')
        .select('*')
        .eq('plant_id', plantId)
        .eq('is_active', true)
        .maybeSingle();

      if (error) {
        throw error;
      }

      if (data) {
        await switchVideo(data);
        return data;
      }
      return null;
    } catch (err) {
      console.error('Error getting video by plant:', err);
      return null;
    }
  };

  // Load all available videos (not filtered by tour)
  const loadAllVideos = async () => {
    await loadTourVideos();
  };

  useEffect(() => {
    loadTourVideos(tourId);
  }, [tourId]);

  return {
    videos,
    currentVideo,
    hotspots,
    loading,
    error,
    loadTourVideos,
    loadVideoHotspots,
    switchVideo,
    getVideoByPlant,
    loadAllVideos,
  };
};