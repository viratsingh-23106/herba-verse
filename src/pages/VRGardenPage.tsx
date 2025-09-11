import React from 'react';
import { VRGarden } from '@/components/webxr/VRGarden';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Alert, AlertDescription } from '@/components/ui/alert';

export const VRGardenPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="relative h-screen w-full">
      {/* Header overlay */}
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
                Use VR controllers to point and select plants
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </div>

      {/* VR Garden Component */}
      <VRGarden />

      {/* Bottom overlay with instructions */}
      <div className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/50 to-transparent p-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-white">
            <div className="text-center">
              <h3 className="font-semibold mb-2">VR Controls</h3>
              <p className="text-sm opacity-80">
                Point controllers at plants and pull trigger to interact
              </p>
            </div>
            
            <div className="text-center">
              <h3 className="font-semibold mb-2">Teleportation</h3>
              <p className="text-sm opacity-80">
                Press thumbstick or secondary button to teleport
              </p>
            </div>
            
            <div className="text-center">
              <h3 className="font-semibold mb-2">Plant Information</h3>
              <p className="text-sm opacity-80">
                Select plants to view detailed medicinal information
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};