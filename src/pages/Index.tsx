import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { HeroSection } from '@/components/HeroSection';
import { SearchFilters } from '@/components/SearchFilters';
import { PlantCard3D } from '@/components/PlantCard3D';
import { plantsData, additionalPlants } from '@/data/plantsData';
import { Button } from '@/components/ui/button';
import { ArrowUp, Leaf } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';

const Index = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const plantsRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const { t } = useLanguage();

  // Combine demo plants with additional ones
  const allPlants = [...plantsData, ...additionalPlants];

  // Filter plants based on search and filters
  const filteredPlants = allPlants.filter(plant => {
    const matchesSearch = !searchQuery || 
      plant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plant.scientificName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plant.uses.some(use => use.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesFilters = selectedFilters.length === 0 ||
      selectedFilters.some(filter => 
        plant.uses.includes(filter) ||
        (plant.medicinalParts && plant.medicinalParts.includes(filter)) ||
        (plant.preparationMethods && plant.preparationMethods.includes(filter))
      );

    return matchesSearch && matchesFilters;
  });

  const scrollToPlants = () => {
    plantsRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBookmark = async (plantId: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to bookmark plants",
        action: (
          <Button onClick={() => navigate('/auth')} variant="outline" size="sm">
            Sign In
          </Button>
        ),
      });
      return;
    }

    try {
      // Check if already bookmarked
      const { data: existingBookmark } = await supabase
        .from('user_bookmarks')
        .select('id')
        .eq('user_id', user.id)
        .eq('plant_id', plantId)
        .single();

      if (existingBookmark) {
        // Remove bookmark
        await supabase
          .from('user_bookmarks')
          .delete()
          .eq('user_id', user.id)
          .eq('plant_id', plantId);
        
        toast({
          title: "Bookmark removed",
          description: "Plant removed from your bookmarks",
        });
      } else {
        // Add bookmark
        await supabase
          .from('user_bookmarks')
          .insert({
            user_id: user.id,
            plant_id: plantId
          });
        
        toast({
          title: "Plant bookmarked!",
          description: "Added to your personal collection",
        });
      }
    } catch (error) {
      console.error('Bookmark error:', error);
      toast({
        title: "Error",
        description: "Failed to update bookmark. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleShare = async (plantId: string) => {
    const plant = allPlants.find(p => p.id === plantId);
    const shareUrl = `${window.location.origin}/plant/${plantId}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${plant?.name} - HerbaVerse`,
          text: `Discover ${plant?.name} and its medicinal properties on HerbaVerse`,
          url: shareUrl,
        });
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      await navigator.clipboard.writeText(shareUrl);
      toast({
        title: "Link copied!",
        description: "Plant link copied to clipboard.",
      });
    }
  };

  const handleLearnMore = (plantId: string) => {
    navigate(`/plant/${plantId}`);
  };

  // Handle scroll for show/hide scroll-to-top button
  window.addEventListener('scroll', () => {
    setShowScrollTop(window.scrollY > 500);
  });

  return (
    <div className="min-h-screen bg-background pt-16">
      {/* Hero Section */}
      <HeroSection 
        onExplore={scrollToPlants}
        onSearch={scrollToPlants}
      />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-16" ref={plantsRef}>
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-gradient-botanical rounded-full flex items-center justify-center">
              <Leaf className="w-6 h-6 text-primary-foreground" />
            </div>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {t('common.welcome')} - Explore Medicinal Plants
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover the healing power of traditional herbal medicine through our interactive 3D plant collection
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-12">
          <SearchFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedFilters={selectedFilters}
            onFilterChange={setSelectedFilters}
            onClearFilters={() => setSelectedFilters([])}
          />
        </div>

        {/* Results Summary */}
        <div className="mb-8">
          <p className="text-muted-foreground">
            Showing <span className="font-semibold text-foreground">{filteredPlants.length}</span> plants
            {searchQuery && (
              <span> for "<span className="font-semibold text-primary">{searchQuery}</span>"</span>
            )}
            {selectedFilters.length > 0 && (
              <span> with <span className="font-semibold text-primary">{selectedFilters.length}</span> active filters</span>
            )}
          </p>
        </div>

        {/* Plants Grid */}
        {filteredPlants.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredPlants.map((plant) => (
              <PlantCard3D
                key={plant.id}
                plant={plant}
                onBookmark={handleBookmark}
                onShare={handleShare}
                onLearnMore={handleLearnMore}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Leaf className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">No plants found</h3>
            <p className="text-muted-foreground mb-6">
              Try adjusting your search terms or clearing some filters
            </p>
            <Button
              onClick={() => {
                setSearchQuery('');
                setSelectedFilters([]);
              }}
              variant="outline"
            >
              Clear All Filters
            </Button>
          </div>
        )}

        {/* Educational Footer */}
        <div className="mt-16 text-center p-8 bg-gradient-botanical rounded-xl text-primary-foreground">
          <h3 className="text-2xl font-bold mb-4">Important Medical Disclaimer</h3>
          <p className="text-primary-foreground/90 max-w-3xl mx-auto leading-relaxed">
            The information provided here is for educational purposes only and is not intended to replace professional medical advice. 
            All plant information has been sourced from AYUSH datasets and traditional texts. Always consult with a qualified 
            healthcare provider before using any herbal remedies, especially if you have existing health conditions or are taking medications.
          </p>
        </div>
      </main>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <Button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-50 rounded-full w-12 h-12 shadow-botanical"
          variant="garden"
          size="icon"
        >
          <ArrowUp className="w-5 h-5" />
        </Button>
      )}
    </div>
  );
};

export default Index;