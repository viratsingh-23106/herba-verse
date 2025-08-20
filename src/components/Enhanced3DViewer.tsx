import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  RotateCcw, 
  ZoomIn, 
  ZoomOut, 
  Eye, 
  Leaf, 
  Flower, 
  TreePine,
  Maximize2
} from 'lucide-react';
import { useState, Suspense, useRef } from 'react';
import { Plant } from '@/data/plantsData';

// Enhanced 3D Plant Model with more detail
function Enhanced3DPlantModel({ 
  color = '#22c55e', 
  viewMode = 'full',
  animate = true 
}: { 
  color?: string; 
  viewMode?: 'full' | 'leaves' | 'roots' | 'flowers';
  animate?: boolean;
}) {
  return (
    <group>
      {/* Main Stem */}
      {(viewMode === 'full' || viewMode === 'roots') && (
        <mesh position={[0, -1, 0]}>
          <cylinderGeometry args={[0.08, 0.12, 2.5]} />
          <meshStandardMaterial color="#8b5a3c" roughness={0.8} />
        </mesh>
      )}
      
      {/* Root system */}
      {(viewMode === 'full' || viewMode === 'roots') && (
        <group position={[0, -2.2, 0]}>
          {Array.from({ length: 8 }).map((_, i) => (
            <mesh
              key={i}
              position={[
                Math.sin((i / 8) * Math.PI * 2) * 0.3,
                -0.5,
                Math.cos((i / 8) * Math.PI * 2) * 0.3
              ]}
              rotation={[Math.PI / 6, (i / 8) * Math.PI * 2, 0]}
            >
              <cylinderGeometry args={[0.02, 0.05, 1]} />
              <meshStandardMaterial color="#7c6f64" roughness={0.9} />
            </mesh>
          ))}
        </group>
      )}
      
      {/* Main Leaves */}
      {(viewMode === 'full' || viewMode === 'leaves') && (
        <group>
          {Array.from({ length: 12 }).map((_, i) => (
            <mesh
              key={i}
              position={[
                Math.sin((i / 12) * Math.PI * 2) * (0.6 + Math.sin(i) * 0.2),
                Math.cos(i * 0.8) * 0.8 + 0.2,
                Math.cos((i / 12) * Math.PI * 2) * (0.6 + Math.cos(i) * 0.2)
              ]}
              rotation={[
                Math.random() * 0.3 - 0.15,
                (i / 12) * Math.PI * 2 + Math.sin(i) * 0.3,
                Math.random() * 0.2 - 0.1
              ]}
            >
              <planeGeometry args={[1, 1.5]} />
              <meshStandardMaterial 
                color={color} 
                side={2} 
                transparent
                opacity={0.9}
                roughness={0.3}
              />
            </mesh>
          ))}
        </group>
      )}
      
      {/* Small branch leaves */}
      {(viewMode === 'full' || viewMode === 'leaves') && (
        <group>
          {Array.from({ length: 20 }).map((_, i) => (
            <mesh
              key={i}
              position={[
                Math.sin((i / 20) * Math.PI * 4) * 0.8,
                Math.random() * 2 - 0.5,
                Math.cos((i / 20) * Math.PI * 4) * 0.8
              ]}
              rotation={[
                Math.random() * Math.PI,
                Math.random() * Math.PI * 2,
                Math.random() * Math.PI
              ]}
            >
              <planeGeometry args={[0.4, 0.6]} />
              <meshStandardMaterial 
                color={color} 
                side={2} 
                transparent
                opacity={0.8}
              />
            </mesh>
          ))}
        </group>
      )}
      
      {/* Flowers/Berries */}
      {(viewMode === 'full' || viewMode === 'flowers') && (
        <group>
          {Array.from({ length: 6 }).map((_, i) => (
            <mesh
              key={i}
              position={[
                Math.sin((i / 6) * Math.PI * 2) * 0.4,
                1.2 + Math.sin(i) * 0.3,
                Math.cos((i / 6) * Math.PI * 2) * 0.4
              ]}
            >
              <sphereGeometry args={[0.12, 8, 8]} />
              <meshStandardMaterial color="#ff6b6b" />
            </mesh>
          ))}
          
          {/* Flower petals */}
          {Array.from({ length: 15 }).map((_, i) => (
            <mesh
              key={i}
              position={[
                Math.sin((i / 15) * Math.PI * 2) * 0.5,
                1.5 + Math.sin(i * 0.5) * 0.2,
                Math.cos((i / 15) * Math.PI * 2) * 0.5
              ]}
              rotation={[
                Math.random() * 0.5,
                (i / 15) * Math.PI * 2,
                Math.random() * 0.3
              ]}
            >
              <planeGeometry args={[0.3, 0.5]} />
              <meshStandardMaterial 
                color="#ffb3e6" 
                side={2} 
                transparent
                opacity={0.8}
              />
            </mesh>
          ))}
        </group>
      )}
    </group>
  );
}

function PlantViewer3D({ plant, viewMode, animate }: { 
  plant: Plant; 
  viewMode: string; 
  animate: boolean; 
}) {
  const controlsRef = useRef<any>();
  
  const resetView = () => {
    if (controlsRef.current) {
      controlsRef.current.reset();
    }
  };
  
  return (
    <div className="relative h-full">
      <Canvas 
        camera={{ 
          position: viewMode === 'roots' ? [0, -2, 4] : [2, 1, 4], 
          fov: 60 
        }}
        shadows
      >
        <Environment preset="forest" />
        <ambientLight intensity={0.4} />
        <directionalLight 
          position={[10, 10, 5]} 
          intensity={1}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <pointLight position={[-10, -10, -10]} intensity={0.2} />
        
        <Suspense fallback={null}>
          <Enhanced3DPlantModel 
            color={plant.color} 
            viewMode={viewMode as any}
            animate={animate}
          />
          <ContactShadows 
            position={[0, -2.5, 0]} 
            opacity={0.3} 
            scale={10} 
            blur={2} 
          />
          <OrbitControls
            ref={controlsRef}
            enableZoom={true}
            enablePan={true}
            enableRotate={true}
            autoRotate={animate}
            autoRotateSpeed={0.5}
            minDistance={2}
            maxDistance={8}
            maxPolarAngle={Math.PI / 1.8}
          />
        </Suspense>
      </Canvas>
      
      {/* 3D Controls Overlay */}
      <div className="absolute bottom-4 left-4 flex gap-2">
        <Button
          onClick={resetView}
          size="sm"
          variant="secondary"
          className="bg-background/80 backdrop-blur"
        >
          <RotateCcw className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

function PlantLoader() {
  return (
    <div className="w-full h-full flex items-center justify-center bg-gradient-botanical rounded-lg">
      <div className="animate-pulse text-center">
        <Leaf className="w-12 h-12 text-primary-foreground mx-auto mb-2" />
        <p className="text-primary-foreground/80 text-sm">Loading 3D Model...</p>
      </div>
    </div>
  );
}

interface Enhanced3DViewerProps {
  plant: Plant;
}

export function Enhanced3DViewer({ plant }: Enhanced3DViewerProps) {
  const [viewMode, setViewMode] = useState('full');
  const [isAnimating, setIsAnimating] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const viewModes = [
    { id: 'full', label: 'Full Plant', icon: TreePine },
    { id: 'leaves', label: 'Leaves', icon: Leaf },
    { id: 'flowers', label: 'Flowers', icon: Flower },
    { id: 'roots', label: 'Roots', icon: Eye },
  ];
  
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };
  
  return (
    <Card className={`overflow-hidden ${isFullscreen ? 'fixed inset-4 z-50' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Interactive 3D Model</CardTitle>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setIsAnimating(!isAnimating)}
              size="sm"
              variant="outline"
            >
              {isAnimating ? 'Pause' : 'Rotate'}
            </Button>
            <Button
              onClick={toggleFullscreen}
              size="sm"
              variant="outline"
            >
              <Maximize2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* View Mode Selector */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {viewModes.map((mode) => {
            const IconComponent = mode.icon;
            return (
              <Button
                key={mode.id}
                onClick={() => setViewMode(mode.id)}
                variant={viewMode === mode.id ? "default" : "outline"}
                size="sm"
                className="flex-shrink-0"
              >
                <IconComponent className="w-4 h-4 mr-2" />
                {mode.label}
              </Button>
            );
          })}
        </div>
        
        {/* 3D Viewer */}
        <div className={`bg-gradient-botanical rounded-lg overflow-hidden ${
          isFullscreen ? 'h-[calc(100vh-200px)]' : 'h-96'
        }`}>
          <Suspense fallback={<PlantLoader />}>
            <PlantViewer3D 
              plant={plant} 
              viewMode={viewMode} 
              animate={isAnimating}
            />
          </Suspense>
        </div>
        
        {/* View Instructions */}
        <div className="text-sm text-muted-foreground space-y-1">
          <p>• <strong>Rotate:</strong> Click and drag to rotate the model</p>
          <p>• <strong>Zoom:</strong> Mouse wheel or pinch to zoom</p>
          <p>• <strong>Pan:</strong> Right-click and drag to pan</p>
          <p>• <strong>Focus:</strong> Select different plant parts above</p>
        </div>
        
        {/* Plant Part Info */}
        {viewMode !== 'full' && (
          <div className="p-3 bg-muted/30 rounded-lg">
            <h4 className="font-semibold text-foreground mb-1">
              {viewModes.find(m => m.id === viewMode)?.label} Focus
            </h4>
            <p className="text-sm text-muted-foreground">
              {viewMode === 'leaves' && 'Examining the medicinal leaves and their structure.'}
              {viewMode === 'flowers' && 'Viewing the reproductive parts and flowering structures.'}
              {viewMode === 'roots' && 'Exploring the root system and underground parts.'}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}