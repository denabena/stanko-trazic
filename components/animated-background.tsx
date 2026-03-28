"use client";

import { motion } from "motion/react";
import { useEffect, useState } from "react";

function useWindowHeight() {
  const [h, setH] = useState(900);
  useEffect(() => {
    setH(window.innerHeight + 400);
  }, []);
  return h;
}

const PARTICLE_COUNT = 18;

function Particles() {
  const [particles] = useState(() =>
    Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 2 + Math.random() * 3,
      duration: 18 + Math.random() * 24,
      delay: Math.random() * 10,
      dx: -20 + Math.random() * 40,
      dy: -30 + Math.random() * 60,
    }))
  );

  return (
    <>
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-[#163D73]"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.x}%`,
            top: `${p.y}%`,
            opacity: 0,
          }}
          animate={{
            x: [0, p.dx, 0],
            y: [0, p.dy, 0],
            opacity: [0, 0.12, 0],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            ease: "easeInOut",
            delay: p.delay,
          }}
        />
      ))}
    </>
  );
}

export function AnimatedBackground() {
  const scanRange = useWindowHeight();

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {/* Primary blob — upper-left, brand blue */}
      <motion.div
        className="absolute -top-32 -left-32 size-[700px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(22, 61, 115, 0.12) 0%, transparent 70%)",
          filter: "blur(70px)",
        }}
        animate={{
          x: [0, 60, 0],
          y: [0, 40, 0],
          scale: [1, 1.12, 1],
        }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Secondary blob — right side, slightly warmer */}
      <motion.div
        className="absolute top-1/4 -right-20 size-[550px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(56, 97, 155, 0.10) 0%, transparent 70%)",
          filter: "blur(60px)",
        }}
        animate={{
          x: [0, -40, 0],
          y: [0, 60, 0],
          scale: [1, 1.18, 1],
        }}
        transition={{ duration: 28, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Tertiary blob — bottom-center, subtle */}
      <motion.div
        className="absolute -bottom-40 left-1/3 size-[800px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(22, 61, 115, 0.08) 0%, transparent 70%)",
          filter: "blur(90px)",
        }}
        animate={{
          x: [0, -60, 0],
          y: [0, -50, 0],
          scale: [1, 1.15, 1],
        }}
        transition={{ duration: 32, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Accent blob — small, moves faster */}
      <motion.div
        className="absolute top-2/3 left-1/4 size-[300px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(22, 80, 140, 0.09) 0%, transparent 70%)",
          filter: "blur(50px)",
        }}
        animate={{
          x: [0, 80, -30, 0],
          y: [0, -60, 30, 0],
          scale: [1, 1.25, 0.95, 1],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Dot grid with slow rotation */}
      <motion.div
        className="absolute inset-[-50%] origin-center"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(22, 61, 115, 0.18) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage:
            "radial-gradient(ellipse 50% 50% at 50% 50%, black 10%, transparent 80%)",
        }}
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 240, repeat: Infinity, ease: "linear" }}
      />

      {/* Floating particles */}
      <Particles />

      {/* Noise overlay */}
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='4' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Scan line */}
      <motion.div
        className="absolute inset-x-0 h-[180px]"
        style={{
          background:
            "linear-gradient(180deg, transparent 0%, rgba(22, 61, 115, 0.04) 50%, transparent 100%)",
        }}
        animate={{ y: [-200, scanRange] }}
        transition={{ duration: 14, repeat: Infinity, ease: "linear" }}
      />
    </div>
  );
}
