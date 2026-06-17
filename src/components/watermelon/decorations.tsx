"use client";

import { motion } from "framer-motion";

export function Decorations() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
      <FloatingSlice />
      <FloatingCube className="bottom-[26%] left-[-8px]" delay={0} />
      <FloatingCube className="bottom-[18%] right-[-4px]" delay={0.6} flip />
      <FloatingLeaf className="left-[8%] top-[22%]" duration={7} delay={0} />
      <FloatingLeaf className="bottom-[38%] right-[14%]" duration={8} delay={1.2} />
      <FloatingBubbles />
    </div>
  );
}

function FloatingSlice() {
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

interface FloatingCubeProps {
  className: string;
  delay: number;
  flip?: boolean;
}

function FloatingCube({ className, delay, flip }: FloatingCubeProps) {
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

interface FloatingLeafProps {
  className: string;
  duration: number;
  delay: number;
}

function FloatingLeaf({ className, duration, delay }: FloatingLeafProps) {
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

function FloatingBubbles() {
  const bubbles = [
    { w: 18, top: "18%", left: "18%" },
    { w: 12, top: "32%", right: "22%" },
    { w: 22, bottom: "34%", left: "12%" },
    { w: 14, bottom: "22%", right: "16%" },
    { w: 10, top: "48%", left: "6%" },
  ];

  return (
    <>
      {bubbles.map((b, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: b.w,
            height: b.w,
            top: b.top,
            left: b.left,
            right: b.right,
            background:
              "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.95), rgba(178,235,242,0.45))",
          }}
          animate={{ y: [0, -16, 0], scale: [1, 1.1, 1], opacity: [0.7, 1, 0.7] }}
          transition={{
            duration: 6.5 + i * 0.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.8,
          }}
        />
      ))}
    </>
  );
}
