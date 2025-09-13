import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, ArrowLeft, Play, Clock, Trophy, Map } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';

interface TourWaypoint {
  id: string;
  plant_id: string;
  order_index: number;
  title_en: string;
  title_hi?: string;
  description_en?: string;
  description_hi?: string;
  position: any;
}

interface VirtualTour {
  id: string;
  title_en: string;
  title_hi?: string;
  description_en?: string;
  description_hi?: string;
  theme: string;
  difficulty_level: number;
  estimated_duration: number;
  cover_image_url?: string;
  is_active: boolean;
  vr_enabled: boolean;
  environment_settings: any;
  starting_position: any;
}

const TourDetail: React.FC = () => {
  const { tourId } = useParams<{ tourId: string }>();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  
  const [tour, setTour] = useState<VirtualTour | null>(null);
  const [waypoints, setWaypoints] = useState<TourWaypoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tourId) return;

    const loadTourData = async () => {
      try {
        // Load tour details
        const { data: tourData, error: tourError } = await supabase
          .from('virtual_tours')
          .select('*')
          .eq('id', tourId)
          .eq('is_active', true)
          .single();

        if (tourError) throw tourError;

        // Load waypoints
        const { data: waypointsData, error: waypointsError } = await supabase
          .from('tour_waypoints')
          .select('*')
          .eq('tour_id', tourId)
          .order('order_index');

        if (waypointsError) throw waypointsError;

        setTour(tourData);
        setWaypoints(waypointsData || []);
      } catch (error) {
        console.error('Error loading tour:', error);
        toast.error('Failed to load tour details');
      } finally {
        setLoading(false);
      }
    };

    loadTourData();
  }, [tourId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background pt-16 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading tour details...</p>
        </div>
      </div>
    );
  }

  if (!tour) {
    return (
      <div className="min-h-screen bg-background pt-16 flex items-center justify-center">
        <div className="text-center max-w-md px-6">
          <h2 className="text-2xl font-bold mb-4">Tour Not Found</h2>
          <p className="text-muted-foreground mb-6">
            The requested tour could not be found or is no longer available.
          </p>
          <Button onClick={() => navigate('/tours')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Tours
          </Button>
        </div>
      </div>
    );
  }

  const startTour = () => {
    if (tour.vr_enabled) {
      navigate('/vr-garden', { state: { tourId: tour.id } });
    } else {
      toast.info('VR tour feature coming soon!');
    }
  };

  const difficultyLabels = {
    1: 'Beginner',
    2: 'Intermediate', 
    3: 'Advanced'
  };

  return (
    <div className="min-h-screen bg-background pt-16">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            onClick={() => navigate('/tours')}
            className="shrink-0"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Tours
          </Button>
          
          <div className="flex-1">
            <h1 className="text-3xl font-bold">
              {language === 'hi' && tour.title_hi ? tour.title_hi : tour.title_en}
            </h1>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="secondary">{tour.theme}</Badge>
              <Badge variant="outline">
                <Trophy className="w-3 h-3 mr-1" />
                {difficultyLabels[tour.difficulty_level as keyof typeof difficultyLabels]}
              </Badge>
              <Badge variant="outline">
                <Clock className="w-3 h-3 mr-1" />
                {tour.estimated_duration} min
              </Badge>
              {tour.vr_enabled && (
                <Badge className="bg-gradient-garden text-white">
                  VR Ready
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Tour Image and Description */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div>
            <img
              src={tour.cover_image_url || '/placeholder.svg'}
              alt={tour.title_en}
              className="w-full h-64 object-cover rounded-lg shadow-md"
            />
            
            <div className="mt-6">
              <Button 
                onClick={startTour}
                size="lg" 
                className="w-full bg-gradient-garden hover:opacity-90"
              >
                <Play className="w-5 h-5 mr-2" />
                Start VR Tour
              </Button>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">About This Tour</h2>
            <p className="text-muted-foreground leading-relaxed">
              {language === 'hi' && tour.description_hi ? tour.description_hi : tour.description_en}
            </p>

            <div className="mt-6 space-y-4">
              <div className="flex items-center gap-2">
                <Map className="w-5 h-5 text-primary" />
                <span className="font-medium">{waypoints.length} Stops</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                <span className="font-medium">~{tour.estimated_duration} minutes</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-primary" />
                <span className="font-medium">
                  {difficultyLabels[tour.difficulty_level as keyof typeof difficultyLabels]} Level
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tour Waypoints */}
        <div>
          <h2 className="text-xl font-semibold mb-6">Tour Stops</h2>
          <div className="space-y-4">
            {waypoints.map((waypoint, index) => (
              <Card key={waypoint.id} className="shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    <span>
                      {language === 'hi' && waypoint.title_hi ? waypoint.title_hi : waypoint.title_en}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    {language === 'hi' && waypoint.description_hi 
                      ? waypoint.description_hi 
                      : waypoint.description_en}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TourDetail;