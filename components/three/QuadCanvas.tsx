"use client";

import Image from "next/image";
import { Suspense, useLayoutEffect, useMemo, useRef } from "react";
import {
  ContactShadows,
  Environment,
  Float,
  Html,
  Lightformer,
  OrbitControls,
  useGLTF,
} from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useReducedMotion } from "framer-motion";
import {
  ACESFilmicToneMapping,
  Group,
  MathUtils,
  Mesh,
  MeshStandardMaterial,
  SRGBColorSpace,
} from "three";

import { useLightweight3D } from "@/components/three/useLightweight3D";
import quadPreview from "@/public/images/crimson-quad-cutout-2x-v2.png";

const SCENE_COLORS = {
  blueDeep: "#06111f",
  blueLight: "#3f83bd",
  greyDeep: "#2e3b4b",
  greyLight: "#e3e8ee",
  red: "#f01832",
  redDeep: "#d8122a",
  white: "#ffffff",
} as const;

type QuadCanvasProps = {
  ariaLabel: string;
  className?: string;
  loadingLabel: string;
  modelUrl?: string;
  unavailableLabel: string;
};

type QuadRigProps = {
  modelUrl?: string;
  reduceMotion: boolean;
};

export function QuadCanvas({
  ariaLabel,
  className,
  loadingLabel,
  modelUrl,
  unavailableLabel,
}: QuadCanvasProps) {
  const reduceMotion = useReducedMotion() ?? false;
  // Keep the same interactive hero on phones. The hook still falls back for
  // data-saving and genuinely slow network modes, but no longer for screen size.
  const lightweight = useLightweight3D(0);

  if (reduceMotion || lightweight) {
    return <QuadCanvasFallback ariaLabel={ariaLabel} className={className} />;
  }

  return (
    <div
      aria-label={ariaLabel}
      className={className}
      role="img"
    >
      <Canvas
        camera={{ fov: 36, position: [4.8, 2.25, 6.6] }}
        dpr={[1, 1.5]}
        fallback={<p>{unavailableLabel}</p>}
        frameloop={reduceMotion ? "demand" : "always"}
        gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
        onCreated={({ gl }) => {
          gl.outputColorSpace = SRGBColorSpace;
          gl.toneMapping = ACESFilmicToneMapping;
          gl.toneMappingExposure = 0.94;
        }}
        performance={{ max: 1, min: 0.5 }}
      >
        <hemisphereLight args={[SCENE_COLORS.white, "#5f4c38", 0.9]} />
        <directionalLight
          color="#fff4dc"
          intensity={2.35}
          position={[5.5, 7.5, 4.5]}
        />
        <spotLight
          angle={0.52}
          color={SCENE_COLORS.blueLight}
          intensity={7.5}
          penumbra={0.95}
          position={[-4.5, 4.2, -2]}
        />
        <pointLight
          color={SCENE_COLORS.red}
          intensity={4.5}
          position={[-3.4, 0.5, 2.4]}
        />

        <Environment resolution={96}>
          <Lightformer
            color="#fff5dc"
            form="rect"
            intensity={2.35}
            position={[3, 5, 4]}
            rotation={[-Math.PI / 4, 0, 0]}
            scale={[5, 5, 1]}
          />
          <Lightformer
            color={SCENE_COLORS.blueLight}
            form="rect"
            intensity={1.25}
            position={[-4, 2, -4]}
            rotation={[0, Math.PI / 3, 0]}
            scale={[3, 3, 1]}
          />
          <Lightformer
            color={SCENE_COLORS.red}
            form="ring"
            intensity={0.8}
            position={[0, 1, 5]}
            scale={2.5}
          />
        </Environment>

        <NaturalTerrainStage reduceMotion={reduceMotion} />

        <Suspense fallback={<ModelLoader label={loadingLabel} />}>
          <QuadRig modelUrl={modelUrl} reduceMotion={reduceMotion} />
        </Suspense>

        <ContactShadows
          blur={3.2}
          far={4.5}
          opacity={0.36}
          position={[0, -1.04, 0]}
          scale={7.6}
        />
        <OrbitControls
          autoRotate={!reduceMotion}
          autoRotateSpeed={0.62}
          dampingFactor={0.075}
          enableDamping
          enablePan={false}
          enableZoom={false}
          maxPolarAngle={Math.PI / 2.08}
          minPolarAngle={Math.PI / 3.3}
          target={[0, -0.08, 0]}
        />
      </Canvas>
    </div>
  );
}

function QuadCanvasFallback({
  ariaLabel,
  className,
}: {
  ariaLabel: string;
  className?: string;
}) {
  return (
    <div
      aria-label={ariaLabel}
      className={`${className ?? ""} hero-quad-fallback`}
      role="img"
    >
      <div className="hero-quad-fallback-stage">
        <span className="hero-quad-fallback-ring hero-quad-fallback-ring-red" />
        <span className="hero-quad-fallback-ring hero-quad-fallback-ring-white" />
        <span className="hero-quad-fallback-track" />
        <Image
          alt=""
          className="hero-quad-fallback-image"
          loading="eager"
          quality={85}
          sizes="(max-width: 760px) 88vw, 640px"
          src={quadPreview}
        />
      </div>
    </div>
  );
}

function NaturalTerrainStage({ reduceMotion }: { reduceMotion: boolean }) {
  const dustRef = useRef<Group>(null);
  const trackRef = useRef<Group>(null);

  useFrame((state, delta) => {
    if (reduceMotion) return;

    if (dustRef.current) {
      dustRef.current.rotation.y += delta * 0.045;
      dustRef.current.position.x = Math.sin(state.clock.elapsedTime * 0.22) * 0.1;
    }

    if (trackRef.current) {
      trackRef.current.rotation.z = MathUtils.damp(
        trackRef.current.rotation.z,
        -0.2 + state.pointer.x * 0.025,
        2,
        delta,
      );
    }
  });

  return (
    <group position={[0, -0.02, -0.25]}>
      <mesh
        position={[0, -1.06, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <circleGeometry args={[3.65, 64]} />
        <meshStandardMaterial
          color="#cfbd99"
          metalness={0.02}
          roughness={0.98}
        />
      </mesh>

      <mesh position={[0, -1.045, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[3.22, 3.3, 64]} />
        <meshBasicMaterial color={SCENE_COLORS.red} opacity={0.72} transparent />
      </mesh>

      <group position={[0.2, -1, 0.05]} ref={trackRef} rotation={[-Math.PI / 2, 0, -0.2]}>
        <mesh>
          <torusGeometry args={[2.15, 0.055, 10, 96, Math.PI * 1.44]} />
          <meshStandardMaterial color="#8d7758" roughness={1} />
        </mesh>
        <mesh position={[0.25, 0, 0.012]} scale={0.78}>
          <torusGeometry args={[2.15, 0.034, 10, 96, Math.PI * 1.38]} />
          <meshStandardMaterial color="#b49a72" roughness={1} />
        </mesh>
      </group>

      {[
        [-2.55, -0.72, -1.45, 0.34],
        [2.35, -0.74, -1.38, 0.31],
        [2.7, -0.86, 0.85, 0.2],
      ].map(([x, y, z, scale], index) => (
        <mesh
          key={`${x}-${z}`}
          position={[x, y, z]}
          rotation={[index * 0.35, index * 0.7, index * 0.22]}
          scale={scale}
        >
          <dodecahedronGeometry args={[1, 0]} />
          <meshStandardMaterial color={index % 2 ? "#685646" : "#7b6955"} roughness={0.94} />
        </mesh>
      ))}

      <group position={[0, -0.25, -1.6]} ref={dustRef}>
        {Array.from({ length: 10 }, (_, index) => {
          const angle = (index / 10) * Math.PI * 2;
          const radius = 2.25 + (index % 4) * 0.22;
          return (
            <mesh
              key={index}
              position={[
                Math.cos(angle) * radius,
                -0.25 + (index % 5) * 0.16,
                Math.sin(angle) * radius * 0.28,
              ]}
              scale={0.018 + (index % 3) * 0.009}
            >
              <sphereGeometry args={[1, 8, 8]} />
              <meshBasicMaterial color="#b79d75" opacity={0.24} transparent />
            </mesh>
          );
        })}
      </group>
    </group>
  );
}

function QuadRig({ modelUrl, reduceMotion }: QuadRigProps) {
  const group = useRef<Group>(null);

  useFrame((state, delta) => {
    if (!group.current || reduceMotion) return;

    const elapsed = state.clock.elapsedTime;
    const targetX = state.pointer.y * 0.075 + Math.sin(elapsed * 1.25) * 0.012;
    const targetY =
      state.pointer.x * 0.16 + Math.sin(elapsed * 0.65) * 0.055;
    const targetZ = state.pointer.x * -0.02 + Math.sin(elapsed * 0.9) * 0.012;

    group.current.rotation.x = MathUtils.damp(
      group.current.rotation.x,
      targetX,
      4,
      delta,
    );
    group.current.rotation.y = MathUtils.damp(
      group.current.rotation.y,
      targetY,
      4,
      delta,
    );
    group.current.rotation.z = MathUtils.damp(
      group.current.rotation.z,
      targetZ,
      4,
      delta,
    );
    group.current.position.y = MathUtils.damp(
      group.current.position.y,
      -0.14 + Math.sin(elapsed * 1.75) * 0.035,
      4,
      delta,
    );
  });

  return (
    <Float
      floatingRange={reduceMotion ? [0, 0] : [-0.14, 0.14]}
      rotationIntensity={reduceMotion ? 0 : 0.16}
      speed={reduceMotion ? 0 : 2.05}
    >
      <group ref={group} position={[0, -0.14, 0]}>
        {modelUrl ? <LoadedQuad modelUrl={modelUrl} /> : <ProceduralQuad />}
      </group>
    </Float>
  );
}

function LoadedQuad({ modelUrl }: { modelUrl: string }) {
  const { scene } = useGLTF(modelUrl);
  const model = useMemo(() => scene.clone(true), [scene]);

  useLayoutEffect(() => {
    model.traverse((child) => {
      if (child instanceof Mesh) {
        child.castShadow = false;
        child.receiveShadow = false;

        const tuneMaterial = (source: MeshStandardMaterial) => {
          const material = source.clone();
          material.envMapIntensity = 0.82;
          material.metalness = material.metalnessMap
            ? Math.min(material.metalness, 0.82)
            : Math.min(material.metalness, 0.16);
          material.roughness = material.roughnessMap
            ? Math.max(material.roughness, 0.82)
            : Math.max(material.roughness, 0.58);

          if (material.map) material.map.anisotropy = 8;
          if (material.normalMap) material.normalMap.anisotropy = 8;
          if (material.roughnessMap) material.roughnessMap.anisotropy = 8;

          material.needsUpdate = true;
          return material;
        };

        child.material = Array.isArray(child.material)
          ? child.material.map((material) =>
              material instanceof MeshStandardMaterial ? tuneMaterial(material) : material,
            )
          : child.material instanceof MeshStandardMaterial
            ? tuneMaterial(child.material)
            : child.material;
      }
    });
  }, [model]);

  return <primitive object={model} rotation={[0.015, -0.62, 0]} scale={1.62} />;
}

function ProceduralQuad() {
  const wheelPositions: [number, number, number][] = [
    [-1.05, -0.58, 0.92],
    [1.05, -0.58, 0.92],
    [-1.05, -0.58, -0.92],
    [1.05, -0.58, -0.92],
  ];

  return (
    <group rotation={[0, -0.55, 0]} scale={1.1}>
      {wheelPositions.map((position) => (
        <mesh
          castShadow
          key={position.join(":")}
          position={position}
          rotation={[0, 0, Math.PI / 2]}
        >
          <cylinderGeometry args={[0.48, 0.48, 0.35, 24]} />
          <meshStandardMaterial
            color={SCENE_COLORS.greyDeep}
            metalness={0.15}
            roughness={0.82}
          />
        </mesh>
      ))}

      <mesh castShadow position={[0, 0.05, 0]}>
        <boxGeometry args={[1.65, 0.42, 1.9]} />
        <meshStandardMaterial
          color={SCENE_COLORS.red}
          metalness={0.46}
          roughness={0.3}
        />
      </mesh>
      <mesh castShadow position={[0, 0.46, -0.36]} rotation={[-0.2, 0, 0]}>
        <boxGeometry args={[0.82, 0.36, 0.92]} />
        <meshStandardMaterial
          color={SCENE_COLORS.blueDeep}
          metalness={0.28}
          roughness={0.46}
        />
      </mesh>
      <mesh castShadow position={[0, 0.48, 0.82]} rotation={[0.2, 0, 0]}>
        <boxGeometry args={[1.42, 0.24, 0.52]} />
        <meshStandardMaterial
          color={SCENE_COLORS.redDeep}
          metalness={0.42}
          roughness={0.32}
        />
      </mesh>
      <mesh castShadow position={[0, 0.84, 0.46]} rotation={[0.22, 0, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 1.35, 12]} />
        <meshStandardMaterial
          color={SCENE_COLORS.greyLight}
          metalness={0.9}
          roughness={0.2}
        />
      </mesh>
      <mesh castShadow position={[0, 0.83, -0.58]}>
        <boxGeometry args={[0.72, 0.16, 0.9]} />
        <meshStandardMaterial color={SCENE_COLORS.greyDeep} roughness={0.66} />
      </mesh>
    </group>
  );
}

function ModelLoader({ label }: { label: string }) {
  return (
    <Html center>
      <div className="rounded-full border border-white/20 bg-[var(--color-blue-deep)]/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-white backdrop-blur">
        {label}
      </div>
    </Html>
  );
}

useGLTF.preload("/models/crimson-quad.glb");
