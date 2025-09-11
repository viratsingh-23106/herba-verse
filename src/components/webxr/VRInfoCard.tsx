import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Plane, RoundedBox } from '@react-three/drei';
import { Group } from 'three';

interface Plant {
  id: string;
  name_en: string;
  scientific_name?: string;
  description_en?: string;
  uses_en?: string[];
  color?: string;
}

interface VRInfoCardProps {
  plant?: Plant;
  position: [number, number, number];
  onClose: () => void;
}

export const VRInfoCard: React.FC<VRInfoCardProps> = ({
  plant,
  position,
  onClose,
}) => {
  const cardRef = useRef<Group>(null);

  useFrame((state) => {
    if (cardRef.current) {
      // Gentle floating animation
      const time = state.clock.getElapsedTime();
      cardRef.current.position.y = position[1] + Math.sin(time * 2) * 0.02;
      
      // Face the camera
      cardRef.current.lookAt(state.camera.position);
    }
  });

  if (!plant) return null;

  const cardWidth = 2.5;
  const cardHeight = 3;
  const padding = 0.1;

  return (
    <group ref={cardRef} position={position}>
      {/* Card background */}
      <RoundedBox
        args={[cardWidth, cardHeight, 0.05]}
        radius={0.05}
        smoothness={4}
        position={[0, 0, 0]}
      >
        <meshStandardMaterial
          color="white"
          transparent
          opacity={0.95}
          roughness={0.1}
          metalness={0.05}
        />
      </RoundedBox>

      {/* Card border */}
      <RoundedBox
        args={[cardWidth + 0.02, cardHeight + 0.02, 0.03]}
        radius={0.06}
        smoothness={4}
        position={[0, 0, -0.01]}
      >
        <meshStandardMaterial
          color={plant.color || '#4ade80'}
          transparent
          opacity={0.8}
        />
      </RoundedBox>

      {/* Plant Name */}
      <Text
        position={[0, cardHeight/2 - 0.3, 0.03]}
        fontSize={0.2}
        color="#1f2937"
        anchorX="center"
        anchorY="middle"
        font="/fonts/inter-bold.woff"
        maxWidth={cardWidth - padding * 2}
      >
        {plant.name_en}
      </Text>

      {/* Scientific Name */}
      {plant.scientific_name && (
        <Text
          position={[0, cardHeight/2 - 0.55, 0.03]}
          fontSize={0.12}
          color="#6b7280"
          anchorX="center"
          anchorY="middle"
          maxWidth={cardWidth - padding * 2}
        >
          {plant.scientific_name}
        </Text>
      )}

      {/* Description */}
      {plant.description_en && (
        <Text
          position={[0, cardHeight/2 - 1, 0.03]}
          fontSize={0.08}
          color="#374151"
          anchorX="center"
          anchorY="top"
          maxWidth={cardWidth - padding * 2}
          // @ts-ignore - italic prop compatibility
          italic
        >
          {plant.description_en.length > 200 
            ? plant.description_en.substring(0, 200) + '...'
            : plant.description_en
          }
        </Text>
      )}

      {/* Uses Section */}
      {plant.uses_en && plant.uses_en.length > 0 && (
        <>
          <Text
            position={[0, -0.2, 0.03]}
            fontSize={0.1}
            color="#1f2937"
            anchorX="center"
            anchorY="middle"
            font="/fonts/inter-bold.woff"
          >
            Medicinal Uses:
          </Text>

          {plant.uses_en.slice(0, 4).map((use, index) => (
            <Text
              key={index}
              position={[0, -0.4 - (index * 0.15), 0.03]}
              fontSize={0.07}
              color="#4b5563"
              anchorX="center"
              anchorY="middle"
              maxWidth={cardWidth - padding * 2}
            >
              • {use}
            </Text>
          ))}
        </>
      )}

      {/* Interactive Elements */}
      
      {/* Bookmark Button */}
      <group position={[-0.8, -1.2, 0.03]}>
        <RoundedBox
          args={[0.3, 0.15, 0.02]}
          radius={0.02}
          smoothness={4}
        >
          <meshStandardMaterial color="#3b82f6" />
        </RoundedBox>
        <Text
          position={[0, 0, 0.02]}
          fontSize={0.06}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          Bookmark
        </Text>
      </group>

      {/* Notes Button */}
      <group position={[0, -1.2, 0.03]}>
        <RoundedBox
          args={[0.3, 0.15, 0.02]}
          radius={0.02}
          smoothness={4}
        >
          <meshStandardMaterial color="#10b981" />
        </RoundedBox>
        <Text
          position={[0, 0, 0.02]}
          fontSize={0.06}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          Notes
        </Text>
      </group>

      {/* Close Button */}
      <group 
        position={[0.8, -1.2, 0.03]}
        onClick={onClose}
      >
        <RoundedBox
          args={[0.3, 0.15, 0.02]}
          radius={0.02}
          smoothness={4}
        >
          <meshStandardMaterial color="#ef4444" />
        </RoundedBox>
        <Text
          position={[0, 0, 0.02]}
          fontSize={0.06}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          Close
        </Text>
      </group>

      {/* Interaction hint */}
      <Text
        position={[0, -cardHeight/2 + 0.15, 0.03]}
        fontSize={0.05}
        color="#9ca3af"
        anchorX="center"
        anchorY="middle"
      >
        Point and click to interact
      </Text>
    </group>
  );
};