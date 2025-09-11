import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Heart, Share2, BookOpen, Leaf, ThumbsUp, Bookmark } from 'lucide-react';
import { useState, Suspense, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

// Simple 3D Plant Model Component
function PlantModel({ color = '#22c55e' }: { color?: string }) {
  return (
    <group>
      {/* Stem */}
      <mesh position={[0, -1, 0]}>
        <cylinderGeometry args={[0.05, 0.1, 2]} />
        <meshLambertMaterial color="#8b5a3c" />
      </mesh>
      
      {/* Leaves */}
      {Array.from({ length: 6 }).map((_, i) => (
        <mesh
          key={i}
          position={[
            Math.sin((i / 6) * Math.PI * 2) * 0.5,
            Math.cos(i * 0.5) * 0.5,
            Math.cos((i / 6) * Math.PI * 2) * 0.5
          ]}
          rotation={[
            Math.random() * 0.5,
            (i / 6) * Math.PI * 2,
            Math.random() * 0.3
          ]}
        >
          <planeGeometry args={[0.8, 1.2]} />
          <meshLambertMaterial color={color} side={2} />
        </mesh>
      ))}
      
      {/* Flowers/Berries */}
      {Array.from({ length: 3 }).map((_, i) => (
        <mesh
          key={i}
          position={[
            Math.sin((i / 3) * Math.PI * 2) * 0.3,
            0.8 + i * 0.2,
            Math.cos((i / 3) * Math.PI * 2) * 0.3
          ]}
        >
          <sphereGeometry args={[0.1]} />
          <meshLambertMaterial color="#ff6b6b" />
        </mesh>
      ))}
    </group>
  );
}

function PlantLoader() {
  return (
    <div className="w-full h-full flex items-center justify-center bg-gradient-botanical rounded-lg">
      <div className="animate-pulse">
        <Leaf className="w-8 h-8 text-primary-foreground" />
      </div>
    </div>
  );
}

interface PlantCard3DProps {
  plant: {
    id: string;
    name: string;
    scientificName: string;
    description: string;
    uses: string[];
    image: string;
    color?: string;
  };
  onBookmark?: (id: string) => void;
  onShare?: (id: string) => void;
  onLearnMore?: (id: string) => void;
}

export function PlantCard3D({ plant, onBookmark, onShare, onLearnMore }: PlantCard3DProps) {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      checkBookmarkAndLikeStatus();
    } else {
      // Fallback to localStorage for non-authenticated users
      const bookmarks = JSON.parse(localStorage.getItem('bookmarkedPlants') || '[]');
      setIsBookmarked(bookmarks.includes(plant.id));
    }
  }, [plant.id, user]);

  const checkBookmarkAndLikeStatus = async () => {
    if (!user) return;
    
    try {
      // Check bookmark status
      const { data: bookmarkData } = await supabase
        .from('user_bookmarks')
        .select('id')
        .eq('user_id', user.id)
        .eq('plant_id', plant.id)
        .single();
      
      setIsBookmarked(!!bookmarkData);

      // Check like status
      const { data: likeData } = await supabase
        .from('user_likes')
        .select('id')
        .eq('user_id', user.id)
        .eq('plant_id', plant.id)
        .single();
      
      setIsLiked(!!likeData);
    } catch (error) {
      // Errors are expected when no records exist
      console.log('Status check completed');
    }
  };

  const handleBookmark = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to bookmark plants.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      if (isBookmarked) {
        // Remove bookmark
        await supabase
          .from('user_bookmarks')
          .delete()
          .eq('user_id', user.id)
          .eq('plant_id', plant.id);
        
        setIsBookmarked(false);
        toast({
          title: "Bookmark Removed",
          description: "Plant removed from bookmarks.",
        });
      } else {
        // Add bookmark
        await supabase
          .from('user_bookmarks')
          .insert({
            user_id: user.id,
            plant_id: plant.id,
          });
        
        setIsBookmarked(true);
        toast({
          title: "Plant Bookmarked",
          description: "Plant added to your bookmarks.",
        });
      }
      
      onBookmark?.(plant.id);
    } catch (error) {
      console.error('Error updating bookmark:', error);
      toast({
        title: "Error",
        description: "Failed to update bookmark. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to like plants.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      if (isLiked) {
        // Remove like
        await supabase
          .from('user_likes')
          .delete()
          .eq('user_id', user.id)
          .eq('plant_id', plant.id);
        
        setIsLiked(false);
        toast({
          title: "Like Removed",
          description: "Plant removed from your likes.",
        });
      } else {
        // Add like
        await supabase
          .from('user_likes')
          .insert({
            user_id: user.id,
            plant_id: plant.id,
          });
        
        setIsLiked(true);
        toast({
          title: "Plant Liked",
          description: "Plant added to your likes.",
        });
      }
    } catch (error) {
      console.error('Error updating like:', error);
      toast({
        title: "Error",
        description: "Failed to update like. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="group overflow-hidden shadow-botanical hover:shadow-garden transition-all duration-500 hover:-translate-y-2 bg-card border-border/50">
      {/* 3D Plant Display */}
      <div className="h-64 relative overflow-hidden bg-gradient-botanical">
        <Canvas camera={{ position: [0, 0, 3], fov: 50 }}>
          <Environment preset="sunset" />
          <ambientLight intensity={0.4} />
          <directionalLight position={[10, 10, 10]} intensity={0.8} />
          <pointLight position={[-10, -10, -10]} intensity={0.3} />
          
          <Suspense fallback={null}>
            <PlantModel color={plant.color} />
            <OrbitControls
              enableZoom={true}
              enablePan={false}
              enableRotate={true}
              autoRotate
              autoRotateSpeed={0.8}
              minDistance={2}
              maxDistance={6}
            />
          </Suspense>
        </Canvas>
        
        {/* Overlay actions - Always visible */}
        <div className="absolute top-4 right-4 flex gap-2 z-[60]">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => onShare?.(plant.id)}
            className="bg-background/90 backdrop-blur hover:bg-background shadow-lg"
          >
            <Share2 className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant={isLiked ? "default" : "secondary"}
            onClick={handleLike}
            disabled={loading}
            className={`backdrop-blur shadow-lg ${
              isLiked 
                ? 'bg-red-500 hover:bg-red-600 text-white' 
                : 'bg-background/90 hover:bg-background'
            }`}
          >
            <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
          </Button>
          <Button
            size="sm"
            variant={isBookmarked ? "default" : "secondary"}
            onClick={handleBookmark}
            disabled={loading}
            className={`backdrop-blur shadow-lg ${
              isBookmarked 
                ? 'bg-blue-500 hover:bg-blue-600 text-white' 
                : 'bg-background/90 hover:bg-background'
            }`}
          >
            <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
          </Button>
        </div>
        
        {/* Loading fallback overlay */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-0">
          <PlantLoader />
        </div>
      </div>
      
      {/* Plant Information */}
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
              {plant.name}
            </CardTitle>
            <CardDescription className="text-sm italic text-muted-foreground">
              {plant.scientificName}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground line-clamp-3">
          {plant.description}
        </p>
        
        {/* Uses badges */}
        <div className="flex flex-wrap gap-1">
          {plant.uses.slice(0, 3).map((use, index) => (
            <Badge 
              key={index} 
              variant="secondary" 
              className="text-xs bg-secondary/80 text-secondary-foreground"
            >
              {use}
            </Badge>
          ))}
          {plant.uses.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{plant.uses.length - 3} more
            </Badge>
          )}
        </div>
        
        <Button 
          onClick={() => onLearnMore?.(plant.id)}
          className="w-full bg-gradient-botanical hover:bg-gradient-garden border-0 text-primary-foreground font-medium"
        >
          <BookOpen className="w-4 h-4 mr-2" />
          Learn More
        </Button>
      </CardContent>
    </Card>
  );
}