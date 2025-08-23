import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { PlantCard3D } from '@/components/PlantCard3D';
import { plantsData, additionalPlants } from '@/data/plantsData';
import { Loader2, BookmarkX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export default function Bookmarks() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [bookmarkedPlants, setBookmarkedPlants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const allPlants = [...plantsData, ...additionalPlants];

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    
    fetchBookmarks();
  }, [user, navigate]);

  const fetchBookmarks = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data: bookmarks, error } = await supabase
        .from('user_bookmarks')
        .select('plant_id')
        .eq('user_id', user.id);

      if (error) throw error;

      // Filter plants that are bookmarked
      const bookmarkedPlantIds = bookmarks?.map(b => b.plant_id) || [];
      const filteredPlants = allPlants.filter(plant => 
        bookmarkedPlantIds.includes(plant.id)
      );

      setBookmarkedPlants(filteredPlants);
    } catch (error) {
      console.error('Error fetching bookmarks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookmarkUpdate = () => {
    // Refresh the bookmarks list when a plant is unbookmarked
    fetchBookmarks();
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
              {t('navigation.bookmarks')}
            </h1>
            <p className="text-lg text-muted-foreground">
              {t('bookmarks.description')}
            </p>
          </div>

          {bookmarkedPlants.length === 0 ? (
            <div className="text-center py-12">
              <BookmarkX className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">
                {t('bookmarks.empty.title')}
              </h3>
              <p className="text-muted-foreground mb-6">
                {t('bookmarks.empty.description')}
              </p>
              <Button onClick={() => navigate('/')} variant="default">
                {t('bookmarks.empty.action')}
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {bookmarkedPlants.map((plant) => (
                <PlantCard3D
                  key={plant.id}
                  plant={plant}
                  onBookmark={handleBookmarkUpdate}
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