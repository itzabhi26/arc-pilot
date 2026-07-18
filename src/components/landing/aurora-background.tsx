"use client";

import { motion } from "framer-motion";

/**
 * A slow-drifting, layered aurora glow. Pure CSS gradients animated via
 * Framer Motion transforms — no canvas, so it stays cheap on the main
 * thread and holds 60fps even on mid-range laptops.
 */
export function AuroraBackground() {
  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden pointer-events-none">
      <motion.div
        className="absolute -top-1/3 left-[-10%] h-[70vh] w-[70vh] rounded-full blur-3xl"
        style={{ backgroundImage: "var(--arc-gradient)", opacity: 0.16 }}
        animate={{
          x: [0, 40, -20, 0],
          y: [0, 30, -10, 0],
          scale: [1, 1.08, 0.96, 1],
        }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-[10%] right-[-15%] h-[60vh] w-[60vh] rounded-full blur-3xl"
        style={{
          backgroundImage:
            "radial-gradient(circle, var(--arc-violet) 0%, transparent 70%)",
          opacity: 0.14,
        }}
        animate={{
          x: [0, -30, 20, 0],
          y: [0, 20, -30, 0],
          scale: [1, 0.94, 1.05, 1],
        }}
        transition={{ duration: 26, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />
      <motion.div
        className="absolute bottom-[-20%] left-[20%] h-[55vh] w-[55vh] rounded-full blur-3xl"
        style={{
          backgroundImage:
            "radial-gradient(circle, var(--arc-blue-2) 0%, transparent 70%)",
          opacity: 0.12,
        }}
        animate={{
          x: [0, 25, -15, 0],
          y: [0, -20, 15, 0],
        }}
        transition={{ duration: 30, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />
    </div>
  );
}
