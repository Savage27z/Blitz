"use client";

import { useRef, useMemo, useCallback } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

function Particles({ count = 2500 }: { count?: number }) {
  const mesh = useRef<THREE.Points>(null!);
  const mousePos = useRef(new THREE.Vector2(0, 0));
  const smoothMouse = useRef(new THREE.Vector2(0, 0));

  const { viewport } = useThree();

  const [positions, basePositions, sizes, opacities] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const base = new Float32Array(count * 3);
    const sz = new Float32Array(count);
    const op = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 2.5 + Math.random() * 3.5;

      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi) - 2;

      pos[i * 3] = x;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = z;
      base[i * 3] = x;
      base[i * 3 + 1] = y;
      base[i * 3 + 2] = z;
      sz[i] = 0.5 + Math.random() * 2;
      op[i] = 0.15 + Math.random() * 0.6;
    }
    return [pos, base, sz, op];
  }, [count]);

  const handlePointerMove = useCallback(
    (e: { clientX: number; clientY: number }) => {
      mousePos.current.set(
        (e.clientX / window.innerWidth) * 2 - 1,
        -(e.clientY / window.innerHeight) * 2 + 1
      );
    },
    []
  );

  useFrame((state, delta) => {
    if (!mesh.current) return;

    smoothMouse.current.lerp(mousePos.current, 0.05);

    const time = state.clock.elapsedTime;
    const posAttr = mesh.current.geometry.attributes
      .position as THREE.BufferAttribute;

    for (let i = 0; i < count; i++) {
      const bx = basePositions[i * 3];
      const by = basePositions[i * 3 + 1];
      const bz = basePositions[i * 3 + 2];

      const drift = Math.sin(time * 0.3 + i * 0.01) * 0.08;
      const driftY = Math.cos(time * 0.2 + i * 0.015) * 0.06;

      const dx = smoothMouse.current.x * viewport.width * 0.15;
      const dy = smoothMouse.current.y * viewport.height * 0.15;
      const dist = Math.sqrt(
        (bx - dx) * (bx - dx) + (by - dy) * (by - dy)
      );
      const influence = Math.max(0, 1 - dist / 4);
      const pushX = influence * (bx - dx) * 0.3;
      const pushY = influence * (by - dy) * 0.3;

      posAttr.array[i * 3] = bx + drift + pushX;
      posAttr.array[i * 3 + 1] = by + driftY + pushY;
      posAttr.array[i * 3 + 2] = bz + Math.sin(time * 0.15 + i * 0.02) * 0.05;
    }
    posAttr.needsUpdate = true;

    mesh.current.rotation.y = time * 0.02;
  });

  return (
    <points ref={mesh} onPointerMove={handlePointerMove as never}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
          count={count}
        />
        <bufferAttribute
          attach="attributes-aSize"
          args={[sizes, 1]}
          count={count}
        />
        <bufferAttribute
          attach="attributes-aOpacity"
          args={[opacities, 1]}
          count={count}
        />
      </bufferGeometry>
      <shaderMaterial
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        vertexShader={`
          attribute float aSize;
          attribute float aOpacity;
          varying float vOpacity;
          void main() {
            vOpacity = aOpacity;
            vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
            gl_PointSize = aSize * (200.0 / -mvPos.z);
            gl_Position = projectionMatrix * mvPos;
          }
        `}
        fragmentShader={`
          varying float vOpacity;
          void main() {
            float d = length(gl_PointCoord - vec2(0.5));
            if (d > 0.5) discard;
            float alpha = smoothstep(0.5, 0.1, d) * vOpacity;
            vec3 color = mix(vec3(0.96, 0.62, 0.04), vec3(0.98, 0.75, 0.14), vOpacity);
            gl_FragColor = vec4(color, alpha * 0.6);
          }
        `}
      />
    </points>
  );
}

function WireframeGeometry() {
  const ref = useRef<THREE.Mesh>(null!);

  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.x = state.clock.elapsedTime * 0.05;
    ref.current.rotation.y = state.clock.elapsedTime * 0.08;
  });

  return (
    <mesh ref={ref} position={[0, 0, -1]}>
      <icosahedronGeometry args={[1.8, 1]} />
      <meshBasicMaterial
        wireframe
        color="#F59E0B"
        transparent
        opacity={0.04}
      />
    </mesh>
  );
}

export default function ParticleField() {
  return (
    <div className="absolute inset-0" style={{ zIndex: 1 }}>
      <Canvas
        camera={{ position: [0, 0, 6], fov: 60 }}
        style={{ background: "transparent" }}
        dpr={[1, 1.5]}
        gl={{ alpha: true, antialias: false }}
        onPointerMove={(e) => {
          const canvas = e.currentTarget;
          const event = new CustomEvent("pointermove", {
            detail: { clientX: e.clientX, clientY: e.clientY },
          });
          canvas.dispatchEvent(event);
        }}
      >
        <Particles />
        <WireframeGeometry />
      </Canvas>
    </div>
  );
}
