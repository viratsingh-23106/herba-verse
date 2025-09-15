import React, { useEffect, useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Box, Sphere } from '@react-three/drei';
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle, Video, Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Plant {
  id: string;
  name_en: string;
  scientific_name?: string;
  description_en?: string;
  uses_en?: string[];
  image_url?: string;
  color?: string;
  glb_url?: string;
  vr_position?: any;
  vr_scale?: any;
  vr_rotation?: any;
}

export const VRGarden: React.FC = () => {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load plants from Supabase
  useEffect(() => {
    const loadPlants = async () => {
      try {
        const { data, error } = await supabase
          .from('plants')
          .select('*')
          .order('name_en');

        if (error) throw error;
        
        const transformedPlants = (data || []).map(plant => ({
          ...plant,
          vr_position: typeof plant.vr_position === 'object' ? plant.vr_position : { x: 0, y: 0, z: 0 },
          vr_scale: typeof plant.vr_scale === 'object' ? plant.vr_scale : { x: 1, y: 1, z: 1 },
          vr_rotation: typeof plant.vr_rotation === 'object' ? plant.vr_rotation : { x: 0, y: 0, z: 0 },
        }));
        
        setPlants(transformedPlants);
      } catch (error) {
        console.error('Failed to load plants:', error);
        setError(error instanceof Error ? error.message : 'Failed to load plants');
      } finally {
        setLoading(false);
      }
    };

    loadPlants();
  }, []);

  // Simple 3D Scene Component
  const SimpleGardenScene: React.FC = () => {
    return (
      <>
        {/* Basic lighting */}
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        
        {/* Ground */}
        <Box args={[20, 0.2, 20]} position={[0, -1, 0]}>
          <meshStandardMaterial color="#4ade80" />
        </Box>
        
        {/* Simple plant representations */}
        <Sphere args={[0.5]} position={[-3, 0, -2]}>
          <meshStandardMaterial color="#22c55e" />
        </Sphere>
        
        <Box args={[0.5, 1, 0.5]} position={[0, 0, -3]}>
          <meshStandardMaterial color="#8b5cf6" />
        </Box>
        
        <Sphere args={[0.3]} position={[3, 0.5, -2]}>
          <meshStandardMaterial color="#ef4444" />
        </Sphere>
        
        <Box args={[0.3, 0.8, 0.3]} position={[-2, 0.4, 2]}>
          <meshStandardMaterial color="#f59e0b" />
        </Box>
        
        <Sphere args={[0.4]} position={[2, 0, 1]}>
          <meshStandardMaterial color="#06b6d4" />
        </Sphere>
        
        {/* Camera controls */}
        <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
      </>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-b from-green-900 to-green-600">
        <div className="text-center text-white">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-lg">Loading VR Garden...</p>
          <p className="text-sm opacity-80">Preparing your immersive experience</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-b from-red-900 to-red-600">
        <div className="text-center text-white max-w-md">
          <AlertCircle className="w-12 h-12 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Failed to Load VR Garden</h2>
          <p className="mb-4 opacity-90">{error}</p>
          <Button 
            onClick={() => window.location.reload()} 
            variant="outline"
            className="text-white border-white hover:bg-white hover:text-red-600"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen bg-gradient-to-b from-green-900 to-green-600">
      {/* Simple Status Display */}
      <div className="absolute top-4 left-4 z-20 bg-black/80 text-white p-4 rounded-lg">
        <h3 className="font-bold mb-2">Simple VR Garden</h3>
        <p>Plants loaded: {plants.length}</p>
        <p>Status: ✓ Working</p>
      </div>

      {/* 3D Canvas */}
      <Canvas
        camera={{ 
          position: [0, 2, 8], 
          fov: 75,
        }}
        style={{ 
          width: '100%', 
          height: '100%',
          background: 'linear-gradient(to bottom, #059669, #065f46)'
        }}
      >
        <Suspense fallback={null}>
          <SimpleGardenScene />
        </Suspense>
      </Canvas>
      
      {/* Instructions */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20 text-center text-white">
        <p className="text-lg font-semibold mb-2">🌿 Virtual Herbal Garden 🌿</p>
        <p className="text-sm opacity-90">Click and drag to explore • Scroll to zoom</p>
      </div>
    </div>
  );
};