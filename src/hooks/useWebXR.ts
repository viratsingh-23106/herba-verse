import { useState, useEffect } from 'react';
import { useXR } from '@react-three/xr';

export interface WebXRCapabilities {
  isSupported: boolean;
  isVRSupported: boolean;
  isARSupported: boolean;
  isSessionSupported: boolean;
}

export const useWebXR = () => {
  const [capabilities, setCapabilities] = useState<WebXRCapabilities>({
    isSupported: false,
    isVRSupported: false,
    isARSupported: false,
    isSessionSupported: false,
  });

  const [isVRActive, setIsVRActive] = useState(false);
  const [vrError, setVrError] = useState<string | null>(null);

  useEffect(() => {
    const checkWebXRSupport = async () => {
      try {
        if (!navigator.xr) {
          setCapabilities(prev => ({ ...prev, isSupported: false }));
          return;
        }

        const vrSupported = await navigator.xr.isSessionSupported('immersive-vr');
        const arSupported = await navigator.xr.isSessionSupported('immersive-ar');
        
        setCapabilities({
          isSupported: true,
          isVRSupported: vrSupported,
          isARSupported: arSupported,
          isSessionSupported: vrSupported || arSupported,
        });
      } catch (error) {
        console.error('WebXR support check failed:', error);
        setCapabilities(prev => ({ ...prev, isSupported: false }));
        setVrError('WebXR not supported on this device or browser');
      }
    };

    checkWebXRSupport();
  }, []);

  const enterVR = async () => {
    try {
      if (!capabilities.isVRSupported) {
        throw new Error('VR not supported on this device');
      }
      setIsVRActive(true);
      setVrError(null);
    } catch (error) {
      setVrError(error instanceof Error ? error.message : 'Failed to enter VR');
      setIsVRActive(false);
    }
  };

  const exitVR = () => {
    setIsVRActive(false);
    setVrError(null);
  };

  return {
    capabilities,
    isVRActive,
    vrError,
    enterVR,
    exitVR,
  };
};