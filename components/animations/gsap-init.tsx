"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function GSAPAnimations() {
  const initialized = useRef(false);

  useEffect(() => {
    // Kill any leftover ScrollTriggers from previous route
    ScrollTrigger.getAll().forEach((t) => t.kill());
    gsap.killTweensOf("*");
    initialized.current = false;

    // Small delay to let Next.js finish rendering the DOM
    const timer = setTimeout(() => {
      if (initialized.current) return;
      initialized.current = true;

      // ── Hero: always visible → simple timeline, no ScrollTrigger ──
      const heroTl = gsap.timeline({ defaults: { ease: "power3.out" } });
      heroTl
        .fromTo(".gsap-hero-badge",
          { opacity: 0, y: 16 },
          { opacity: 1, y: 0, duration: 0.55 })
        .fromTo(".gsap-hero-title",
          { opacity: 0, y: 32 },
          { opacity: 1, y: 0, duration: 0.7 }, "-=0.3")
        .fromTo(".gsap-hero-sub",
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.6 }, "-=0.45")
        .fromTo(".gsap-hero-search",
          { opacity: 0, y: 16, scale: 0.98 },
          { opacity: 1, y: 0, scale: 1, duration: 0.5 }, "-=0.35");

      // ── Featured post: "top bottom" = fires as soon as el enters viewport ──
      const featured = document.querySelector(".gsap-featured");
      if (featured) {
        gsap.fromTo(featured,
          { opacity: 0, y: 40 },
          {
            opacity: 1, y: 0, duration: 0.85, ease: "power2.out",
            scrollTrigger: {
              trigger: featured,
              start: "top bottom",   // fires immediately when visible
              once: true,
            },
          });
      }

      // ── Card stagger ──
      const cards = gsap.utils.toArray<Element>(".gsap-card");
      if (cards.length > 0) {
        gsap.fromTo(cards,
          { opacity: 0, y: 30 },
          {
            opacity: 1, y: 0,
            duration: 0.6,
            stagger: 0.08,
            ease: "power2.out",
            scrollTrigger: {
              trigger: ".gsap-grid",
              start: "top bottom",   // fires immediately when visible
              once: true,
            },
          });
      }

      // Refresh after setup so elements already on screen get picked up
      ScrollTrigger.refresh();
    }, 80);

    return () => {
      clearTimeout(timer);
      ScrollTrigger.getAll().forEach((t) => t.kill());
      initialized.current = false;
    };
  }, []);

  return null;
}
