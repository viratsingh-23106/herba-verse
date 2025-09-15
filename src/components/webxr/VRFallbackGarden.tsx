import React from 'react';
import { Box, Sphere, Cylinder } from '@react-three/drei';

export const VRFallbackGarden: React.FC = () => {
  return (
    <group>
      {/* Ground plane */}
      <Box args={[20, 0.1, 20]} position={[0, -0.5, 0]}>
        <meshStandardMaterial color="#4ade80" />
      </Box>
      
      {/* Simple plant representations */}
      <group position={[-3, 0, -2]}>
        <Cylinder args={[0.1, 0.15, 1]} position={[0, 0.5, 0]}>
          <meshStandardMaterial color="#8b5cf6" />
        </Cylinder>
        <Sphere args={[0.3]} position={[0, 1.2, 0]}>
          <meshStandardMaterial color="#22c55e" />
        </Sphere>
      </group>
      
      <group position={[3, 0, -2]}>
        <Cylinder args={[0.1, 0.15, 1.2]} position={[0, 0.6, 0]}>
          <meshStandardMaterial color="#8b5cf6" />
        </Cylinder>
        <Sphere args={[0.4]} position={[0, 1.4, 0]}>
          <meshStandardMaterial color="#ef4444" />
        </Sphere>
      </group>
      
      <group position={[0, 0, -4]}>
        <Cylinder args={[0.12, 0.18, 1.5]} position={[0, 0.75, 0]}>
          <meshStandardMaterial color="#8b5cf6" />
        </Cylinder>
        <Sphere args={[0.35]} position={[0, 1.6, 0]}>
          <meshStandardMaterial color="#f59e0b" />
        </Sphere>
      </group>
      
      {/* Ambient decoration */}
      <Box args={[0.5, 0.5, 0.5]} position={[-5, 0.25, 0]}>
        <meshStandardMaterial color="#78716c" />
      </Box>
      <Box args={[0.3, 0.8, 0.3]} position={[5, 0.4, -1]}>
        <meshStandardMaterial color="#78716c" />
      </Box>
    </group>
  );
};