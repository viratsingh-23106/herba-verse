import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface TourWaypoint {
  id: string;
  tour_id: string;
  plant_id: string;
  position: any;
  rotation: any;
  order_index: number;
  title_en: string;
  title_hi?: string;
  description_en?: string;
  description_hi?: string;
}

interface VRTour {
  id: string;
  title_en: string;
  title_hi?: string;
  description_en?: string;
  description_hi?: string;
  waypoints: TourWaypoint[];
}

export const useVRTour = (tourId?: string) => {
  const [currentTour, setCurrentTour] = useState<VRTour | null>(null);
  const [currentWaypointIndex, setCurrentWaypointIndex] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [loading, setLoading] = useState(false);

  const loadTour = async (id: string) => {
    setLoading(true);
    try {
      // Fetch tour details
      const { data: tourData, error: tourError } = await supabase
        .from('virtual_tours')
        .select('*')
        .eq('id', id)
        .eq('is_active', true)
        .single();

      if (tourError) throw tourError;

      // Fetch tour waypoints
      const { data: waypointsData, error: waypointsError } = await supabase
        .from('tour_waypoints')
        .select('*')
        .eq('tour_id', id)
        .order('order_index');

      if (waypointsError) throw waypointsError;

      const transformedWaypoints = (waypointsData || []).map(waypoint => ({
        ...waypoint,
        position: typeof waypoint.position === 'object' ? waypoint.position : { x: 0, y: 0, z: 0 },
        rotation: typeof waypoint.rotation === 'object' ? waypoint.rotation : { x: 0, y: 0, z: 0 },
      }));

      setCurrentTour({
        ...tourData,
        waypoints: transformedWaypoints,
      });
      setCurrentWaypointIndex(0);
    } catch (error) {
      console.error('Failed to load VR tour:', error);
    } finally {
      setLoading(false);
    }
  };

  const startTour = (tour?: VRTour) => {
    if (tour) {
      setCurrentTour(tour);
    }
    if (currentTour && currentTour.waypoints.length > 0) {
      setIsActive(true);
      setCurrentWaypointIndex(0);
    }
  };

  const stopTour = () => {
    setIsActive(false);
    setCurrentWaypointIndex(0);
  };

  const nextWaypoint = () => {
    if (!currentTour || !isActive) return;
    
    const nextIndex = currentWaypointIndex + 1;
    if (nextIndex < currentTour.waypoints.length) {
      setCurrentWaypointIndex(nextIndex);
    } else {
      // Tour completed
      setIsActive(false);
      setCurrentWaypointIndex(0);
    }
  };

  const previousWaypoint = () => {
    if (!currentTour || !isActive) return;
    
    const prevIndex = currentWaypointIndex - 1;
    if (prevIndex >= 0) {
      setCurrentWaypointIndex(prevIndex);
    }
  };

  const goToWaypoint = (index: number) => {
    if (!currentTour || !isActive) return;
    
    if (index >= 0 && index < currentTour.waypoints.length) {
      setCurrentWaypointIndex(index);
    }
  };

  // Auto-load tour if tourId provided
  useEffect(() => {
    if (tourId) {
      loadTour(tourId);
    }
  }, [tourId]);

  const currentWaypoint = currentTour?.waypoints[currentWaypointIndex] || null;
  const isFirstWaypoint = currentWaypointIndex === 0;
  const isLastWaypoint = currentTour ? currentWaypointIndex === currentTour.waypoints.length - 1 : false;
  const progress = currentTour ? (currentWaypointIndex + 1) / currentTour.waypoints.length : 0;

  return {
    currentTour,
    currentWaypoint,
    currentWaypointIndex,
    isActive,
    loading,
    isFirstWaypoint,
    isLastWaypoint,
    progress,
    loadTour,
    startTour,
    stopTour,
    nextWaypoint,
    previousWaypoint,
    goToWaypoint,
  };
};