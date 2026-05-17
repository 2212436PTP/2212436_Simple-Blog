"use client";

import { useEffect, useState } from "react";

export function ReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const update = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(docHeight > 0 ? Math.min(100, (scrollTop / docHeight) * 100) : 0);
    };

    window.addEventListener("scroll", update, { passive: true });
    update();
    return () => window.removeEventListener("scroll", update);
  }, []);

  return (
    <div
      className="fixed top-0 left-0 z-[9999] h-[3px] transition-all duration-100"
      style={{
        width: `${progress}%`,
        background: "linear-gradient(90deg, #7c3aed, #a855f7, #ec4899)",
        boxShadow: "0 0 8px rgba(168, 85, 247, 0.6)",
      }}
    />
  );
}
