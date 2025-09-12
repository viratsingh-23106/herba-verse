import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { 
  Map, 
  Play, 
  Clock, 
  Users, 
  CheckCircle, 
  BarChart3,
  Leaf,
  Heart,
  Shield,
  Wind
} from 'lucide-react';

interface Tour {
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
  created_at: string;
}

interface TourProgress {
  id: string;
  tour_id: string;
  current_stop: number;
  completed_stops: number[];
  progress_percentage: number;
  completed_at?: string;
  started_at: string;
}

const VirtualTours = () => {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [tours, setTours] = useState<Tour[]>([]);
  const [userProgress, setUserProgress] = useState<{ [key: string]: TourProgress }>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTours();
    if (user) {
      loadUserProgress();
    }
  }, [user]);

  const loadTours = async () => {
    try {
      const { data, error } = await supabase
        .from('virtual_tours')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTours(data || []);
    } catch (error) {
      console.error('Error loading tours:', error);
      toast({
        title: t('common.error'),
        description: 'Failed to load tours',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadUserProgress = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_tour_progress')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      
      const progressMap = (data || []).reduce((acc, progress) => {
        acc[progress.tour_id] = progress;
        return acc;
      }, {} as { [key: string]: TourProgress });
      
      setUserProgress(progressMap);
    } catch (error) {
      console.error('Error loading user progress:', error);
    }
  };

  const startTour = async (tour: Tour) => {
    if (!user) {
      toast({
        title: t('auth.authRequired'),
        description: t('auth.signInToAccess'),
        action: (
          <Button onClick={() => navigate('/auth')} variant="outline" size="sm">
            Sign In
          </Button>
        ),
      });
      return;
    }

    try {
      // Check if tour already started
      const existingProgress = userProgress[tour.id];
      
      if (!existingProgress) {
        // Create new progress entry
        const { error } = await supabase
          .from('user_tour_progress')
          .insert([{
            tour_id: tour.id,
            user_id: user.id,
            current_stop: 0,
            completed_stops: [],
            progress_percentage: 0
          }]);

        if (error) throw error;
        
        toast({
          title: 'Tour Started!',
          description: `Welcome to ${getTourTitle(tour)}`,
        });
      }

      // Navigate to tour detail page (you'll need to create this)
      navigate(`/tours/${tour.id}`);
    } catch (error) {
      console.error('Error starting tour:', error);
      toast({
        title: t('common.error'),
        description: 'Failed to start tour',
        variant: 'destructive',
      });
    }
  };

  const getTourTitle = (tour: Tour) => {
    return language === 'hi' && tour.title_hi ? tour.title_hi : tour.title_en;
  };

  const getTourDescription = (tour: Tour) => {
    return language === 'hi' && tour.description_hi ? tour.description_hi : tour.description_en;
  };

  const getDifficultyLabel = (level: number) => {
    switch (level) {
      case 1: return 'Beginner';
      case 2: return 'Intermediate';
      case 3: return 'Advanced';
      default: return 'Unknown';
    }
  };

  const getThemeIcon = (theme: string) => {
    switch (theme.toLowerCase()) {
      case 'digestive': return Heart;
      case 'immunity': return Shield;
      case 'skin-care': return Leaf;
      case 'respiratory': return Wind;
      default: return Map;
    }
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background pt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center">
            <div className="text-lg">{t('common.loading')}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-16">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-gradient-botanical rounded-full flex items-center justify-center">
              <Map className="w-6 h-6 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4">
            {t('tours.title')}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Explore curated collections of medicinal plants through immersive guided experiences
          </p>
        </div>

        {/* Tours Grid */}
        {tours.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tours.map((tour) => {
              const progress = userProgress[tour.id];
              const isCompleted = progress?.completed_at;
              const isStarted = progress && !isCompleted;
              const ThemeIcon = getThemeIcon(tour.theme);

              return (
                <Card key={tour.id} className="hover:shadow-lg transition-shadow overflow-hidden">
                  {/* Tour Image/Header */}
                  <div className="h-48 bg-gradient-botanical relative overflow-hidden">
                    <div className="absolute inset-0 bg-black/20" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="flex items-center gap-2 text-white mb-2">
                        <ThemeIcon className="w-5 h-5" />
                        <span className="text-sm font-medium capitalize">{tour.theme}</span>
                      </div>
                      <h3 className="text-xl font-bold text-white line-clamp-2">
                        {getTourTitle(tour)}
                      </h3>
                    </div>
                    
                    {/* Status Badge */}
                    {isCompleted && (
                      <div className="absolute top-4 right-4">
                        <Badge className="bg-green-500 text-white">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          {t('tours.completed')}
                        </Badge>
                      </div>
                    )}
                  </div>

                  <CardContent className="p-6">
                    {/* Description */}
                    <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                      {getTourDescription(tour)}
                    </p>

                    {/* Tour Details */}
                    <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {formatDuration(tour.estimated_duration)}
                      </div>
                      <div className="flex items-center gap-1">
                        <BarChart3 className="w-4 h-4" />
                        {getDifficultyLabel(tour.difficulty_level)}
                      </div>
                    </div>

                    {/* Progress Bar (if started) */}
                    {progress && !isCompleted && (
                      <div className="mb-4">
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-muted-foreground">{t('tours.progress')}</span>
                          <span className="font-medium">{Math.round(progress.progress_percentage)}%</span>
                        </div>
                        <Progress value={progress.progress_percentage} className="h-2" />
                      </div>
                    )}

                    {/* Action Button */}
                    <Button 
                      onClick={() => startTour(tour)}
                      className="w-full"
                      variant={isCompleted ? "outline" : "default"}
                    >
                      {isCompleted ? (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          View Again
                        </>
                      ) : isStarted ? (
                        <>
                          <Play className="w-4 h-4 mr-2" />
                          {t('tours.continueTour')}
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 mr-2" />
                          {t('tours.startTour')}
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Map className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              {t('tours.noTours')}
            </h3>
            <p className="text-muted-foreground">
              Check back soon for new virtual garden tours
            </p>
          </div>
        )}

        {/* Educational Footer */}
        <div className="mt-16 text-center p-8 bg-gradient-botanical rounded-xl text-primary-foreground">
          <h3 className="text-2xl font-bold mb-4">Interactive Learning Experience</h3>
          <p className="text-primary-foreground/90 max-w-3xl mx-auto leading-relaxed">
            Our virtual tours combine traditional knowledge with modern technology to provide immersive 
            learning experiences about medicinal plants and their therapeutic applications.
          </p>
        </div>
      </div>
    </div>
  );
};

export default VirtualTours;