"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

interface WaveBarProps {
  mode: "idle" | "recording" | "analyzing";
  samples: Float32Array;
}

export function WaveBar({ mode, samples }: WaveBarProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (mode !== "recording") return;
    drawWave(canvasRef.current, samples, "#ff7a8a");
  }, [mode, samples]);

  if (mode === "recording") {
    return (
      <div className="relative z-10 flex h-16 items-center justify-center">
        <canvas ref={canvasRef} width={320} height={72} className="h-full w-full" />
      </div>
    );
  }

  return (
    <div className="relative z-10 flex h-10 items-center justify-center gap-1">
      {Array.from({ length: 30 }).map((_, i) => (
        <motion.span
          key={i}
          className="w-1 rounded-full bg-gradient-to-b from-[#81c784] to-[#4caf50]"
          style={{ height: 10, opacity: 0.55 }}
          animate={{ scaleY: [0.5, 2.2, 0.5] }}
          transition={{
            duration: mode === "analyzing" ? 0.6 : 1.2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.05,
          }}
        />
      ))}
    </div>
  );
}

function drawWave(canvas: HTMLCanvasElement | null, samples: Float32Array, color: string) {
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const width = canvas.width;
  const height = canvas.height;
  const stride = Math.max(1, Math.floor(samples.length / width));

  ctx.clearRect(0, 0, width, height);
  ctx.lineWidth = 2.5;
  ctx.lineCap = "round";
  ctx.strokeStyle = color;
  ctx.beginPath();

  for (let x = 0; x < width; x += 1) {
    let peak = 0;
    for (let i = 0; i < stride; i += 1) {
      peak = Math.max(peak, Math.abs(samples[x * stride + i] || 0));
    }
    const y = height / 2 - peak * height * 0.42;
    if (x === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }

  for (let x = width - 1; x >= 0; x -= 1) {
    let peak = 0;
    for (let i = 0; i < stride; i += 1) {
      peak = Math.max(peak, Math.abs(samples[x * stride + i] || 0));
    }
    const y = height / 2 + peak * height * 0.42;
    ctx.lineTo(x, y);
  }

  ctx.closePath();
  ctx.globalAlpha = 0.22;
  ctx.fillStyle = color;
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.stroke();
}
