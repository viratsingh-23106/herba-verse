import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, RoundedBox } from '@react-three/drei';
import { Group } from 'three';
import { useVRTour } from '@/hooks/useVRTour';

export const VRTourGuide: React.FC = () => {
  const {
    currentTour,
    currentWaypoint,
    currentWaypointIndex,
    isActive,
    isFirstWaypoint,
    isLastWaypoint,
    progress,
    nextWaypoint,
    previousWaypoint,
    stopTour,
  } = useVRTour();

  const guideRef = useRef<Group>(null);

  useFrame((state) => {
    if (guideRef.current && isActive) {
      // Position tour guide in front of camera
      const camera = state.camera;
      guideRef.current.position.copy(camera.position);
      guideRef.current.position.add(
        camera.getWorldDirection(new (camera.position.constructor as any)()).multiplyScalar(-2)
      );
      guideRef.current.position.y += 0.5;
      guideRef.current.lookAt(camera.position);
    }
  });

  if (!isActive || !currentTour || !currentWaypoint) {
    return null;
  }

  return (
    <group ref={guideRef}>
      {/* Tour information panel */}
      <RoundedBox
        args={[3, 1.5, 0.05]}
        radius={0.05}
        smoothness={4}
        position={[0, 0, 0]}
      >
        <meshStandardMaterial
          color="rgba(0, 0, 0, 0.8)"
          transparent
          opacity={0.9}
        />
      </RoundedBox>

      {/* Tour title */}
      <Text
        position={[0, 0.5, 0.03]}
        fontSize={0.15}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        font="/fonts/inter-bold.woff"
      >
        {currentTour.title_en}
      </Text>

      {/* Current waypoint info */}
      <Text
        position={[0, 0.2, 0.03]}
        fontSize={0.1}
        color="#e5e7eb"
        anchorX="center"
        anchorY="middle"
        maxWidth={2.5}
      >
        {currentWaypoint.title_en || `Plant ${currentWaypointIndex + 1}`}
      </Text>

      {/* Progress indicator */}
      <Text
        position={[0, -0.1, 0.03]}
        fontSize={0.08}
        color="#9ca3af"
        anchorX="center"
        anchorY="middle"
      >
        {currentWaypointIndex + 1} / {currentTour.waypoints.length}
      </Text>

      {/* Progress bar */}
      <group position={[0, -0.3, 0.03]}>
        {/* Background bar */}
        <RoundedBox
          args={[2, 0.05, 0.01]}
          radius={0.025}
          smoothness={4}
        >
          <meshStandardMaterial color="#374151" />
        </RoundedBox>
        
        {/* Progress fill */}
        <RoundedBox
          args={[2 * progress, 0.05, 0.015]}
          radius={0.025}
          smoothness={4}
          position={[-(2 * (1 - progress)) / 2, 0, 0.005]}
        >
          <meshStandardMaterial
            color="#10b981"
            emissive="#10b981"
            emissiveIntensity={0.2}
          />
        </RoundedBox>
      </group>

      {/* Navigation buttons */}
      <group position={[-0.8, -0.6, 0.03]}>
        {/* Previous button */}
        <group onClick={!isFirstWaypoint ? previousWaypoint : undefined}>
          <RoundedBox
            args={[0.4, 0.2, 0.02]}
            radius={0.02}
            smoothness={4}
          >
            <meshStandardMaterial
              color={!isFirstWaypoint ? "#3b82f6" : "#6b7280"}
            />
          </RoundedBox>
          <Text
            position={[0, 0, 0.02]}
            fontSize={0.06}
            color="white"
            anchorX="center"
            anchorY="middle"
          >
            Previous
          </Text>
        </group>
      </group>

      <group position={[0, -0.6, 0.03]}>
        {/* Stop tour button */}
        <group onClick={stopTour}>
          <RoundedBox
            args={[0.4, 0.2, 0.02]}
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
            Stop Tour
          </Text>
        </group>
      </group>

      <group position={[0.8, -0.6, 0.03]}>
        {/* Next button */}
        <group onClick={!isLastWaypoint ? nextWaypoint : undefined}>
          <RoundedBox
            args={[0.4, 0.2, 0.02]}
            radius={0.02}
            smoothness={4}
          >
            <meshStandardMaterial
              color={!isLastWaypoint ? "#10b981" : "#6b7280"}
            />
          </RoundedBox>
          <Text
            position={[0, 0, 0.02]}
            fontSize={0.06}
            color="white"
            anchorX="center"
            anchorY="middle"
          >
            {isLastWaypoint ? "Complete" : "Next"}
          </Text>
        </group>
      </group>

      {/* Waypoint description */}
      {currentWaypoint.description_en && (
        <group position={[0, -1.2, 0]}>
          <RoundedBox
            args={[2.8, 0.8, 0.02]}
            radius={0.02}
            smoothness={4}
          >
            <meshStandardMaterial
              color="rgba(255, 255, 255, 0.1)"
              transparent
              opacity={0.8}
            />
          </RoundedBox>
          <Text
            position={[0, 0, 0.02]}
            fontSize={0.06}
            color="#f3f4f6"
            anchorX="center"
            anchorY="middle"
            maxWidth={2.5}
            textAlign="center"
          >
            {currentWaypoint.description_en}
          </Text>
        </group>
      )}
    </group>
  );
};