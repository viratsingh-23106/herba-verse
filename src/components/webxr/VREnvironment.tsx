import React from 'react';
import { Plane, Sphere, Cylinder, Box } from '@react-three/drei';
import { RigidBody } from '@react-three/rapier';
import { MeshStandardMaterial } from 'three';

export const VREnvironment: React.FC = () => {
  return (
    <group>
      {/* Ground plane */}
      <RigidBody type="fixed">
        <Plane
          args={[50, 50]}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0, 0]}
          receiveShadow
        >
          <meshStandardMaterial 
            color="#4a7c59" 
            roughness={0.8}
            metalness={0.1}
          />
        </Plane>
      </RigidBody>

      {/* Garden paths */}
      <RigidBody type="fixed">
        <Plane
          args={[2, 50]}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0.01, 0]}
          receiveShadow
        >
          <meshStandardMaterial 
            color="#8b7355" 
            roughness={1}
            metalness={0}
          />
        </Plane>
      </RigidBody>

      <RigidBody type="fixed">
        <Plane
          args={[50, 2]}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0.01, 0]}
          receiveShadow
        >
          <meshStandardMaterial 
            color="#8b7355" 
            roughness={1}
            metalness={0}
          />
        </Plane>
      </RigidBody>

      {/* Garden borders and decorative elements */}
      {/* Decorative trees around the perimeter */}
      {Array.from({ length: 8 }, (_, i) => {
        const angle = (i / 8) * Math.PI * 2;
        const radius = 20;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        
        return (
          <group key={i} position={[x, 0, z]}>
            {/* Tree trunk */}
            <RigidBody type="fixed">
              <Cylinder args={[0.3, 0.4, 3]} position={[0, 1.5, 0]} castShadow>
                <meshStandardMaterial color="#4a3728" />
              </Cylinder>
            </RigidBody>
            
            {/* Tree foliage */}
            <Sphere args={[2]} position={[0, 4, 0]} castShadow>
              <meshStandardMaterial color="#2d5a3d" />
            </Sphere>
          </group>
        );
      })}

      {/* Garden bed borders */}
      {/* North bed */}
      <group position={[0, 0, 8]}>
        <RigidBody type="fixed">
          <Box args={[8, 0.3, 6]} position={[0, 0.15, 0]} castShadow>
            <meshStandardMaterial color="#3d2914" />
          </Box>
        </RigidBody>
        <Plane
          args={[7, 5]}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0.31, 0]}
        >
          <meshStandardMaterial color="#5a4c3a" />
        </Plane>
      </group>

      {/* South bed */}
      <group position={[0, 0, -8]}>
        <RigidBody type="fixed">
          <Box args={[8, 0.3, 6]} position={[0, 0.15, 0]} castShadow>
            <meshStandardMaterial color="#3d2914" />
          </Box>
        </RigidBody>
        <Plane
          args={[7, 5]}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0.31, 0]}
        >
          <meshStandardMaterial color="#5a4c3a" />
        </Plane>
      </group>

      {/* East bed */}
      <group position={[8, 0, 0]}>
        <RigidBody type="fixed">
          <Box args={[6, 0.3, 8]} position={[0, 0.15, 0]} castShadow>
            <meshStandardMaterial color="#3d2914" />
          </Box>
        </RigidBody>
        <Plane
          args={[5, 7]}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0.31, 0]}
        >
          <meshStandardMaterial color="#5a4c3a" />
        </Plane>
      </group>

      {/* West bed */}
      <group position={[-8, 0, 0]}>
        <RigidBody type="fixed">
          <Box args={[6, 0.3, 8]} position={[0, 0.15, 0]} castShadow>
            <meshStandardMaterial color="#3d2914" />
          </Box>
        </RigidBody>
        <Plane
          args={[5, 7]}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0.31, 0]}
        >
          <meshStandardMaterial color="#5a4c3a" />
        </Plane>
      </group>

      {/* Central fountain/feature */}
      <group position={[0, 0, 0]}>
        <RigidBody type="fixed">
          <Cylinder args={[1.5, 1.5, 0.5]} position={[0, 0.25, 0]} castShadow>
            <meshStandardMaterial color="#6b7280" />
          </Cylinder>
        </RigidBody>
        <Cylinder args={[1, 1, 0.8]} position={[0, 0.65, 0]} castShadow>
          <meshStandardMaterial color="#9ca3af" />
        </Cylinder>
        {/* Water effect */}
        <Cylinder args={[0.8, 0.8, 0.1]} position={[0, 1.05, 0]}>
          <meshStandardMaterial 
            color="#4da6ff" 
            transparent 
            opacity={0.6}
            roughness={0}
            metalness={0.1}
          />
        </Cylinder>
      </group>

      {/* Ambient garden elements - rocks and small details */}
      {Array.from({ length: 15 }, (_, i) => {
        const x = (Math.random() - 0.5) * 40;
        const z = (Math.random() - 0.5) * 40;
        const size = 0.2 + Math.random() * 0.3;
        
        return (
          <RigidBody key={i} type="fixed">
            <Sphere 
              args={[size]} 
              position={[x, size, z]}
              castShadow
            >
              <meshStandardMaterial 
                color="#78716c"
                roughness={0.9}
                metalness={0}
              />
            </Sphere>
          </RigidBody>
        );
      })}
    </group>
  );
};