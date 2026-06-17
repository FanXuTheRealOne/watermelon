"use client";

import { motion } from "framer-motion";

export function BrandLogo() {
  return (
    <div className="flex items-baseline">
      <span className="text-4xl font-black text-[var(--color-deep-rind)]">听瓜</span>
      <motion.span
        className="ml-0.5 text-4xl font-black text-[var(--color-flesh-dark)]"
        animate={{ rotate: [0, -12, 0], scale: [1, 1.08, 1] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
      >
        ，
      </motion.span>
    </div>
  );
}
