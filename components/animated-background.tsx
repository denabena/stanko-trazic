"use client";

import { motion } from "motion/react";
import { useEffect, useState } from "react";

export function AnimatedBackground() {
  const [scanRange, setScanRange] = useState(900);
  useEffect(() => {
    setScanRange(typeof window !== "undefined" ? window.innerHeight + 400 : 900);
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <motion.div
        className="absolute top-0 left-1/4 size-[600px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(22, 61, 115, 0.08) 0%, transparent 70%)",
          filter: "blur(60px)",
        }}
        animate={{
          x: [0, 50, 0],
          y: [0, 30, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <motion.div
        className="absolute top-1/3 right-1/4 size-[500px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(22, 61, 115, 0.06) 0%, transparent 70%)",
          filter: "blur(60px)",
        }}
        animate={{
          x: [0, -30, 0],
          y: [0, 50, 0],
          scale: [1, 1.15, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <motion.div
        className="absolute bottom-0 left-1/2 size-[700px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(22, 61, 115, 0.05) 0%, transparent 70%)",
          filter: "blur(80px)",
        }}
        animate={{
          x: [0, -50, 0],
          y: [0, -40, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <div
        className="absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(22, 61, 115, 0.15) 1px, transparent 1px),
            linear-gradient(90deg, rgba(22, 61, 115, 0.15) 1px, transparent 1px)
          `,
          backgroundSize: "80px 80px",
          maskImage:
            "radial-gradient(ellipse 80% 60% at 50% 40%, black 20%, transparent 100%)",
        }}
      />

      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='4' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      <motion.div
        className="absolute inset-0 h-[200px]"
        style={{
          background:
            "linear-gradient(180deg, transparent 0%, rgba(22, 61, 115, 0.03) 50%, transparent 100%)",
        }}
        animate={{
          y: [-200, scanRange],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "linear",
        }}
      />
    </div>
  );
}
