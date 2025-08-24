import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { plantsData, additionalPlants } from '@/data/plantsData';
import { Enhanced3DViewer } from '@/components/Enhanced3DViewer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  Heart, 
  Share2, 
  BookOpen, 
  Leaf, 
  MapPin, 
  Beaker, 
  Shield, 
  ExternalLink,
  Camera,
  Bookmark
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

const PlantDetail = () => {
  const { plantId } = useParams<{ plantId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  
  // Find the plant data
  const allPlants = [...plantsData, ...additionalPlants];
  const plant = allPlants.find(p => p.id === plantId);
  
  useEffect(() => {
    if (user && plantId) {
      checkLikeAndBookmarkStatus();
    } else {
      // Fallback to localStorage for non-authenticated users
      const likedPlants = JSON.parse(localStorage.getItem('likedPlants') || '{}');
      const bookmarkedPlants = JSON.parse(localStorage.getItem('bookmarkedPlants') || '{}');
      setIsLiked(likedPlants[plantId] || false);
      setIsBookmarked(bookmarkedPlants[plantId] || false);
    }
  }, [user, plantId]);

  const checkLikeAndBookmarkStatus = async () => {
    if (!user || !plantId) return;

    try {
      const [likeResult, bookmarkResult] = await Promise.all([
        supabase
          .from('user_likes')
          .select('id')
          .eq('user_id', user.id)
          .eq('plant_id', plantId)
          .single(),
        supabase
          .from('user_bookmarks')
          .select('id')
          .eq('user_id', user.id)
          .eq('plant_id', plantId)
          .single()
      ]);

      setIsLiked(!!likeResult.data);
      setIsBookmarked(!!bookmarkResult.data);
    } catch (error) {
      // Errors are expected when no records exist
    }
  };
  
  if (!plant) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Leaf className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">Plant Not Found</h1>
          <p className="text-muted-foreground mb-6">The plant you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/')} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Garden
          </Button>
        </div>
      </div>
    );
  }
  
  const handleLike = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to like plants",
        variant: "destructive",
      });
      return;
    }

    if (loading || !plantId) return;
    setLoading(true);

    try {
      if (isLiked) {
        // Remove like
        await supabase
          .from('user_likes')
          .delete()
          .eq('user_id', user.id)
          .eq('plant_id', plantId);
        
        setIsLiked(false);
        toast({
          title: "Like removed",
          description: "Removed from your favorites",
        });
      } else {
        // Add like
        await supabase
          .from('user_likes')
          .insert({
            user_id: user.id,
            plant_id: plantId,
          });
        
        setIsLiked(true);
        toast({
          title: "Plant liked!",
          description: "Added to your favorites",
        });
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      toast({
        title: "Error",
        description: "Failed to update like status",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBookmark = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to bookmark plants",
        variant: "destructive",
      });
      return;
    }

    if (loading || !plantId) return;
    setLoading(true);

    try {
      if (isBookmarked) {
        // Remove bookmark
        await supabase
          .from('user_bookmarks')
          .delete()
          .eq('user_id', user.id)
          .eq('plant_id', plantId);
        
        setIsBookmarked(false);
        toast({
          title: "Bookmark removed",
          description: "Removed from your bookmarks",
        });
      } else {
        // Add bookmark
        await supabase
          .from('user_bookmarks')
          .insert({
            user_id: user.id,
            plant_id: plantId,
          });
        
        setIsBookmarked(true);
        toast({
          title: "Plant bookmarked!",
          description: "Added to your bookmarks",
        });
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      toast({
        title: "Error",
        description: "Failed to update bookmark status",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleShare = async () => {
    const shareData = {
      title: `${plant.name} - HerbaVerse`,
      text: `Discover ${plant.name} (${plant.scientificName}) and its medicinal properties on HerbaVerse`,
      url: window.location.href,
    };
    
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      await navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied!",
        description: "Plant link copied to clipboard.",
      });
    }
  };
  
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              onClick={() => navigate('/')}
              variant="ghost"
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Garden
            </Button>
            
            <div className="flex items-center gap-2">
              <Button
                onClick={handleShare}
                variant="outline"
                size="sm"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
              
              <Button
                onClick={handleBookmark}
                variant={isBookmarked ? "default" : "outline"}
                size="sm"
                className={isBookmarked ? "bg-blue-500 hover:bg-blue-600 text-white" : ""}
                disabled={loading}
              >
                <Bookmark className={`w-4 h-4 mr-2 ${isBookmarked ? 'fill-current' : ''}`} />
                Bookmark
              </Button>
              
              <Button
                onClick={handleLike}
                variant={isLiked ? "default" : "outline"}
                size="sm"
                className={isLiked ? "bg-red-500 hover:bg-red-600 text-white" : ""}
                disabled={loading}
              >
                <Heart className={`w-4 h-4 mr-2 ${isLiked ? 'fill-current' : ''}`} />
                Like
              </Button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* 3D Viewer */}
          <div className="space-y-4">
            <Enhanced3DViewer plant={plant} />
            
            {/* Plant Images */}
            {'realImages' in plant && plant.realImages && plant.realImages.length > 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Camera className="w-5 h-5" />
                    Real Plant Photos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="aspect-video rounded-lg overflow-hidden">
                    <img
                      src={plant.realImages[0]}
                      alt={plant.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </CardContent>
              </Card>
            ) : plant.image && plant.image !== "/placeholder.svg" && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Camera className="w-5 h-5" />
                    Plant Illustration
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="aspect-video rounded-lg overflow-hidden">
                    <img
                      src={plant.image}
                      alt={plant.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
          
          {/* Plant Info */}
          <div className="space-y-6">
            {/* Basic Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl text-foreground">{plant.name}</CardTitle>
                <p className="text-lg italic text-muted-foreground">{plant.scientificName}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-foreground leading-relaxed">{plant.description}</p>
                
                {/* Uses */}
                <div className="space-y-2">
                  <h4 className="font-semibold text-foreground">Primary Uses:</h4>
                  <div className="flex flex-wrap gap-2">
                    {plant.uses.map((use, index) => (
                      <Badge 
                        key={index} 
                        variant="secondary" 
                        className="bg-secondary/80 text-secondary-foreground"
                      >
                        {use}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardContent className="pt-6 text-center">
                  <Leaf className="w-8 h-8 text-primary mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Medicinal Parts</p>
                  <p className="font-semibold text-foreground">
                    {plant.medicinalParts?.length || 'Various'}
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6 text-center">
                  <MapPin className="w-8 h-8 text-primary mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Origin</p>
                  <p className="font-semibold text-foreground">Traditional</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
        
        {/* Detailed Information Tabs */}
        <Card>
          <CardContent className="p-6">
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-6">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="medicinal">Medicinal</TabsTrigger>
                <TabsTrigger value="cultivation">Cultivation</TabsTrigger>
                <TabsTrigger value="ayurvedic">Ayurvedic</TabsTrigger>
                <TabsTrigger value="safety">Safety</TabsTrigger>
                <TabsTrigger value="references">References</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-4 mt-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                      <MapPin className="w-5 h-5" />
                      Habitat & Distribution
                    </h3>
                    <p className="text-muted-foreground">{plant.habitat}</p>
                  </div>
                  
                  {plant.medicinalParts && (
                    <div>
                      <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                        <Leaf className="w-5 h-5" />
                        Medicinal Parts Used
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {plant.medicinalParts.map((part, index) => (
                          <Badge key={index} variant="outline">{part}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="medicinal" className="space-y-4 mt-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Traditional Uses</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {plant.uses.map((use, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
                          <div className="w-2 h-2 bg-primary rounded-full"></div>
                          <span className="text-foreground">{use}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {plant.preparationMethods && (
                    <div>
                      <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                        <Beaker className="w-5 h-5" />
                        Preparation Methods
                      </h3>
                      <div className="space-y-2">
                        {plant.preparationMethods.map((method, index) => (
                          <div key={index} className="p-3 bg-muted/30 rounded-lg">
                            <span className="text-foreground">{method}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {plant.dosage && (
                    <div>
                      <h3 className="font-semibold text-foreground mb-2">Recommended Dosage</h3>
                      <p className="text-muted-foreground p-3 bg-muted/30 rounded-lg">
                        {plant.dosage}
                      </p>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="cultivation" className="space-y-4 mt-6">
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Growing Conditions</h3>
                  <p className="text-muted-foreground">{plant.cultivation}</p>
                </div>
              </TabsContent>
              
              <TabsContent value="ayurvedic" className="space-y-4 mt-6">
                {'ayurvedicProperties' in plant && plant.ayurvedicProperties ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(plant.ayurvedicProperties).map(([key, value]) => (
                      <div key={key} className="p-4 bg-muted/30 rounded-lg">
                        <h4 className="font-semibold text-foreground capitalize mb-1">{key}</h4>
                        <p className="text-muted-foreground">{String(value)}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">Ayurvedic properties information not available for this plant.</p>
                )}
              </TabsContent>
              
              <TabsContent value="safety" className="space-y-4 mt-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                    <Shield className="w-5 h-5 text-destructive mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-destructive mb-2">Important Safety Information</h3>
                      <p className="text-muted-foreground mb-3">
                        Always consult with a qualified healthcare provider before using any herbal remedies, 
                        especially if you have existing health conditions or are taking medications.
                      </p>
                    </div>
                  </div>
                  
                  {plant.precautions && (
                    <div>
                      <h3 className="font-semibold text-foreground mb-2">Precautions</h3>
                      <div className="space-y-2">
                        {plant.precautions.map((precaution, index) => (
                          <div key={index} className="flex items-start gap-2 p-2">
                            <div className="w-2 h-2 bg-destructive rounded-full mt-2"></div>
                            <span className="text-muted-foreground">{precaution}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="references" className="space-y-4 mt-6">
                {plant.references && plant.references.length > 0 ? (
                  <div className="space-y-3">
                    <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                      <BookOpen className="w-5 h-5" />
                      Scientific References
                    </h3>
                    {plant.references.map((reference, index) => (
                      <div key={index} className="p-4 bg-muted/30 rounded-lg">
                        <div className="flex items-start gap-3">
                          <span className="text-sm font-medium text-primary">{index + 1}.</span>
                          <p className="text-muted-foreground flex-1">{reference}</p>
                          <ExternalLink className="w-4 h-4 text-muted-foreground" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">References information not available for this plant.</p>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        
        {/* Medical Disclaimer */}
        <Card className="mt-8 bg-gradient-botanical text-primary-foreground">
          <CardContent className="p-6 text-center">
            <h3 className="text-xl font-bold mb-3">Medical Disclaimer</h3>
            <p className="text-primary-foreground/90 max-w-3xl mx-auto leading-relaxed">
              The information provided here is for educational purposes only and is not intended to replace professional medical advice. 
              All plant information has been sourced from AYUSH datasets and traditional texts. Always consult with a qualified 
              healthcare provider before using any herbal remedies.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default PlantDetail;