import React, { useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useXR } from '@react-three/xr';
import { Cylinder, Sphere } from '@react-three/drei';
import { Vector3, Raycaster, Plane } from 'three';

export const VRTeleportation: React.FC = () => {
  const { session } = useXR();
  const { scene, camera } = useThree();
  const [teleportTarget, setTeleportTarget] = useState<Vector3 | null>(null);
  const [showTeleportPreview, setShowTeleportPreview] = useState(false);
  
  const raycaster = useRef(new Raycaster());
  const groundPlane = useRef(new Plane(new Vector3(0, 1, 0), 0));

  useFrame(() => {
    // Simplified teleportation for compatibility
    if (session && session.inputSources) {
      session.inputSources.forEach((inputSource) => {
        if (inputSource.gamepad) {
          const gamepad = inputSource.gamepad;
          
          // Check for teleport button press
          const teleportPressed = gamepad.buttons[1]?.pressed;
          
          if (teleportPressed) {
            // Set a default teleport target for demo
            const target = new Vector3(0, 0, 0);
            setTeleportTarget(target);
            setShowTeleportPreview(true);
          } else if (teleportTarget && showTeleportPreview) {
            // Execute teleport by moving camera
            camera.position.set(teleportTarget.x, teleportTarget.y + 1.6, teleportTarget.z);
            setTeleportTarget(null);
            setShowTeleportPreview(false);
          }
        }
      });
    }
  });

  return (
    <group>
      {/* Teleport preview indicator */}
      {showTeleportPreview && teleportTarget && (
        <group position={[teleportTarget.x, teleportTarget.y, teleportTarget.z]}>
          {/* Base circle */}
          <Cylinder 
            args={[1, 1, 0.05]} 
            position={[0, 0.025, 0]}
          >
            <meshStandardMaterial
              color="#00ff00"
              transparent
              opacity={0.6}
              emissive="#00ff00"
              emissiveIntensity={0.3}
            />
          </Cylinder>
          
          {/* Center indicator */}
          <Sphere args={[0.1]} position={[0, 0.1, 0]}>
            <meshStandardMaterial
              color="#ffffff"
              emissive="#ffffff"
              emissiveIntensity={0.5}
            />
          </Sphere>
          
          {/* Animated rings */}
          {Array.from({ length: 3 }, (_, i) => (
            <Cylinder
              key={i}
              args={[0.5 + i * 0.3, 0.5 + i * 0.3, 0.02]}
              position={[0, 0.05 + i * 0.02, 0]}
            >
              <meshStandardMaterial
                color="#00ff00"
                transparent
                opacity={0.4 - i * 0.1}
                emissive="#00ff00"
                emissiveIntensity={0.2}
              />
            </Cylinder>
          ))}
        </group>
      )}

      {/* Teleport destinations markers (predefined locations) */}
      {/* Garden center */}
      <TeleportMarker position={[0, 0, 0]} label="Garden Center" />
      
      {/* Plant bed centers */}
      <TeleportMarker position={[0, 0, 8]} label="North Garden" />
      <TeleportMarker position={[0, 0, -8]} label="South Garden" />
      <TeleportMarker position={[8, 0, 0]} label="East Garden" />
      <TeleportMarker position={[-8, 0, 0]} label="West Garden" />
    </group>
  );
};

interface TeleportMarkerProps {
  position: [number, number, number];
  label: string;
}

const TeleportMarker: React.FC<TeleportMarkerProps> = ({ position, label }) => {
  const markerRef = useRef<any>(null);

  useFrame((state) => {
    if (markerRef.current) {
      const time = state.clock.getElapsedTime();
      markerRef.current.position.y = position[1] + 0.1 + Math.sin(time * 2) * 0.05;
      markerRef.current.rotation.y = time * 0.5;
    }
  });

  return (
    <group position={position}>
      {/* Base platform */}
      <Cylinder args={[0.5, 0.5, 0.02]} position={[0, 0.01, 0]}>
        <meshStandardMaterial
          color="#3b82f6"
          transparent
          opacity={0.3}
          emissive="#3b82f6"
          emissiveIntensity={0.1}
        />
      </Cylinder>
      
      {/* Floating marker */}
      <group ref={markerRef}>
        <Sphere args={[0.08]}>
          <meshStandardMaterial
            color="#3b82f6"
            emissive="#3b82f6"
            emissiveIntensity={0.4}
          />
        </Sphere>
      </group>
    </group>
  );
};