"use client";

import { motion } from "framer-motion";

interface MelonStageProps {
  mode: "idle" | "recording" | "analyzing";
  hint: string;
}

export function MelonStage({ mode, hint }: MelonStageProps) {
  const isActive = mode === "recording" || mode === "analyzing";

  return (
    <section className="relative z-10 flex flex-col items-center pt-2">
      <motion.p
        className="mb-2 flex items-center gap-2.5 text-sm font-extrabold text-[var(--color-deep-rind)]"
        animate={{ opacity: [0.85, 1, 0.85], y: [0, -2, 0] }}
        transition={{ duration: 2.2, repeat: Infinity }}
      >
        <span className="inline-block h-0.5 w-4 rounded-full bg-[var(--color-flesh)]" />
        {hint}
        <span className="inline-block h-0.5 w-4 rounded-full bg-[var(--color-flesh)]" />
      </motion.p>

      <div className="relative flex h-[280px] w-[280px] items-center justify-center">
        {[1, 2, 3].map((i) => (
          <motion.span
            key={i}
            className="absolute rounded-full border-2 border-[rgba(255,122,138,0.35)]"
            style={{ width: "66%", height: "66%" }}
            initial={{ scale: 0.7, opacity: 0 }}
            animate={
              isActive
                ? { scale: [0.7, 1.35], opacity: [0.65, 0] }
                : { scale: 0.7, opacity: 0 }
            }
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut", delay: i * 0.45 }}
          />
        ))}
        <motion.div
          className="absolute h-[76%] w-[76%] rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(178,235,242,0.3) 40%, transparent 70%)",
          }}
          animate={{ scale: [1, 1.08, 1], opacity: [0.6, 0.9, 0.6] }}
          transition={{ duration: 3, repeat: Infinity }}
        />
        <motion.img
          src="/assets/watermelon.png?v=2"
          alt="西瓜"
          className="relative z-10 h-[84%] w-[84%] object-contain drop-shadow-[0_24px_36px_rgba(27,94,32,0.18)]"
          animate={{ y: [0, -10, 0], rotate: [-1, 1.5, -1] }}
          transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
    </section>
  );
}
