"use client";

import { Suspense, useLayoutEffect, useMemo, useRef } from "react";
import { useGLTF } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useReducedMotion } from "framer-motion";
import { Group, MathUtils } from "three";

type ScrollMotionState = {
  progress: number;
  velocity: number;
};

export function ScrollQuad() {
  const reduceMotion = useReducedMotion() ?? false;
  const motionState = useRef<ScrollMotionState>({
    progress: 0,
    velocity: 0,
  });

  useLayoutEffect(() => {
    if (reduceMotion) return;

    let frameId: number | null = null;
    let latestScrollY = window.scrollY;
    let previousScrollY = latestScrollY;

    const updateScrollState = () => {
      const scrollableHeight = Math.max(
        1,
        document.documentElement.scrollHeight - window.innerHeight,
      );
      const delta = latestScrollY - previousScrollY;
      const state = motionState.current;

      state.progress = Math.min(
        1,
        Math.max(0, latestScrollY / scrollableHeight),
      );
      state.velocity = state.velocity * 0.76 + delta * 0.24;
      previousScrollY = latestScrollY;
      frameId = null;
    };

    const scheduleUpdate = () => {
      latestScrollY = window.scrollY;
      if (frameId === null) {
        frameId = window.requestAnimationFrame(updateScrollState);
      }
    };

    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);
    scheduleUpdate();

    return () => {
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      if (frameId !== null) window.cancelAnimationFrame(frameId);
    };
  }, [reduceMotion]);

  return (
    <div
      aria-hidden="true"
      className="scroll-quad-layer"
      data-reduced-motion={reduceMotion ? "true" : "false"}
    >
      <Canvas
        camera={{ fov: 37, position: [0, 0.35, 7.2] }}
        dpr={[0.65, 1.2]}
        frameloop={reduceMotion ? "demand" : "always"}
        gl={{ alpha: true, antialias: false, powerPreference: "high-performance" }}
        performance={{ max: 1, min: 0.55 }}
      >
        <ambientLight intensity={1.8} />
        <directionalLight color="#ffffff" intensity={4.4} position={[3, 5, 5]} />
        <pointLight color="#f01832" intensity={12} position={[-4, 1, 2]} />
        <Suspense fallback={null}>
          <ScrollQuadRig
            motionState={motionState}
            reduceMotion={reduceMotion}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}

function ScrollQuadRig({
  motionState,
  reduceMotion,
}: {
  motionState: React.MutableRefObject<ScrollMotionState>;
  reduceMotion: boolean;
}) {
  const group = useRef<Group>(null);
  const { scene } = useGLTF("/models/crimson-quad.glb");
  const model = useMemo(() => scene.clone(true), [scene]);

  useLayoutEffect(() => {
    model.traverse((child) => {
      if ("isMesh" in child && child.isMesh) {
        child.castShadow = false;
        child.receiveShadow = false;
      }
    });
  }, [model]);

  useFrame((state, delta) => {
    const rig = group.current;
    if (!rig) return;

    if (reduceMotion) {
      rig.position.set(0, -0.95, 0);
      rig.rotation.set(0.03, -0.58, 0);
      return;
    }

    const { progress, velocity } = motionState.current;
    const phase = (progress * 2.15) % 1;
    const viewportWidth = state.viewport.width;
    const startX = -viewportWidth * 0.62;
    const endX = viewportWidth * 0.62;
    const targetX = MathUtils.lerp(startX, endX, phase);
    const targetY =
      -0.95 + Math.sin(phase * Math.PI) * 0.3 - Math.min(0.18, Math.abs(velocity) * 0.008);
    const targetZ = Math.cos(progress * Math.PI * 4.3) * 0.42;
    const targetRotationX = 0.025 + Math.sin(progress * Math.PI * 8) * 0.04;
    const targetRotationY = -0.62 + (phase - 0.5) * 0.42;
    const targetRotationZ = Math.max(-0.08, Math.min(0.08, velocity * -0.003));

    rig.position.x = MathUtils.damp(rig.position.x, targetX, 6.5, delta);
    rig.position.y = MathUtils.damp(rig.position.y, targetY, 6.5, delta);
    rig.position.z = MathUtils.damp(rig.position.z, targetZ, 5, delta);
    rig.rotation.x = MathUtils.damp(
      rig.rotation.x,
      targetRotationX,
      5,
      delta,
    );
    rig.rotation.y = MathUtils.damp(
      rig.rotation.y,
      targetRotationY,
      5,
      delta,
    );
    rig.rotation.z = MathUtils.damp(
      rig.rotation.z,
      targetRotationZ,
      7,
      delta,
    );
  });

  return (
    <group ref={group} position={[-5, -0.95, 0]}>
      <primitive object={model} scale={1.28} />
    </group>
  );
}

useGLTF.preload("/models/crimson-quad.glb");
