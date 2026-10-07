"use client";

import { useLayoutEffect, useRef, useState } from "react";

function prefersReducedMotion(): boolean {
  return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
}

export function useCountUp<T extends Element>(target: number, duration = 800) {
  const ref = useRef<T>(null);
  const [value, setValue] = useState(target);

  // Layout effect so the server-rendered final value is swapped for 0 before first paint.
  useLayoutEffect(() => {
    const node = ref.current;
    if (!node || prefersReducedMotion() || typeof IntersectionObserver === "undefined") {
      setValue(target);
      return;
    }

    let frame = 0;
    setValue(0);

    const observer = new IntersectionObserver(([entry]) => {
      if (!entry?.isIntersecting) return;
      observer.disconnect();
      const start = performance.now();
      const tick = (now: number) => {
        const t = Math.min((now - start) / duration, 1);
        setValue(Math.round(target * (1 - (1 - t) ** 3)));
        if (t < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    });

    observer.observe(node);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [target, duration]);

  return { ref, value };
}
