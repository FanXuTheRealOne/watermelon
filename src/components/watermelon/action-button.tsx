"use client";

import { motion } from "framer-motion";
import { Mic } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ActionButtonProps {
  mode: "idle" | "recording" | "analyzing";
  disabled?: boolean;
  onClick: () => void;
}

export function ActionButton({ mode, disabled, onClick }: ActionButtonProps) {
  const label = mode === "recording" ? "完成检测" : mode === "analyzing" ? "分析中" : "开始检测";
  const isDisabled = disabled || mode === "analyzing";

  return (
    <section className="relative z-10 flex justify-center py-1">
      <motion.div className="relative w-full max-w-sm" whileTap={isDisabled ? undefined : { scale: 0.97 }}>
        <span className="absolute inset-0 translate-y-1.5 rounded-full bg-[var(--color-flesh-dark)] opacity-55 blur-sm" />
        <Button
          size="lg"
          className="relative w-full text-xl font-black shadow-[0_10px_28px_rgba(255,92,112,0.28)]"
          disabled={isDisabled}
          onClick={onClick}
        >
          <motion.span
            className="flex items-center gap-2.5"
            animate={mode === "recording" ? { scale: [1, 1.03, 1] } : { scale: 1 }}
            transition={{ duration: 1.2, repeat: Infinity }}
          >
            <Mic className="h-6 w-6" />
            {label}
          </motion.span>
        </Button>
      </motion.div>
    </section>
  );
}
