"use client";

import * as React from "react";
import { motion } from "framer-motion";

interface Particle {
  id: number;
  left: number;
  size: number;
  duration: number;
  delay: number;
  drift: number;
}

/** Deterministic pseudo-random particle layout (no Math.random at module
 * scope) so server and client render identical markup — no hydration
 * mismatch, and no useEffect flash-in. */
function makeParticles(count: number): Particle[] {
  let seed = 42;
  const rand = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    left: rand() * 100,
    size: 2 + rand() * 3,
    duration: 14 + rand() * 12,
    delay: rand() * -20,
    drift: (rand() - 0.5) * 60,
  }));
}

const particles = makeParticles(18);

export function FloatingParticles() {
  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <motion.span
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size,
            bottom: -20,
            backgroundImage: "var(--arc-gradient)",
            opacity: 0.35,
          }}
          animate={{
            y: [0, -600],
            x: [0, p.drift],
            opacity: [0, 0.4, 0],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
}
