"use client";

import { motion } from "framer-motion";

interface FloatingCubeProps {
  className: string;
  delay: number;
  flip?: boolean;
}

export function FloatingCube({ className, delay, flip }: FloatingCubeProps) {
  return (
    <motion.div
      className={`absolute h-[70px] w-[70px] ${className}`}
      animate={{ y: [0, -10, 0], rotate: flip ? [2, -3, 2] : [-2, 3, -2] }}
      transition={{ duration: 5.2 + delay, repeat: Infinity, ease: "easeInOut", delay }}
    >
      <svg viewBox="0 0 80 80">
        <rect x="12" y="28" width="52" height="52" rx="10" fill="#ff7a8a" />
        <rect x="12" y="28" width="52" height="52" rx="10" fill="none" stroke="#4caf50" strokeWidth="6" />
        <circle cx="32" cy="50" r="2.5" fill="#3e2723" />
        <circle cx="50" cy="58" r="2.5" fill="#3e2723" />
        <circle cx="42" cy="42" r="2.5" fill="#3e2723" />
      </svg>
    </motion.div>
  );
}
