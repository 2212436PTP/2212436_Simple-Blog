/**
 * Spawns floating emojis across the screen — no React, pure DOM manipulation
 * so it works from any component, escapes all overflow:hidden parents.
 */
export function spawnFloatingEmojis(emoji: string, count = 14) {
  for (let i = 0; i < count; i++) {
    setTimeout(() => {
      const el = document.createElement("span");
      el.textContent = emoji;
      const size = Math.random() * 22 + 18; // 18-40px
      const left = Math.random() * 88 + 4;  // 4-92vw
      const bottom = Math.random() * 25 + 5; // 5-30vh
      const duration = 1.6 + Math.random() * 1.0;
      const rotation = (Math.random() - 0.5) * 40; // ±20deg

      el.style.cssText = [
        "position:fixed",
        `left:${left}vw`,
        `bottom:${bottom}vh`,
        `font-size:${size}px`,
        "pointer-events:none",
        "user-select:none",
        "z-index:9999",
        `animation:flyUp ${duration}s ease-out forwards`,
        `--rot:${rotation}deg`,
        "will-change:transform,opacity",
      ].join(";");

      document.body.appendChild(el);
      setTimeout(() => el.remove(), (duration + 0.1) * 1000);
    }, i * 90);
  }
}
