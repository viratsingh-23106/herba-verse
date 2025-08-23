import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { PlantCard3D } from '@/components/PlantCard3D';
import { plantsData, additionalPlants } from '@/data/plantsData';
import { Loader2, ThumbsDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export default function Likes() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [likedPlants, setLikedPlants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const allPlants = [...plantsData, ...additionalPlants];

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    
    fetchLikes();
  }, [user, navigate]);

  const fetchLikes = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data: likes, error } = await supabase
        .from('user_likes')
        .select('plant_id')
        .eq('user_id', user.id);

      if (error) throw error;

      // Filter plants that are liked
      const likedPlantIds = likes?.map(l => l.plant_id) || [];
      const filteredPlants = allPlants.filter(plant => 
        likedPlantIds.includes(plant.id)
      );

      setLikedPlants(filteredPlants);
    } catch (error) {
      console.error('Error fetching likes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLikeUpdate = () => {
    // Refresh the likes list when a plant is unliked
    fetchLikes();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-secondary/20 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-secondary/20">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              {t('navigation.likes')}
            </h1>
            <p className="text-lg text-muted-foreground">
              {t('likes.description')}
            </p>
          </div>

          {likedPlants.length === 0 ? (
            <div className="text-center py-12">
              <ThumbsDown className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">
                {t('likes.empty.title')}
              </h3>
              <p className="text-muted-foreground mb-6">
                {t('likes.empty.description')}
              </p>
              <Button onClick={() => navigate('/')} variant="default">
                {t('likes.empty.action')}
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {likedPlants.map((plant) => (
                <PlantCard3D
                  key={plant.id}
                  plant={plant}
                  onBookmark={handleLikeUpdate}
                  onShare={(id) => console.log('Share plant:', id)}
                  onLearnMore={(id) => navigate(`/plant/${id}`)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}