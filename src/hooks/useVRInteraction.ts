import { useState, useCallback, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Raycaster, Vector3, Camera } from 'three';

export interface VRInteraction {
  object: any;
  point: Vector3;
  distance: number;
}

export const useVRInteraction = () => {
  const { scene, camera } = useThree();
  const [hoveredObject, setHoveredObject] = useState<any>(null);
  const [selectedObject, setSelectedObject] = useState<any>(null);
  const raycaster = useRef(new Raycaster());
  
  const raycast = useCallback((origin: Vector3, direction: Vector3): VRInteraction | null => {
    raycaster.current.set(origin, direction);
    const intersects = raycaster.current.intersectObjects(scene.children, true);
    
    if (intersects.length > 0) {
      const intersection = intersects[0];
      // Look for plant objects (marked with userData.isPlant)
      let plantObject = intersection.object;
      while (plantObject && !plantObject.userData?.isPlant) {
        plantObject = plantObject.parent;
      }
      
      if (plantObject && plantObject.userData?.isPlant) {
        return {
          object: plantObject,
          point: intersection.point,
          distance: intersection.distance,
        };
      }
    }
    return null;
  }, [scene]);

  const handleControllerRay = useCallback((controllerPosition: Vector3, controllerDirection: Vector3) => {
    const interaction = raycast(controllerPosition, controllerDirection);
    
    if (interaction) {
      if (hoveredObject !== interaction.object) {
        setHoveredObject(interaction.object);
        // Add haptic feedback if available
        if ('gamepad' in navigator) {
          // Simple haptic feedback for supported controllers
          try {
            // @ts-ignore - hapticActuators is experimental
            const gamepad = navigator.getGamepads().find(gp => gp && gp.hapticActuators);
            if (gamepad && gamepad.hapticActuators && gamepad.hapticActuators[0]) {
              gamepad.hapticActuators[0].pulse(0.3, 100);
            }
          } catch (e) {
            // Haptic feedback not supported
          }
        }
      }
    } else {
      setHoveredObject(null);
    }
  }, [hoveredObject, raycast]);

  const selectObject = useCallback((object: any) => {
    setSelectedObject(object);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedObject(null);
  }, []);

  // Frame-by-frame update for continuous raycasting
  useFrame(() => {
    // This will be called by VRControllers component
    // when controller data is available
  });

  return {
    hoveredObject,
    selectedObject,
    handleControllerRay,
    selectObject,
    clearSelection,
    raycast,
  };
};