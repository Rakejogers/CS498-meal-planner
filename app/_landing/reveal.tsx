"use client";

import { useEffect, useRef, useState, type ComponentProps } from "react";
import { cn } from "@/lib/utils";

/**
 * Marks itself `data-shown` the first time it scrolls into view. Descendants
 * react with `group-data-[shown]/reveal:` classes, so one observer can drive a
 * whole staggered scene. `RISE` and `POP` in `./motion` are the usual two.
 */
export function Reveal({ className, ...props }: ComponentProps<"div">) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      data-shown={shown ? "" : undefined}
      className={cn("group/reveal", className)}
      {...props}
    />
  );
}
