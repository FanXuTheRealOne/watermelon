"use client";

import { motion } from "framer-motion";

export function FloatingBubbles() {
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
