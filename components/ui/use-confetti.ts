"use client";

import { useCallback } from "react";
import confetti from "canvas-confetti";

export function useConfetti() {
  const fire = useCallback(() => {
    // Left burst
    confetti({
      particleCount: 60,
      spread: 55,
      origin: { x: 0.3, y: 0.6 },
      colors: ["#7c3aed", "#a855f7", "#ec4899", "#f97316", "#06b6d4"],
    });
    // Right burst
    setTimeout(() => {
      confetti({
        particleCount: 60,
        spread: 55,
        origin: { x: 0.7, y: 0.6 },
        colors: ["#7c3aed", "#a855f7", "#ec4899", "#f97316", "#06b6d4"],
      });
    }, 150);
    // Center burst
    setTimeout(() => {
      confetti({
        particleCount: 80,
        spread: 90,
        origin: { x: 0.5, y: 0.55 },
        colors: ["#7c3aed", "#ec4899", "#fbbf24", "#34d399"],
      });
    }, 300);
  }, []);

  return fire;
}
