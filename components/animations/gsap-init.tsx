"use client";

import { useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function GSAPAnimations() {
  useEffect(() => {
    // ── Hero text reveal ────────────────────────────────────
    const heroTl = gsap.timeline({ defaults: { ease: "power3.out" } });
    heroTl
      .from(".gsap-hero-badge", { opacity: 0, y: 20, duration: 0.6 })
      .from(".gsap-hero-title", { opacity: 0, y: 40, duration: 0.8 }, "-=0.3")
      .from(".gsap-hero-sub", { opacity: 0, y: 24, duration: 0.7 }, "-=0.5")
      .from(".gsap-hero-search", { opacity: 0, y: 20, scale: 0.97, duration: 0.6 }, "-=0.4");

    // ── Featured post ───────────────────────────────────────
    gsap.from(".gsap-featured", {
      scrollTrigger: { trigger: ".gsap-featured", start: "top 85%", toggleActions: "play none none none" },
      opacity: 0,
      y: 48,
      duration: 0.9,
      ease: "power3.out",
    });

    // ── Card grid stagger ───────────────────────────────────
    gsap.from(".gsap-card", {
      scrollTrigger: { trigger: ".gsap-grid", start: "top 88%", toggleActions: "play none none none" },
      opacity: 0,
      y: 40,
      duration: 0.7,
      stagger: 0.1,
      ease: "power2.out",
    });

    // ── Section headings ────────────────────────────────────
    gsap.utils.toArray<Element>(".gsap-section-title").forEach((el) => {
      gsap.from(el, {
        scrollTrigger: { trigger: el, start: "top 90%", toggleActions: "play none none none" },
        opacity: 0,
        x: -30,
        duration: 0.7,
        ease: "power2.out",
      });
    });

    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  return null;
}
