import React, { Suspense, useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { XR, VRButton, ARButton, createXRStore } from '@react-three/xr';
import { Environment, Sky, Plane, OrbitControls } from '@react-three/drei';
import { Physics } from '@react-three/rapier';
import { VREnvironment } from './VREnvironment';
import { VRPlantModel } from './VRPlantModel';
import { VRInfoCard } from './VRInfoCard';
import { VRControllers } from './VRControllers';
import { VRTeleportation } from './VRTeleportation';
import { VRTourGuide } from './VRTourGuide';
import { useWebXR } from '@/hooks/useWebXR';
import { useVRInteraction } from '@/hooks/useVRInteraction';
import { supabase } from '@/integrations/supabase/client';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Loader2, Eye, EyeOff } from 'lucide-react';

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
  const { capabilities, isVRActive, vrError, enterVR, exitVR } = useWebXR();
  const { hoveredObject, selectedObject, clearSelection } = useVRInteraction();
  
  const [plants, setPlants] = useState<Plant[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNonVRMode, setShowNonVRMode] = useState(true); // Default to true for debugging
  const [error, setError] = useState<string | null>(null);

  // Load plants from Supabase
  useEffect(() => {
    console.log('VRGarden: Starting to load plants...');
    const loadPlants = async () => {
      try {
        const { data, error } = await supabase
          .from('plants')
          .select('*')
          .order('name_en');

        if (error) {
          console.error('VRGarden: Error loading plants:', error);
          setError(`Failed to load plants: ${error.message}`);
          return;
        }
        
        console.log('VRGarden: Loaded plants:', data);
        
        // Transform data to match Plant interface
        const transformedPlants = (data || []).map(plant => ({
          ...plant,
          vr_position: typeof plant.vr_position === 'object' ? plant.vr_position : { x: 0, y: 0, z: 0 },
          vr_scale: typeof plant.vr_scale === 'object' ? plant.vr_scale : { x: 1, y: 1, z: 1 },
          vr_rotation: typeof plant.vr_rotation === 'object' ? plant.vr_rotation : { x: 0, y: 0, z: 0 },
        }));
        
        setPlants(transformedPlants);
      } catch (error) {
        console.error('VRGarden: Failed to load plants:', error);
        setError(`Failed to load plants: ${error}`);
      } finally {
        setLoading(false);
        console.log('VRGarden: Loading complete');
      }
    };

    loadPlants();
  }, []);

  console.log('VRGarden: Rendering with', { loading, plantsCount: plants.length, capabilities, showNonVRMode, error });

  if (loading) {
    console.log('VRGarden: Still loading...');
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading Virtual Garden...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center max-w-md px-6">
          <h2 className="text-2xl font-bold mb-4 text-red-600">Error Loading VR Garden</h2>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const VRScene = () => {
    console.log('VRGarden: Rendering VRScene with', plants.length, 'plants');
    try {
      return (
        <Suspense fallback={null}>
          <Environment preset="forest" background />
          <Sky 
            distance={450000} 
            sunPosition={[0, 1, 0]} 
            inclination={0} 
            azimuth={0.25} 
          />
          
          <ambientLight intensity={0.4} />
          <directionalLight 
            position={[10, 10, 5]} 
            intensity={1} 
            castShadow 
            shadow-mapSize-width={2048} 
            shadow-mapSize-height={2048} 
          />

          <Physics>
            <VREnvironment />
            
            {/* Plant models positioned in VR space */}
            {plants.map((plant) => (
              <VRPlantModel
                key={plant.id}
                plant={plant}
                position={plant.vr_position || { x: 0, y: 0, z: 0 }}
                scale={plant.vr_scale || { x: 1, y: 1, z: 1 }}
                rotation={plant.vr_rotation || { x: 0, y: 0, z: 0 }}
                isHovered={hoveredObject?.userData?.plantId === plant.id}
              />
            ))}

            <VRTeleportation />
            <VRControllers />
          </Physics>

          {/* VR UI Components */}
          {selectedObject && (
            <VRInfoCard
              plant={plants.find(p => p.id === selectedObject.userData?.plantId)}
              position={[0, 2, -1]}
              onClose={clearSelection}
            />
          )}

          <VRTourGuide />

          {/* Desktop controls when not in VR */}
          {!isVRActive && <OrbitControls enablePan enableZoom enableRotate />}
        </Suspense>
      );
    } catch (error) {
      console.error('VRGarden: Error in VRScene:', error);
      return null;
    }
  };

  // Add fallback rendering for debugging
  const renderFallback = () => (
    <div className="h-screen bg-gradient-to-b from-green-100 to-green-200 dark:from-green-900 dark:to-green-800 flex items-center justify-center">
      <div className="text-center max-w-md px-6">
        <h2 className="text-2xl font-bold mb-4">VR Garden Debug Mode</h2>
        <p className="text-muted-foreground mb-4">
          Plants loaded: {plants.length}
        </p>
        <p className="text-muted-foreground mb-4">
          WebXR supported: {capabilities.isSupported ? 'Yes' : 'No'}
        </p>
        <p className="text-muted-foreground mb-6">
          VR supported: {capabilities.isVRSupported ? 'Yes' : 'No'}
        </p>
        <Button onClick={() => setShowNonVRMode(true)} size="lg">
          Enable 3D View
        </Button>
      </div>
    </div>
  );

  return (
    <div className="h-screen relative">
      {/* Debug info */}
      <div className="absolute top-4 right-4 z-50 bg-black/80 text-white p-2 rounded text-xs">
        Plants: {plants.length} | WebXR: {capabilities.isSupported ? 'Y' : 'N'} | 3D: {showNonVRMode ? 'Y' : 'N'}
      </div>

      {/* VR/AR Entry UI */}
      <div className="absolute top-4 left-4 z-10 flex gap-4">
        {capabilities.isSupported ? (
          <>
            {capabilities.isVRSupported && (
              <VRButton
                store={store}
                style={{
                  background: 'rgba(0, 0, 0, 0.8)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '12px 24px',
                  fontSize: '16px',
                  cursor: 'pointer',
                }}
              />
            )}
            {capabilities.isARSupported && (
              <ARButton
                store={store}
                style={{
                  background: 'rgba(0, 0, 0, 0.8)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '12px 24px',
                  fontSize: '16px',
                  cursor: 'pointer',
                }}
              />
            )}
          </>
        ) : (
          <Alert className="w-auto">
            <AlertDescription>
              WebXR not supported. Using desktop mode.
            </AlertDescription>
          </Alert>
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowNonVRMode(!showNonVRMode)}
          className="bg-background/80 backdrop-blur"
        >
          {showNonVRMode ? <EyeOff /> : <Eye />}
          {showNonVRMode ? 'Hide' : 'Show'} Desktop View
        </Button>
      </div>

      {/* Error Display */}
      {vrError && (
        <div className="absolute top-16 right-4 z-10">
          <Alert variant="destructive" className="w-auto">
            <AlertDescription>{vrError}</AlertDescription>
          </Alert>
        </div>
      )}

      {/* 3D Canvas */}
      {showNonVRMode ? (
        <Canvas
          shadows
          camera={{ position: [0, 1.6, 5], fov: 75 }}
          style={{ background: '#87CEEB' }}
          onCreated={() => console.log('VRGarden: Canvas created successfully')}
          onError={(error) => console.error('VRGarden: Canvas error:', error)}
        >
          <XR store={store}>
            <VRScene />
          </XR>
        </Canvas>
      ) : (
        renderFallback()
      )}
    </div>
  );
};