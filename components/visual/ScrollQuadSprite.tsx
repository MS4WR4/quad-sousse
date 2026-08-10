"use client";

import Image from "next/image";
import { useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useLayoutEffect, useRef } from "react";

import quadCutout from "@/public/images/crimson-quad-cutout-2x-v2.png";

type QuadPose = {
  progress: number;
  x: number;
  y: number;
  z: number;
  scale: number;
  rotate: number;
  rotateX: number;
  rotateY: number;
  opacity: number;
};

type RenderedPose = Omit<QuadPose, "progress">;

const QUAD_POSES: QuadPose[] = [
  { progress: 0, x: 77, y: 55, z: 80, scale: 1.05, rotate: -2, rotateX: 2, rotateY: -8, opacity: 1 },
  { progress: 0.1, x: 79, y: 18, z: 25, scale: 0.72, rotate: -5, rotateX: 4, rotateY: 8, opacity: 0.88 },
  { progress: 0.2, x: 16, y: 20, z: -20, scale: 0.62, rotate: 3, rotateX: -2, rotateY: -11, opacity: 0.68 },
  { progress: 0.31, x: 75, y: 45, z: 20, scale: 0.7, rotate: -3, rotateX: 3, rotateY: 10, opacity: 0.72 },
  { progress: 0.41, x: 66, y: 70, z: -65, scale: 0.54, rotate: 2, rotateX: -2, rotateY: -7, opacity: 0.16 },
  { progress: 0.5, x: 81, y: 17, z: 15, scale: 0.62, rotate: 5, rotateX: -3, rotateY: -10, opacity: 0.78 },
  { progress: 0.61, x: 19, y: 45, z: 5, scale: 0.65, rotate: -3, rotateX: 2, rotateY: 11, opacity: 0.74 },
  { progress: 0.7, x: 50, y: 73, z: -75, scale: 0.55, rotate: 1, rotateX: -2, rotateY: 0, opacity: 0.17 },
  { progress: 0.8, x: 25, y: 28, z: 8, scale: 0.57, rotate: -4, rotateX: 3, rotateY: -10, opacity: 0.72 },
  { progress: 0.84, x: 50, y: 74, z: -70, scale: 0.48, rotate: 0, rotateX: 0, rotateY: 0, opacity: 0.14 },
  { progress: 0.9, x: 78, y: 82, z: -5, scale: 0.57, rotate: 3, rotateX: -2, rotateY: 9, opacity: 0.66 },
  { progress: 1, x: 50, y: 72, z: -35, scale: 0.64, rotate: 0, rotateX: 0, rotateY: 0, opacity: 0.32 },
];

const PARTICLES = [
  { x: 7, y: 22, size: 9, drift: 26, phase: 0.2, color: "red" },
  { x: 17, y: 76, size: 6, drift: 31, phase: 1.7, color: "blue" },
  { x: 33, y: 16, size: 7, drift: 19, phase: 2.9, color: "grey" },
  { x: 48, y: 82, size: 10, drift: 34, phase: 0.9, color: "red" },
  { x: 64, y: 26, size: 6, drift: 24, phase: 2.2, color: "blue" },
  { x: 77, y: 74, size: 8, drift: 29, phase: 3.6, color: "grey" },
  { x: 88, y: 18, size: 5, drift: 36, phase: 1.2, color: "red" },
  { x: 94, y: 59, size: 9, drift: 21, phase: 4.1, color: "blue" },
] as const;

function smoothStep(value: number) {
  return value * value * (3 - 2 * value);
}

function mix(start: number, end: number, amount: number) {
  return start + (end - start) * amount;
}

function getPose(progress: number): RenderedPose {
  let poseIndex = QUAD_POSES.findIndex((pose) => pose.progress >= progress);

  if (poseIndex <= 0) {
    const { progress: _progress, ...pose } = QUAD_POSES[0];
    void _progress;
    return pose;
  }

  if (poseIndex === -1) poseIndex = QUAD_POSES.length - 1;

  const start = QUAD_POSES[poseIndex - 1];
  const end = QUAD_POSES[poseIndex];
  const sectionProgress = (progress - start.progress) / (end.progress - start.progress);
  const eased = smoothStep(Math.min(1, Math.max(0, sectionProgress)));

  return {
    x: mix(start.x, end.x, eased),
    y: mix(start.y, end.y, eased),
    z: mix(start.z, end.z, eased),
    scale: mix(start.scale, end.scale, eased),
    rotate: mix(start.rotate, end.rotate, eased),
    rotateX: mix(start.rotateX, end.rotateX, eased),
    rotateY: mix(start.rotateY, end.rotateY, eased),
    opacity: mix(start.opacity, end.opacity, eased),
  };
}

function quadTransform(pose: RenderedPose, momentum = 0) {
  const momentumTilt = Math.max(-5, Math.min(5, momentum));

  return `translate3d(${pose.x.toFixed(2)}vw, ${pose.y.toFixed(2)}vh, ${pose.z.toFixed(1)}px) translate(-50%, -50%) rotateX(${pose.rotateX.toFixed(2)}deg) rotateY(${(pose.rotateY + momentumTilt).toFixed(2)}deg) rotateZ(${(pose.rotate - momentumTilt * 0.24).toFixed(2)}deg) scale(${pose.scale.toFixed(3)})`;
}

export function ScrollQuadSprite() {
  const reduceMotion = useReducedMotion() ?? false;
  const pathname = usePathname();
  const mainQuadRef = useRef<HTMLDivElement>(null);
  const cloneOneRef = useRef<HTMLDivElement>(null);
  const cloneTwoRef = useRef<HTMLDivElement>(null);
  const shadowRef = useRef<HTMLSpanElement>(null);
  const particleRefs = useRef<Array<HTMLSpanElement | null>>([]);

  useLayoutEffect(() => {
    if (pathname.startsWith("/booking")) return;

    const mainQuad = mainQuadRef.current;
    const cloneOne = cloneOneRef.current;
    const cloneTwo = cloneTwoRef.current;
    const shadow = shadowRef.current;

    if (!mainQuad || !cloneOne || !cloneTwo || !shadow) return;

    if (reduceMotion) {
      mainQuad.style.transform =
        "translate3d(72vw, 56vh, 0) translate(-50%, -50%) rotateZ(-3deg) scale(0.9)";
      mainQuad.style.opacity = "0.88";
      cloneOne.style.opacity = "0";
      cloneTwo.style.opacity = "0";
      return;
    }

    let frameId: number | null = null;
    let targetProgress = 0;
    let renderedProgress = 0;
    let previousProgress = 0;

    const readProgress = () => {
      const scrollableHeight = Math.max(
        1,
        document.documentElement.scrollHeight - window.innerHeight,
      );
      return Math.min(1, Math.max(0, window.scrollY / scrollableHeight));
    };

    const renderScene = (progress: number) => {
      const basePose = getPose(progress);
      const isMobile = window.innerWidth <= 640;
      const mobileIntro = smoothStep(Math.min(1, progress / 0.1));
      const pose: RenderedPose = {
        ...basePose,
        x: isMobile ? mix(110, basePose.x, mobileIntro) : basePose.x,
        scale: basePose.scale * (isMobile ? 0.82 : 1),
      };
      const momentum = (progress - previousProgress) * 520;
      previousProgress = progress;

      mainQuad.style.transform = quadTransform(pose, momentum);
      mainQuad.style.opacity = pose.opacity.toFixed(3);

      const intro = smoothStep(Math.min(1, progress / 0.12));
      const cloneOnePose: RenderedPose = {
        x: mix(isMobile ? 98 : 55, pose.x, intro),
        y: mix(isMobile ? 61 : 43, pose.y, intro),
        z: mix(-80, pose.z - 15, intro),
        scale: mix(0.74, pose.scale * 0.88, intro),
        rotate: mix(-13, pose.rotate, intro),
        rotateX: mix(4, pose.rotateX, intro),
        rotateY: mix(13, pose.rotateY, intro),
        opacity: 1,
      };
      const cloneTwoPose: RenderedPose = {
        x: mix(isMobile ? 126 : 91, pose.x, intro),
        y: mix(isMobile ? 70 : 65, pose.y, intro),
        z: mix(-120, pose.z - 30, intro),
        scale: mix(0.68, pose.scale * 0.8, intro),
        rotate: mix(11, pose.rotate, intro),
        rotateX: mix(-3, pose.rotateX, intro),
        rotateY: mix(-14, pose.rotateY, intro),
        opacity: 1,
      };

      cloneOne.style.transform = quadTransform(cloneOnePose);
      cloneTwo.style.transform = quadTransform(cloneTwoPose);
      cloneOne.style.opacity = (0.42 * (1 - intro)).toFixed(3);
      cloneTwo.style.opacity = (0.3 * (1 - intro)).toFixed(3);

      shadow.style.opacity = (pose.opacity * 0.72).toFixed(3);
      shadow.style.transform = `translateY(65%) scaleX(${(0.72 + pose.scale * 0.34).toFixed(3)}) scaleY(${(0.86 + pose.z / 900).toFixed(3)})`;

      particleRefs.current.forEach((particle, index) => {
        if (!particle) return;
        const config = PARTICLES[index];
        const wrappedX = ((config.x + progress * config.drift * 4.2) % 106) - 3;
        const waveY = config.y + Math.sin(progress * Math.PI * (5 + index * 0.35) + config.phase) * 8;
        const rotation = progress * (420 + index * 37) + config.phase * 30;
        const particleOpacity = 0.16 + Math.abs(Math.sin(progress * Math.PI * 3 + config.phase)) * 0.28;

        particle.style.transform = `translate3d(${wrappedX.toFixed(2)}vw, ${waveY.toFixed(2)}vh, ${(index % 3) * -35}px) rotate(${rotation.toFixed(1)}deg)`;
        particle.style.opacity = particleOpacity.toFixed(3);
      });
    };

    const tick = () => {
      const difference = targetProgress - renderedProgress;
      renderedProgress += difference * 0.115;

      if (Math.abs(difference) < 0.00008) renderedProgress = targetProgress;
      renderScene(renderedProgress);

      if (renderedProgress !== targetProgress) {
        frameId = window.requestAnimationFrame(tick);
      } else {
        frameId = null;
      }
    };

    const scheduleUpdate = () => {
      targetProgress = readProgress();
      if (frameId === null) frameId = window.requestAnimationFrame(tick);
    };

    targetProgress = readProgress();
    renderedProgress = targetProgress;
    previousProgress = targetProgress;
    renderScene(renderedProgress);

    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);

    return () => {
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      if (frameId !== null) window.cancelAnimationFrame(frameId);
    };
  }, [pathname, reduceMotion]);

  if (pathname.startsWith("/booking")) return null;

  return (
    <div
      aria-hidden="true"
      className="scroll-quad-sprite-layer"
      data-reduced-motion={reduceMotion ? "true" : "false"}
    >
      {PARTICLES.map((particle, index) => (
        <span
          className={`quad-motion-particle quad-motion-particle-${particle.color}`}
          key={`${particle.x}-${particle.y}`}
          ref={(node) => {
            particleRefs.current[index] = node;
          }}
          style={{ width: particle.size, height: particle.size }}
        />
      ))}

      <QuadImage className="scroll-quad-clone scroll-quad-clone-one" quadRef={cloneOneRef} />
      <QuadImage className="scroll-quad-clone scroll-quad-clone-two" quadRef={cloneTwoRef} />

      <div className="scroll-quad-sprite" ref={mainQuadRef}>
        <span className="scroll-quad-sprite-shadow" ref={shadowRef} />
        <Image
          alt=""
          className="relative z-10 h-auto w-full"
          loading="eager"
          quality={92}
          sizes="(max-width: 640px) 54vw, (max-width: 1024px) 42vw, 500px"
          src={quadCutout}
        />
      </div>
    </div>
  );
}

function QuadImage({
  className,
  quadRef,
}: {
  className: string;
  quadRef: React.RefObject<HTMLDivElement | null>;
}) {
  return (
    <div className={className} ref={quadRef}>
      <Image
        alt=""
        className="h-auto w-full"
        loading="eager"
        quality={85}
        sizes="(max-width: 640px) 42vw, 380px"
        src={quadCutout}
      />
    </div>
  );
}
