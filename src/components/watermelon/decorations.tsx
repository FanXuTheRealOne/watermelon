"use client";

import { FloatingBubbles } from "./floating-bubbles";
import { FloatingCube } from "./floating-cube";
import { FloatingLeaf } from "./floating-leaf";
import { FloatingSlice } from "./floating-slice";

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
