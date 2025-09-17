import React, { useState, useEffect } from 'react';
import { VRGarden } from '@/components/webxr/VRGarden';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Alert, AlertDescription } from '@/components/ui/alert';

export const VRGardenPage: React.FC = () => {
  const navigate = useNavigate();
  const [isVRMode, setIsVRMode] = useState(false);

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsVRMode(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  return (
    <div className="relative h-screen w-full overflow-hidden">
      {/* Header overlay - Hide in VR mode */}
      {!isVRMode && (
        <div className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-black/50 to-transparent p-4">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="text-white hover:bg-white/20"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Garden
            </Button>
            
            <h1 className="text-white text-xl font-semibold">
              VR Herbal Garden
            </h1>

            <div className="flex items-center gap-2">
              <Alert className="w-auto bg-black/30 border-white/20">
                <Info className="w-4 h-4" />
                <AlertDescription className="text-white text-sm">
                  Drag to rotate • Scroll to zoom
                </AlertDescription>
              </Alert>
            </div>
          </div>
        </div>
      )}

      {/* VR Garden Component */}
      <VRGarden />

      {/* Bottom overlay with instructions - Hide in VR mode */}
      {!isVRMode && (
        <div className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/50 to-transparent p-4">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-white text-center">
              <div className="bg-black/30 rounded-lg p-3 backdrop-blur-sm">
                <h3 className="font-semibold mb-1 text-green-300">🎮 VR Controls</h3>
                <p className="text-xs opacity-90">
                  Drag video to rotate view and scroll to zoom
                </p>
              </div>
              
              <div className="bg-black/30 rounded-lg p-3 backdrop-blur-sm">
                <h3 className="font-semibold mb-1 text-blue-300">🌿 Virtual Garden</h3>
                <p className="text-xs opacity-90">
                  Use VR Mode button for immersive experience
                </p>
              </div>
              
              <div className="bg-black/30 rounded-lg p-3 backdrop-blur-sm">
                <h3 className="font-semibold mb-1 text-yellow-300">📋 360° Video</h3>
                <p className="text-xs opacity-90">
                  Immersive herbal garden tour experience
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};