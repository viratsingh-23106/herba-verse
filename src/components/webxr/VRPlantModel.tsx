import React, { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Box, Cylinder, Text, Html } from '@react-three/drei';
import { RigidBody } from '@react-three/rapier';
import { Group, MeshStandardMaterial } from 'three';

interface Plant {
  id: string;
  name_en: string;
  scientific_name?: string;
  description_en?: string;
  uses_en?: string[];
  color?: string;
  glb_url?: string;
}

interface VRPlantModelProps {
  plant: Plant;
  position: { x: number; y: number; z: number };
  scale?: { x: number; y: number; z: number };
  rotation?: { x: number; y: number; z: number };
  isHovered?: boolean;
}

export const VRPlantModel: React.FC<VRPlantModelProps> = ({
  plant,
  position,
  scale = { x: 1, y: 1, z: 1 },
  rotation = { x: 0, y: 0, z: 0 },
  isHovered = false,
}) => {
  const meshRef = useRef<Group>(null);
  const [hovered, setHovered] = useState(false);

  // Create procedural plant model based on plant type
  const plantGeometry = useMemo(() => {
    const plantColor = plant.color || '#4ade80';
    
    // Different plant types get different 3D representations
    if (plant.id === 'aloe-vera') {
      return 'aloe';
    } else if (plant.id === 'turmeric') {
      return 'turmeric';
    } else if (plant.id === 'neem') {
      return 'tree';
    }
    return 'generic';
  }, [plant.id, plant.color]);

  // Gentle animation for plants
  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.getElapsedTime();
      meshRef.current.rotation.y = Math.sin(time * 0.5) * 0.02;
      
      if (isHovered || hovered) {
        meshRef.current.scale.setScalar(
          (scale.x + scale.y + scale.z) / 3 * (1 + Math.sin(time * 4) * 0.05)
        );
      } else {
        meshRef.current.scale.set(scale.x, scale.y, scale.z);
      }
    }
  });

  const renderPlantGeometry = () => {
    const color = plant.color || '#4ade80';
    
    switch (plantGeometry) {
      case 'aloe':
        return (
          <group>
            {/* Aloe leaves */}
            {Array.from({ length: 8 }, (_, i) => (
              <Box
                key={i}
                args={[0.1, 1.2, 0.3]}
                position={[
                  Math.cos((i / 8) * Math.PI * 2) * 0.3,
                  0.6,
                  Math.sin((i / 8) * Math.PI * 2) * 0.3
                ]}
                rotation={[0, (i / 8) * Math.PI * 2, 0.2]}
                castShadow
              >
                <meshStandardMaterial color={color} />
              </Box>
            ))}
            {/* Center */}
            <Cylinder args={[0.2, 0.2, 0.3]} position={[0, 0.15, 0]} castShadow>
              <meshStandardMaterial color={color} />
            </Cylinder>
          </group>
        );

      case 'turmeric':
        return (
          <group>
            {/* Turmeric rhizome underground */}
            <Cylinder 
              args={[0.15, 0.2, 0.4]} 
              position={[0, -0.1, 0]} 
              rotation={[0, 0, Math.PI / 6]}
              castShadow
            >
              <meshStandardMaterial color="#d97706" />
            </Cylinder>
            {/* Stems and leaves */}
            {Array.from({ length: 4 }, (_, i) => (
              <group key={i}>
                <Cylinder
                  args={[0.03, 0.03, 1]}
                  position={[
                    (i - 1.5) * 0.2,
                    0.5,
                    0
                  ]}
                  castShadow
                >
                  <meshStandardMaterial color="#22c55e" />
                </Cylinder>
                <Box
                  args={[0.3, 0.6, 0.1]}
                  position={[
                    (i - 1.5) * 0.2,
                    1.2,
                    0
                  ]}
                  castShadow
                >
                  <meshStandardMaterial color={color} />
                </Box>
              </group>
            ))}
          </group>
        );

      case 'tree':
        return (
          <group>
            {/* Neem tree trunk */}
            <Cylinder args={[0.15, 0.2, 2]} position={[0, 1, 0]} castShadow>
              <meshStandardMaterial color="#4a3728" />
            </Cylinder>
            {/* Foliage */}
            <Sphere args={[1.2]} position={[0, 2.5, 0]} castShadow>
              <meshStandardMaterial color={color} />
            </Sphere>
            {/* Additional foliage clusters */}
            <Sphere args={[0.8]} position={[0.7, 2.8, 0.3]} castShadow>
              <meshStandardMaterial color={color} />
            </Sphere>
            <Sphere args={[0.6]} position={[-0.5, 2.2, -0.4]} castShadow>
              <meshStandardMaterial color={color} />
            </Sphere>
          </group>
        );

      default:
        return (
          <group>
            <Cylinder args={[0.05, 0.05, 0.8]} position={[0, 0.4, 0]} castShadow>
              <meshStandardMaterial color="#22c55e" />
            </Cylinder>
            <Sphere args={[0.4]} position={[0, 1, 0]} castShadow>
              <meshStandardMaterial color={color} />
            </Sphere>
          </group>
        );
    }
  };

  return (
    <RigidBody type="fixed">
      <group
        ref={meshRef}
        position={[position.x, position.y, position.z]}
        rotation={[rotation.x, rotation.y, rotation.z]}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
        userData={{ isPlant: true, plantId: plant.id, plant }}
      >
        {renderPlantGeometry()}
        
        {/* Interactive glow effect */}
        {(isHovered || hovered) && (
          <Sphere args={[1.5]} position={[0, 1, 0]}>
            <meshStandardMaterial
              color={plant.color || '#4ade80'}
              transparent
              opacity={0.1}
              emissive={plant.color || '#4ade80'}
              emissiveIntensity={0.2}
            />
          </Sphere>
        )}

        {/* Plant name label */}
        <Text
          position={[0, 2.5, 0]}
          fontSize={0.3}
          color="white"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.02}
          outlineColor="black"
          visible={isHovered || hovered}
        >
          {plant.name_en}
        </Text>

        {/* Scientific name */}
        {plant.scientific_name && (
          <Text
            position={[0, 2.1, 0]}
            fontSize={0.15}
            color="#cccccc"
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.01}
          outlineColor="black"
          visible={isHovered || hovered}
          >
            {plant.scientific_name}
          </Text>
        )}
      </group>
    </RigidBody>
  );
};