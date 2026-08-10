"use client";

import Image from "next/image";
import { Line, useGLTF } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useReducedMotion } from "framer-motion";
import {
  Suspense,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  type MutableRefObject,
} from "react";
import {
  BufferAttribute,
  BufferGeometry,
  CatmullRomCurve3,
  Color,
  DoubleSide,
  Group,
  MathUtils,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  Points,
  PointsMaterial,
  Vector3,
} from "three";

import quadPreview from "@/public/images/crimson-quad-preview-2x.png";
import { useLightweight3D } from "@/components/three/useLightweight3D";

type ScrollMotionState = {
  progress: number;
  velocity: number;
};

const CIRCUIT_POINTS = [
  new Vector3(-4.35, -1.2, 0.35),
  new Vector3(-3.3, 0.85, -0.65),
  new Vector3(-1.15, 1.35, 0.72),
  new Vector3(0.45, 0.18, -1.1),
  new Vector3(3.7, 1.02, 0.08),
  new Vector3(4.25, -1.12, 1.02),
  new Vector3(1.15, -1.42, -0.72),
  new Vector3(-1.5, -0.58, 0.5),
];

const TRACK_BLUE = new Color("#0b2947");
const TRACK_GREY = new Color("#2e3b4b");
const TRACK_RED = new Color("#d8122a");
const TRACK_EMISSIVE = new Color("#071528");

export function RideCircuit() {
  const reduceMotion = useReducedMotion() ?? false;
  const { layerRef, motionState } = useScrollMotion(reduceMotion);
  const lightweight = useLightweight3D();

  return (
    <div
      aria-hidden="true"
      className="scroll-quad-layer ride-circuit-layer"
      data-lightweight={lightweight ? "true" : "false"}
      data-reduced-motion={reduceMotion ? "true" : "false"}
      ref={layerRef}
    >
      {reduceMotion || lightweight ? (
        <LightweightRide />
      ) : (
        <Canvas
          camera={{ fov: 38, position: [0, 0.45, 7.4] }}
          dpr={[0.72, 1.35]}
          frameloop="always"
          gl={{
            alpha: true,
            antialias: false,
            powerPreference: "high-performance",
          }}
          performance={{ max: 1, min: 0.55 }}
        >
          <ambientLight intensity={1.15} />
          <directionalLight color="#ffffff" intensity={3.8} position={[4, 6, 5]} />
          <pointLight color="#f01832" intensity={8} position={[-4, 1.5, 2]} />
          <Suspense fallback={null}>
            <RideScene motionState={motionState} />
          </Suspense>
        </Canvas>
      )}
    </div>
  );
}

function useScrollMotion(reduceMotion: boolean) {
  const layerRef = useRef<HTMLDivElement>(null);
  const motionState = useRef<ScrollMotionState>({ progress: 0, velocity: 0 });

  useLayoutEffect(() => {
    const layer = layerRef.current;

    const writeFallbackPose = (progress: number) => {
      if (!layer) return;

      const phase = progress * Math.PI * 2;
      const x = 50 + Math.sin(phase) * 35;
      const y = 57 + Math.sin(phase * 2 - 0.45) * 17;
      const bank = Math.cos(phase * 2 - 0.45) * 7;

      layer.style.setProperty("--ride-x", `${x.toFixed(2)}vw`);
      layer.style.setProperty("--ride-y", `${y.toFixed(2)}vh`);
      layer.style.setProperty("--ride-bank", `${bank.toFixed(2)}deg`);
      layer.style.setProperty("--ride-depth-scale", `${(0.92 + Math.cos(phase) * 0.1).toFixed(3)}`);
      layer.style.setProperty("--ride-parallax-far", `${(-progress * 3).toFixed(2)}vw`);
      layer.style.setProperty("--ride-parallax-near", `${(-progress * 7).toFixed(2)}vw`);
    };

    if (reduceMotion) {
      motionState.current.progress = 0.18;
      motionState.current.velocity = 0;
      writeFallbackPose(0.18);
      return;
    }

    let frameId: number | null = null;
    let velocityFrameId: number | null = null;
    let latestScrollY = window.scrollY;
    let previousScrollY = latestScrollY;

    const update = () => {
      const scrollableHeight = Math.max(
        1,
        document.documentElement.scrollHeight - window.innerHeight,
      );
      const delta = latestScrollY - previousScrollY;
      const state = motionState.current;

      state.progress = MathUtils.clamp(latestScrollY / scrollableHeight, 0, 1);
      state.velocity = state.velocity * 0.74 + delta * 0.26;
      previousScrollY = latestScrollY;

      writeFallbackPose(state.progress);

      if (velocityFrameId === null) {
        const decayVelocity = () => {
          motionState.current.velocity *= 0.86;
          if (Math.abs(motionState.current.velocity) > 0.08) {
            velocityFrameId = window.requestAnimationFrame(decayVelocity);
          } else {
            motionState.current.velocity = 0;
            velocityFrameId = null;
          }
        };

        velocityFrameId = window.requestAnimationFrame(decayVelocity);
      }

      if (layer) {
        const textHeavy = state.progress > 0.08 && state.progress < 0.91;
        const terrainPulse = Math.sin(state.progress * Math.PI * 7) ** 2;
        const opacity =
          state.progress < 0.075
            ? 0.055
            : textHeavy
              ? 0.072 + terrainPulse * 0.014
              : 0.21;
        layer.style.opacity = String(opacity);
      }

      frameId = null;
    };

    const scheduleUpdate = () => {
      latestScrollY = window.scrollY;
      if (frameId === null) frameId = window.requestAnimationFrame(update);
    };

    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);
    scheduleUpdate();

    return () => {
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      if (frameId !== null) window.cancelAnimationFrame(frameId);
      if (velocityFrameId !== null) window.cancelAnimationFrame(velocityFrameId);
    };
  }, [reduceMotion]);

  return { layerRef, motionState };
}

function RideScene({
  motionState,
}: {
  motionState: MutableRefObject<ScrollMotionState>;
}) {
  const circuit = useMemo(
    () => new CatmullRomCurve3(CIRCUIT_POINTS, true, "centripetal", 0.45),
    [],
  );
  const cameraScratch = useMemo(
    () => ({
      lookAt: new Vector3(),
      point: new Vector3(),
      tangent: new Vector3(),
    }),
    [],
  );

  useFrame((state, delta) => {
    const progress = motionState.current.progress;
    circuit.getPointAt(progress, cameraScratch.point);
    circuit.getTangentAt(progress, cameraScratch.tangent);

    const targetX = cameraScratch.point.x - cameraScratch.tangent.x * 1.18;
    const targetY =
      cameraScratch.point.y - cameraScratch.tangent.y * 0.72 + 0.48;
    const targetZ = cameraScratch.point.z + 6.15;

    state.camera.position.x = MathUtils.damp(state.camera.position.x, targetX, 4.8, delta);
    state.camera.position.y = MathUtils.damp(state.camera.position.y, targetY, 4.8, delta);
    state.camera.position.z = MathUtils.damp(state.camera.position.z, targetZ, 4.4, delta);
    cameraScratch.lookAt
      .copy(cameraScratch.point)
      .addScaledVector(cameraScratch.tangent, 0.78);
    state.camera.lookAt(cameraScratch.lookAt);
  });

  return (
    <>
      <ParallaxTerrain motionState={motionState} />
      <TrackRibbon circuit={circuit} motionState={motionState} />
      <CheckpointPortals circuit={circuit} motionState={motionState} />
      <QuadOnCircuit circuit={circuit} motionState={motionState} />
    </>
  );
}

function TrackRibbon({
  circuit,
  motionState,
}: {
  circuit: CatmullRomCurve3;
  motionState: MutableRefObject<ScrollMotionState>;
}) {
  const materialRef = useRef<MeshStandardMaterial>(null);
  const geometry = useMemo(() => createRibbonGeometry(circuit, 0.39, 168), [circuit]);
  const edges = useMemo(() => createTrackEdges(circuit, 0.4, 168), [circuit]);

  useEffect(() => () => geometry.dispose(), [geometry]);

  useFrame((_, delta) => {
    const material = materialRef.current;
    if (!material) return;

    const progress = motionState.current.progress;
    const target = progress < 0.34 ? TRACK_GREY : progress < 0.68 ? TRACK_BLUE : TRACK_RED;
    material.color.lerp(target, 1 - Math.exp(-delta * 3.2));
    material.emissive.copy(TRACK_EMISSIVE);
    material.emissiveIntensity = 0.24 + Math.abs(motionState.current.velocity) * 0.002;
    material.roughness = progress < 0.34 ? 0.94 : progress < 0.68 ? 0.62 : 0.82;
  });

  return (
    <group>
      <mesh geometry={geometry} position={[0, 0, -0.06]} receiveShadow>
        <meshStandardMaterial
          color="#2e3b4b"
          emissive="#071528"
          metalness={0.08}
          opacity={0.86}
          ref={materialRef}
          roughness={0.9}
          side={DoubleSide}
          transparent
        />
      </mesh>
      <Line color="#ffffff" lineWidth={0.8} opacity={0.34} points={edges.left} transparent />
      <Line color="#f01832" lineWidth={1.15} opacity={0.68} points={edges.right} transparent />
    </group>
  );
}

function CheckpointPortals({
  circuit,
  motionState,
}: {
  circuit: CatmullRomCurve3;
  motionState: MutableRefObject<ScrollMotionState>;
}) {
  return (
    <group>
      {[0.08, 0.28, 0.5, 0.72, 0.91].map((progress, index) => (
        <CheckpointPortal
          circuit={circuit}
          index={index}
          key={progress}
          motionState={motionState}
          progress={progress}
        />
      ))}
    </group>
  );
}

function CheckpointPortal({
  circuit,
  index,
  motionState,
  progress,
}: {
  circuit: CatmullRomCurve3;
  index: number;
  motionState: MutableRefObject<ScrollMotionState>;
  progress: number;
}) {
  const groupRef = useRef<Group>(null);
  const materialRef = useRef<MeshBasicMaterial>(null);
  const placement = useMemo(() => {
    const point = circuit.getPointAt(progress);
    const tangent = circuit.getTangentAt(progress);
    return {
      angle: Math.atan2(tangent.y, tangent.x) - Math.PI / 2,
      point,
    };
  }, [circuit, progress]);

  useFrame((state, delta) => {
    const portal = groupRef.current;
    const material = materialRef.current;
    if (!portal || !material) return;

    const rawDistance = Math.abs(motionState.current.progress - progress);
    const distance = Math.min(rawDistance, 1 - rawDistance);
    const active = 1 - MathUtils.clamp(distance / 0.11, 0, 1);
    const pulse = Math.sin(state.clock.elapsedTime * 2.4 + index) * 0.035;
    const targetScale = 0.78 + active * 0.62 + pulse;

    portal.scale.setScalar(MathUtils.damp(portal.scale.x, targetScale, 7, delta));
    portal.rotation.y = MathUtils.damp(
      portal.rotation.y,
      active * 0.16 * (index % 2 === 0 ? 1 : -1),
      5,
      delta,
    );
    material.opacity = MathUtils.damp(material.opacity, 0.18 + active * 0.72, 6, delta);
  });

  return (
    <group
      position={placement.point}
      ref={groupRef}
      rotation={[0, 0, placement.angle]}
      scale={0.78}
    >
      <mesh rotation={[0, 0, -0.12]}>
        <torusGeometry args={[0.88, 0.055, 8, 48, Math.PI * 1.65]} />
        <meshBasicMaterial
          color={index % 2 === 0 ? "#f01832" : "#ffffff"}
          opacity={0.22}
          ref={materialRef}
          transparent
        />
      </mesh>
      <mesh rotation={[0, 0, Math.PI * 0.78]} scale={0.72}>
        <torusGeometry args={[0.88, 0.025, 7, 42, Math.PI * 1.2]} />
        <meshBasicMaterial color="#3f83bd" opacity={0.5} transparent />
      </mesh>
      <pointLight color="#f01832" intensity={3.2} position={[0, 0, 0.35]} />
    </group>
  );
}

function QuadOnCircuit({
  circuit,
  motionState,
}: {
  circuit: CatmullRomCurve3;
  motionState: MutableRefObject<ScrollMotionState>;
}) {
  const rigRef = useRef<Group>(null);
  const shadowRef = useRef<Mesh<BufferGeometry, MeshBasicMaterial>>(null);
  const shadowMaterialRef = useRef<MeshBasicMaterial>(null);
  const dustIntensity = useRef(0.12);
  const { scene } = useGLTF("/models/crimson-quad.glb");
  const model = useMemo(() => scene.clone(true), [scene]);
  const scratch = useMemo(
    () => ({
      nextTangent: new Vector3(),
      point: new Vector3(),
      previousTangent: new Vector3(),
      tangent: new Vector3(),
    }),
    [],
  );

  useLayoutEffect(() => {
    model.traverse((child) => {
      if ("isMesh" in child && child.isMesh) {
        child.castShadow = false;
        child.receiveShadow = false;
      }
    });
  }, [model]);

  useFrame((_, delta) => {
    const rig = rigRef.current;
    if (!rig) return;

    const state = motionState.current;
    const progress = MathUtils.clamp(state.progress, 0, 0.9999);
    const previousProgress = (progress - 0.008 + 1) % 1;
    const nextProgress = (progress + 0.008) % 1;

    circuit.getPointAt(progress, scratch.point);
    circuit.getTangentAt(progress, scratch.tangent);
    circuit.getTangentAt(previousProgress, scratch.previousTangent);
    circuit.getTangentAt(nextProgress, scratch.nextTangent);

    const turn =
      scratch.previousTangent.x * scratch.nextTangent.y -
      scratch.previousTangent.y * scratch.nextTangent.x;
    const slope = MathUtils.clamp(
      Math.atan2(scratch.tangent.y, Math.abs(scratch.tangent.x) + 0.35),
      -0.58,
      0.58,
    );
    const targetScale = MathUtils.mapLinear(scratch.point.z, -1.1, 1.1, 0.84, 1.13);

    rig.position.x = MathUtils.damp(rig.position.x, scratch.point.x, 7.2, delta);
    rig.position.y = MathUtils.damp(rig.position.y, scratch.point.y, 7.2, delta);
    rig.position.z = MathUtils.damp(rig.position.z, scratch.point.z, 6, delta);
    rig.rotation.x = MathUtils.damp(rig.rotation.x, scratch.tangent.z * 0.12, 5, delta);
    rig.rotation.y = MathUtils.damp(
      rig.rotation.y,
      -0.48 - scratch.tangent.z * 0.38,
      5,
      delta,
    );
    rig.rotation.z = MathUtils.damp(
      rig.rotation.z,
      MathUtils.clamp(slope * 0.24 - turn * 2.6, -0.26, 0.26),
      7.5,
      delta,
    );
    rig.scale.setScalar(MathUtils.damp(rig.scale.x, targetScale, 5.5, delta));

    dustIntensity.current = MathUtils.damp(
      dustIntensity.current,
      MathUtils.clamp(Math.abs(turn) * 10 + Math.abs(state.velocity) * 0.018, 0.08, 1),
      6,
      delta,
    );
    if (shadowRef.current) {
      shadowRef.current.position.x = MathUtils.damp(
        shadowRef.current.position.x,
        -scratch.tangent.z * 0.18,
        5,
        delta,
      );
      shadowRef.current.scale.x = 1.2 + Math.abs(scratch.point.z) * 0.14;
    }

    if (shadowMaterialRef.current) {
      shadowMaterialRef.current.opacity = MathUtils.clamp(0.24 - scratch.point.z * 0.045, 0.13, 0.3);
    }
  });

  return (
    <group position={[-4.35, -1.2, 0.35]} ref={rigRef}>
      <mesh position={[0, -0.53, 0.1]} ref={shadowRef} scale={[1.2, 0.28, 1]}>
        <circleGeometry args={[0.82, 28]} />
        <meshBasicMaterial
          color="#06111f"
          depthWrite={false}
          opacity={0.24}
          ref={shadowMaterialRef}
          transparent
        />
      </mesh>
      <primitive object={model} rotation={[0.02, -0.58, 0]} scale={1.24} />
      <DustTrail intensityRef={dustIntensity} />
      <pointLight color="#f01832" intensity={5.5} position={[-0.8, 0.15, 1.15]} />
    </group>
  );
}

function DustTrail({
  intensityRef,
}: {
  intensityRef: MutableRefObject<number>;
}) {
  const count = 72;
  const pointsRef = useRef<Points>(null);
  const materialRef = useRef<PointsMaterial>(null);
  const positions = useMemo(() => {
    const values = new Float32Array(count * 3);
    let seed = 19;
    const random = () => {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    };

    for (let index = 0; index < count; index += 1) {
      values[index * 3] = -0.4 - random() * 2.25;
      values[index * 3 + 1] = -0.34 + random() * 0.28;
      values[index * 3 + 2] = (random() - 0.5) * 0.65;
    }

    return values;
  }, []);

  useFrame((state, delta) => {
    const points = pointsRef.current;
    const material = materialRef.current;
    if (!points || !material) return;

    const intensity = intensityRef.current;
    const attribute = points.geometry.getAttribute("position") as BufferAttribute;

    for (let index = 0; index < count; index += 1) {
      const offset = index * 3;
      attribute.array[offset] -= delta * (0.28 + intensity * 0.9);
      attribute.array[offset + 1] +=
        Math.sin(state.clock.elapsedTime * 1.8 + index * 1.7) * delta * 0.018;
      if (attribute.array[offset] < -2.8) attribute.array[offset] = -0.35;
    }

    attribute.needsUpdate = true;
    material.opacity = MathUtils.damp(material.opacity, 0.04 + intensity * 0.52, 6, delta);
    material.size = MathUtils.damp(material.size, 0.06 + intensity * 0.065, 5, delta);
  });

  return (
    <points position={[-0.4, 0, -0.04]} ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color="#94a3b8"
        depthWrite={false}
        opacity={0.08}
        ref={materialRef}
        size={0.06}
        sizeAttenuation
        transparent
      />
    </points>
  );
}

function ParallaxTerrain({
  motionState,
}: {
  motionState: MutableRefObject<ScrollMotionState>;
}) {
  const farRef = useRef<Group>(null);
  const middleRef = useRef<Group>(null);

  useFrame((_, delta) => {
    const progress = motionState.current.progress;

    if (farRef.current) {
      farRef.current.position.x = MathUtils.damp(
        farRef.current.position.x,
        -Math.sin(progress * Math.PI * 2) * 0.38,
        2.2,
        delta,
      );
      farRef.current.position.y = MathUtils.damp(
        farRef.current.position.y,
        -0.42 + Math.cos(progress * Math.PI * 2) * 0.09,
        2.2,
        delta,
      );
    }

    if (middleRef.current) {
      middleRef.current.position.x = MathUtils.damp(
        middleRef.current.position.x,
        Math.sin(progress * Math.PI * 2) * 0.65,
        2.8,
        delta,
      );
    }
  });

  return (
    <>
      <group position={[0, -0.42, -3.1]} ref={farRef}>
        {[-4.4, -2.7, -0.9, 1.25, 3.1, 4.6].map((x, index) => (
          <mesh key={x} position={[x, -1.3 + (index % 2) * 0.18, 0]} scale={[1.3, 1, 0.45]}>
            <coneGeometry args={[1.05, 2.15 + (index % 3) * 0.32, 3]} />
            <meshBasicMaterial
              color={index % 2 === 0 ? "#0b2947" : "#2e3b4b"}
              opacity={0.28}
              transparent
            />
          </mesh>
        ))}
      </group>
      <group position={[0, -1.75, -1.9]} ref={middleRef}>
        {[-3.8, -1.9, 0.4, 2.4, 4].map((x, index) => (
          <mesh key={x} position={[x, (index % 2) * 0.12, 0]} scale={[1.2, 0.44, 0.35]}>
            <dodecahedronGeometry args={[0.6, 0]} />
            <meshBasicMaterial color="#06111f" opacity={0.42} transparent />
          </mesh>
        ))}
      </group>
    </>
  );
}

function LightweightRide() {
  return (
    <div className="ride-fallback">
      <div className="ride-fallback-mountains ride-fallback-mountains-far" />
      <div className="ride-fallback-mountains ride-fallback-mountains-near" />
      <svg
        className="ride-fallback-track"
        preserveAspectRatio="none"
        viewBox="0 0 100 100"
      >
        <path
          className="ride-fallback-track-shadow"
          d="M5 65 C14 18 42 14 53 43 S80 89 94 48 C83 8 38 94 5 65Z"
        />
        <path
          className="ride-fallback-track-line"
          d="M5 65 C14 18 42 14 53 43 S80 89 94 48 C83 8 38 94 5 65Z"
        />
      </svg>
      <div className="ride-fallback-quad">
        <Image
          alt=""
          className="h-auto w-full mix-blend-screen"
          loading="lazy"
          quality={85}
          sizes="(max-width: 760px) 34vw, 260px"
          src={quadPreview}
        />
        <span className="ride-fallback-shadow" />
      </div>
    </div>
  );
}

function createRibbonGeometry(
  circuit: CatmullRomCurve3,
  halfWidth: number,
  segments: number,
) {
  const geometry = new BufferGeometry();
  const vertices = new Float32Array((segments + 1) * 2 * 3);
  const indices: number[] = [];
  const point = new Vector3();
  const tangent = new Vector3();
  const side = new Vector3();

  for (let index = 0; index <= segments; index += 1) {
    const progress = index / segments;
    circuit.getPointAt(progress, point);
    circuit.getTangentAt(progress, tangent);
    side.set(-tangent.y, tangent.x, 0).normalize().multiplyScalar(halfWidth);

    const vertexOffset = index * 6;
    vertices[vertexOffset] = point.x + side.x;
    vertices[vertexOffset + 1] = point.y + side.y;
    vertices[vertexOffset + 2] = point.z + side.z;
    vertices[vertexOffset + 3] = point.x - side.x;
    vertices[vertexOffset + 4] = point.y - side.y;
    vertices[vertexOffset + 5] = point.z - side.z;

    if (index < segments) {
      const left = index * 2;
      const right = left + 1;
      const nextLeft = left + 2;
      const nextRight = left + 3;
      indices.push(left, right, nextLeft, right, nextRight, nextLeft);
    }
  }

  geometry.setAttribute("position", new BufferAttribute(vertices, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();

  return geometry;
}

function createTrackEdges(
  circuit: CatmullRomCurve3,
  halfWidth: number,
  segments: number,
) {
  const left: Vector3[] = [];
  const right: Vector3[] = [];
  const point = new Vector3();
  const tangent = new Vector3();
  const side = new Vector3();

  for (let index = 0; index <= segments; index += 1) {
    const progress = index / segments;
    circuit.getPointAt(progress, point);
    circuit.getTangentAt(progress, tangent);
    side.set(-tangent.y, tangent.x, 0).normalize().multiplyScalar(halfWidth);
    left.push(point.clone().add(side));
    right.push(point.clone().sub(side));
  }

  return { left, right };
}
