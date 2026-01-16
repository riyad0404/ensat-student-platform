import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float, MeshReflectorMaterial, Environment, Lightformer } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';

// Floating document component
function FloatingDocument({ position, rotationSpeed }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += rotationSpeed;
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime) * 0.15;
    }
  });

  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={2}>
      <mesh ref={meshRef} position={position}>
        <boxGeometry args={[2, 2.8, 0.05]} />
        <meshStandardMaterial 
          color="#7c3aed" 
          emissive="#7c3aed"
          emissiveIntensity={0.2}
          metalness={0.8}
          roughness={0.2}
        />
        {/* Document details */}
        <mesh position={[0, 0, 0.03]}>
          <planeGeometry args={[1.8, 2.6]} />
          <meshStandardMaterial color="#f0f0f0" />
        </mesh>
        {/* Document text lines */}
        {Array.from({ length: 5 }).map((_, i) => (
          <mesh key={i} position={[0, 0.8 - i * 0.4, 0.04]}>
            <planeGeometry args={[1.5, 0.08]} />
            <meshStandardMaterial color="#c7d2fe" />
          </mesh>
        ))}
      </mesh>
    </Float>
  );
}

// Floating student avatar
function FloatingAvatar({ position }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
    }
  });

  return (
    <Float speed={3} rotationIntensity={1} floatIntensity={2}>
      <group ref={meshRef} position={position}>
        <mesh>
          <sphereGeometry args={[0.5]} />
          <meshStandardMaterial 
            color="#a855f7"
            emissive="#a855f7"
            emissiveIntensity={0.3}
          />
        </mesh>
        {/* Eyes */}
        <mesh position={[-0.15, 0.1, 0.45]}>
          <sphereGeometry args={[0.08]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
        <mesh position={[0.15, 0.1, 0.45]}>
          <sphereGeometry args={[0.08]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
      </group>
    </Float>
  );
}

// Connection lines between elements
function ConnectionLine({ start, end }) {
  const points = [start, end];
  
  return (
    <line>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={points.length}
          array={new Float32Array(points.flat())}
          itemSize={3}
        />
      </bufferGeometry>
      <lineBasicMaterial color="#7c3aed" linewidth={1} transparent opacity={0.4} />
    </line>
  );
}

export default function Landing3D() {
  return (
    <div style={{ width: '100%', height: '100vh', position: 'absolute', top: 0, left: 0, zIndex: 0 }}>
      <Canvas
        camera={{ position: [0, 2, 10], fov: 60 }}
        style={{ background: 'transparent' }}
      >
        <color attach="background" args={['#fcfbff']} />
        
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
        <pointLight position={[-10, -10, -10]} color="#7c3aed" intensity={0.5} />
        
        {/* Floating documents */}
        <FloatingDocument position={[-4, 1, 0]} rotationSpeed={0.005} />
        <FloatingDocument position={[4, -0.5, 0]} rotationSpeed={-0.003} />
        <FloatingDocument position={[-2, -1, 2]} rotationSpeed={0.004} />
        
        {/* Floating avatars */}
        <FloatingAvatar position={[3, 2, -1]} />
        <FloatingAvatar position={[-3, 0, 1]} />
        
        {/* Connection lines */}
        <ConnectionLine start={[-4, 1, 0]} end={[3, 2, -1]} />
        <ConnectionLine start={[4, -0.5, 0]} end={[-3, 0, 1]} />
        
        {/* Ground reflection */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -3, 0]}>
          <planeGeometry args={[20, 20]} />
          <MeshReflectorMaterial
            blur={[300, 100]}
            resolution={2048}
            mixBlur={1}
            mixStrength={40}
            roughness={1}
            depthScale={1.2}
            minDepthThreshold={0.4}
            maxDepthThreshold={1.4}
            color="#f4f2ff"
            metalness={0.5}
          />
        </mesh>
        
        <OrbitControls 
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.5}
          maxPolarAngle={Math.PI / 2}
          minPolarAngle={Math.PI / 2 - 0.5}
        />
        
        <Environment preset="city" />
        <EffectComposer>
          <Bloom intensity={0.5} luminanceThreshold={0.9} />
        </EffectComposer>
      </Canvas>
    </div>
  );
}