import React, { useEffect, useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { XR, VRButton, ARButton, createXRStore, useXR } from '@react-three/xr';
import { Environment, OrbitControls, Sky } from '@react-three/drei';
import { Physics } from '@react-three/rapier';
import { VREnvironment } from './VREnvironment';
import { VRPlantModel } from './VRPlantModel';
import { VRInfoCard } from './VRInfoCard';
import { VRTeleportation } from './VRTeleportation';
import { VRTourGuide } from './VRTourGuide';
import { VRControllers } from './VRControllers';
import { VR360VideoPlayer } from './VR360VideoPlayer';
import { useWebXR } from '@/hooks/useWebXR';
import { useVRInteraction } from '@/hooks/useVRInteraction';
import { useVRTour } from '@/hooks/useVRTour';
import { useVRVideo } from '@/hooks/useVRVideo';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle, Video, Eye } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

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
  const store = createXRStore();
  const { capabilities, isVRActive, vrError } = useWebXR();
  const { selectedObject } = useVRInteraction();
  const { currentTour, isActive: isTourActive } = useVRTour();
  const { currentVideo, hotspots, loading: videoLoading, error: videoError } = useVRVideo();
  const { language } = useLanguage();
  const [plants, setPlants] = useState<Plant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDebug, setShowDebug] = useState(false);
  const [viewMode, setViewMode] = useState<'video' | '3d'>('video');

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

  // Loading state
  if (loading || videoLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-b from-green-900 to-green-600">
        <div className="text-center text-white">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-lg">Loading VR Garden...</p>
          <p className="text-sm opacity-80">
            {videoLoading ? 'Preparing 360° video experience' : 'Preparing your immersive experience'}
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !currentVideo) {
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

  const VRScene: React.FC = () => {
    const { session } = useXR();
    
    const handleHotspotClick = (hotspot: any) => {
      console.log('Hotspot clicked:', hotspot);
      // Handle hotspot interactions (e.g., show plant info, navigate)
    };
    
    return (
      <>
        {viewMode === 'video' && currentVideo ? (
          <VR360VideoPlayer
            videoUrl={currentVideo.video_url}
            title={language === 'hi' ? currentVideo.title_hi || currentVideo.title_en : currentVideo.title_en}
            description={language === 'hi' ? currentVideo.description_hi || currentVideo.description_en : currentVideo.description_en}
            hotspots={hotspots}
            onHotspotClick={handleHotspotClick}
            autoPlay={!session} // Auto-play for desktop, manual for VR
          />
        ) : (
          <>
            <Environment preset="forest" />
            <Sky sunPosition={[100, 20, 100]} />
            
            <ambientLight intensity={0.6} />
            <directionalLight 
              position={[10, 10, 5]} 
              intensity={1}
              castShadow
              shadow-mapSize-width={2048}
              shadow-mapSize-height={2048}
            />
            
            <Physics gravity={[0, -9.81, 0]}>
              <VREnvironment />
              
              {plants.map((plant) => (
                <VRPlantModel
                  key={plant.id}
                  plant={plant}
                  position={plant.vr_position}
                  scale={plant.vr_scale}
                  rotation={plant.vr_rotation}
                />
              ))}
              
              {session && <VRTeleportation />}
              <VRControllers />
            </Physics>
            
            {selectedObject && (
              <VRInfoCard 
                plant={selectedObject.userData?.plant}
                position={[0, 2, -3]}
                onClose={() => {}}
              />
            )}
            
            {isTourActive && currentTour && (
              <VRTourGuide />
            )}
          </>
        )}
        
        {!session && <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />}
      </>
    );
  };

  return (
    <div className="relative w-full h-screen bg-gradient-to-b from-green-900 to-green-600">
      {/* Debug Info */}
      {showDebug && (
        <div className="absolute top-4 left-4 z-20 bg-black/80 text-white p-4 rounded-lg font-mono text-sm">
          <h3 className="font-bold mb-2">VR Garden Debug</h3>
          <p>Plants loaded: {plants.length}</p>
          <p>Current Video: {currentVideo ? '✓' : '✗'}</p>
          <p>Video Mode: {viewMode}</p>
          <p>WebXR supported: {capabilities.isSupported ? '✓' : '✗'}</p>
          <p>VR supported: {capabilities.isVRSupported ? '✓' : '✗'}</p>
          <p>AR supported: {capabilities.isARSupported ? '✓' : '✗'}</p>
          <p>VR Active: {isVRActive ? '✓' : '✗'}</p>
          {vrError && <p className="text-red-400">Error: {vrError}</p>}
          {videoError && <p className="text-yellow-400">Video Error: {videoError}</p>}
        </div>
      )}

      {/* Mode Toggle */}
      <div className="absolute top-4 right-4 z-20 flex gap-2">
        <Button
          variant={viewMode === 'video' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setViewMode('video')}
          disabled={!currentVideo}
          className="bg-white/20 border-white/40 text-white hover:bg-white/30"
        >
          <Video className="w-4 h-4 mr-1" />
          360° Video
        </Button>
        <Button
          variant={viewMode === '3d' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setViewMode('3d')}
          className="bg-white/20 border-white/40 text-white hover:bg-white/30"
        >
          <Eye className="w-4 h-4 mr-1" />
          3D Garden
        </Button>
      </div>

      {/* VR/AR Entry Buttons */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20 flex gap-4">
        {capabilities.isVRSupported && (
          <VRButton 
            store={store}
            style={{ 
              padding: '12px 24px', 
              fontSize: '16px',
              backgroundColor: '#22c55e',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          />
        )}
        {capabilities.isARSupported && (
          <ARButton 
            store={store}
            style={{ 
              padding: '12px 24px', 
              fontSize: '16px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          />
        )}
        <Button
          variant="outline"
          onClick={() => setShowDebug(!showDebug)}
          className="bg-white/20 text-white border-white/40 hover:bg-white/30"
        >
          Debug: {showDebug ? 'ON' : 'OFF'}
        </Button>
      </div>

      {/* Video Mode Alert */}
      {viewMode === 'video' && !currentVideo && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
          <Alert className="bg-yellow-100 border-yellow-400">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              No 360° video available. Switching to 3D Garden mode.
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* 3D Canvas */}
      <Canvas
        camera={{ 
          position: [0, 1.6, 5], 
          fov: 75,
          near: 0.1,
          far: 1000
        }}
        style={{ background: 'transparent' }}
        gl={{ 
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance'
        }}
      >
        <XR store={store}>
          <Suspense fallback={null}>
            <VRScene />
          </Suspense>
        </XR>
      </Canvas>
    </div>
  );
};