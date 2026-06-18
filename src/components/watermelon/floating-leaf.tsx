"use client";

import { motion } from "framer-motion";

interface FloatingLeafProps {
  className: string;
  duration: number;
  delay: number;
}

export function FloatingLeaf({ className, duration, delay }: FloatingLeafProps) {
  return (
    <motion.div
      className={`absolute h-9 w-9 ${className}`}
      animate={{
        x: [0, 6, -4, 8, 0],
        y: [0, -8, -14, -6, 0],
        rotate: [0, 8, -5, 6, 0],
      }}
      transition={{ duration, repeat: Infinity, ease: "easeInOut", delay }}
    >
      <svg viewBox="0 0 40 40">
        <path d="M20 2 C35 8 38 25 20 38 C2 25 5 8 20 2 Z" fill="#81c784" />
      </svg>
    </motion.div>
  );
}
