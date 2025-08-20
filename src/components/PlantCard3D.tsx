import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Heart, Share2, BookOpen, Leaf } from 'lucide-react';
import { useState, Suspense, useEffect } from 'react';

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

  useEffect(() => {
    // Check if plant is bookmarked on component mount
    const bookmarks = JSON.parse(localStorage.getItem('bookmarkedPlants') || '[]');
    setIsBookmarked(bookmarks.includes(plant.id));
  }, [plant.id]);

  const handleBookmark = () => {
    const newBookmarkState = !isBookmarked;
    setIsBookmarked(newBookmarkState);
    
    // Update localStorage
    const bookmarks = JSON.parse(localStorage.getItem('bookmarkedPlants') || '[]');
    if (newBookmarkState) {
      if (!bookmarks.includes(plant.id)) {
        bookmarks.push(plant.id);
      }
    } else {
      const index = bookmarks.indexOf(plant.id);
      if (index > -1) {
        bookmarks.splice(index, 1);
      }
    }
    localStorage.setItem('bookmarkedPlants', JSON.stringify(bookmarks));
    
    onBookmark?.(plant.id);
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
        
        {/* Overlay actions */}
        <div className="absolute top-4 right-4 flex gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => onShare?.(plant.id)}
            className="opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 backdrop-blur"
          >
            <Share2 className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant={isBookmarked ? "default" : "secondary"}
            onClick={handleBookmark}
            className="opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 backdrop-blur"
          >
            <Heart className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
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