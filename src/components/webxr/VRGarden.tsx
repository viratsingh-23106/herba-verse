import React, { useEffect, useState, Suspense, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Box, Sphere } from '@react-three/drei';
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle, Video, Eye, RotateCcw, ZoomIn, ZoomOut } from 'lucide-react';
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
  const [showVideo, setShowVideo] = useState(true);
  const [show3D, setShow3D] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });
  const videoContainerRef = useRef<HTMLDivElement>(null);
  
  // YouTube video ID extracted from the provided URL
  const youtubeVideoId = 'pwymX2LxnQs';

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

  // VR Controls - Mouse interaction for rotation
  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      if (!showVideo) return;
      setIsDragging(true);
      setLastMousePos({ x: e.clientX, y: e.clientY });
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !showVideo) return;
      
      const deltaX = e.clientX - lastMousePos.x;
      const deltaY = e.clientY - lastMousePos.y;
      
      setRotation(prev => ({
        x: Math.max(-45, Math.min(45, prev.x + deltaY * 0.1)),
        y: prev.y + deltaX * 0.1
      }));
      
      setLastMousePos({ x: e.clientX, y: e.clientY });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    const handleWheel = (e: WheelEvent) => {
      if (!showVideo) return;
      e.preventDefault();
      setZoom(prev => Math.max(0.5, Math.min(2, prev + (e.deltaY > 0 ? -0.1 : 0.1))));
    };

    if (showVideo) {
      document.addEventListener('mousedown', handleMouseDown);
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('wheel', handleWheel, { passive: false });
    }

    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('wheel', handleWheel);
    };
  }, [isDragging, lastMousePos, showVideo]);

  // Fullscreen toggle
  const toggleFullscreen = async () => {
    if (!isFullscreen) {
      try {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
      } catch (error) {
        console.error('Failed to enter fullscreen:', error);
      }
    } else {
      try {
        await document.exitFullscreen();
        setIsFullscreen(false);
      } catch (error) {
        console.error('Failed to exit fullscreen:', error);
      }
    }
  };

  // Reset VR view
  const resetView = () => {
    setRotation({ x: 0, y: 0 });
    setZoom(1);
  };

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
    <div className={`relative w-full ${isFullscreen ? 'h-screen' : 'h-screen'} bg-black overflow-hidden`}>
      {/* Full Screen VR Video Experience */}
      {showVideo && (
        <div 
          ref={videoContainerRef}
          className="absolute inset-0 z-10 cursor-grab active:cursor-grabbing"
          style={{
            transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) scale(${zoom})`,
            transformOrigin: 'center center',
            transition: isDragging ? 'none' : 'transform 0.2s ease-out'
          }}
        >
          <iframe
            src={`https://www.youtube.com/embed/${youtubeVideoId}?autoplay=1&mute=0&controls=1&rel=0&modestbranding=1&fs=0&cc_load_policy=0&iv_load_policy=3&autohide=1&loop=1&playlist=${youtubeVideoId}`}
            title="VR Herbal Garden Tour - Immersive 360° Experience"
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
            allowFullScreen
            style={{
              width: '100vw',
              height: '100vh',
              position: 'absolute',
              top: 0,
              left: 0,
            }}
          />
        </div>
      )}

      {/* VR Controls - Only show when video is active */}
      {showVideo && (
        <div className="absolute top-4 right-4 z-50 flex flex-col gap-2">
          <Button
            onClick={resetView}
            className="bg-black/70 hover:bg-black/90 text-white border border-white/20 backdrop-blur-sm"
            size="sm"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
          <Button
            onClick={() => setZoom(prev => Math.min(2, prev + 0.2))}
            className="bg-black/70 hover:bg-black/90 text-white border border-white/20 backdrop-blur-sm"
            size="sm"
          >
            <ZoomIn className="w-4 h-4" />
          </Button>
          <Button
            onClick={() => setZoom(prev => Math.max(0.5, prev - 0.2))}
            className="bg-black/70 hover:bg-black/90 text-white border border-white/20 backdrop-blur-sm"
            size="sm"
          >
            <ZoomOut className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* VR Instructions */}
      {showVideo && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-50 bg-black/60 text-white px-6 py-3 rounded-lg backdrop-blur-sm text-center max-w-md">
          <p className="text-sm font-semibold mb-1">🌿 VR Garden Experience 🌿</p>
          <p className="text-xs opacity-90">
            Drag to rotate • Scroll to zoom • Use controls to reset view
          </p>
        </div>
      )}

      {/* Toggle Controls - Top Left */}
      <div className="absolute top-4 left-4 z-50 flex gap-2">
        <Button
          onClick={() => setShow3D(!show3D)}
          className="bg-green-600/80 hover:bg-green-700 text-white backdrop-blur-sm"
          size="sm"
        >
          <Eye className="w-4 h-4 mr-2" />
          {show3D ? 'Hide 3D' : '3D View'}
        </Button>
        <Button
          onClick={toggleFullscreen}
          className="bg-blue-600/80 hover:bg-blue-700 text-white backdrop-blur-sm"
          size="sm"
        >
          {isFullscreen ? 'Exit VR' : 'VR Mode'}
        </Button>
      </div>

      {/* Optional 3D Scene Overlay */}
      {show3D && (
        <div className="absolute inset-0 z-30 bg-black/90">
          <div className="absolute top-2 right-2 z-40">
            <button
              onClick={() => setShow3D(false)}
              className="bg-red-600 hover:bg-red-700 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold"
            >
              ✕
            </button>
          </div>
          
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
          
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-center text-white">
            <p className="text-lg font-semibold mb-2">🌿 3D Preview Garden 🌿</p>
            <p className="text-sm opacity-90">Click and drag to explore • Scroll to zoom</p>
          </div>
        </div>
      )}

      {/* Fallback when video is hidden */}
      {!showVideo && !show3D && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-gradient-to-b from-green-900 to-green-600">
          <div className="text-center text-white max-w-md">
            <h2 className="text-2xl font-bold mb-4">🌿 Virtual Herbal Garden</h2>
            <p className="mb-6 opacity-90">Choose your experience mode</p>
            <div className="flex gap-4 justify-center">
              <Button
                onClick={() => setShowVideo(true)}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                <Video className="w-4 h-4 mr-2" />
                VR Tour
              </Button>
              <Button
                onClick={() => setShow3D(true)}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Eye className="w-4 h-4 mr-2" />
                3D Garden
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};