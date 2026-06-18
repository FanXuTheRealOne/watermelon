"use client";

import { motion } from "framer-motion";

export function FloatingSlice() {
  return (
    <motion.div
      className="absolute right-[-12px] top-[12%] h-28 w-28"
      animate={{ y: [0, -14, 0], rotate: [0, 4, 0] }}
      transition={{ duration: 6.5, repeat: Infinity, ease: "easeInOut" }}
    >
      <svg viewBox="0 0 120 120">
        <defs>
          <linearGradient id="fleshGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ff8a9a" />
            <stop offset="100%" stopColor="#ff5c70" />
          </linearGradient>
        </defs>
        <path d="M60 10 A50 50 0 0 1 110 60 L60 60 Z" fill="url(#fleshGrad)" />
        <path d="M60 10 A50 50 0 0 1 110 60 L60 60 Z" fill="none" stroke="#4caf50" strokeWidth="8" />
        <ellipse cx="82" cy="38" rx="3" ry="5" fill="#3e2723" transform="rotate(25 82 38)" />
        <ellipse cx="95" cy="52" rx="3" ry="5" fill="#3e2723" transform="rotate(55 95 52)" />
      </svg>
    </motion.div>
  );
}
