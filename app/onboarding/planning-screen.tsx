"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Logo } from "@/components/logo";

/**
 * Covers the screen while the first week is planned after onboarding: the
 * landing page's ingredients dropping into a basket, on a loop.
 */
export function PlanningScreen() {
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => heading.current?.focus({ preventScroll: true }), []);

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-busy="true"
      aria-labelledby="planning-heading"
      aria-describedby="planning-note"
      className="fixed inset-0 z-50 flex animate-fade-up flex-col bg-background [animation-duration:0.3s]"
    >
      <header className="mx-auto flex h-16 w-full max-w-3xl items-center px-6">
        <Logo />
      </header>

      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center px-6 pb-24 text-center">
        <Basket />
        <h1
          id="planning-heading"
          ref={heading}
          tabIndex={-1}
          className="mt-12 animate-rise font-display text-4xl font-medium outline-none [animation-delay:120ms] sm:text-5xl"
        >
          Planning your week
        </h1>
        <p
          id="planning-note"
          className="mt-3 animate-rise text-muted-foreground [animation-delay:200ms]"
        >
          This usually takes less than a minute.
        </p>
      </main>
    </div>,
    document.body,
  );
}

/** Square-shouldered on top, rounded below: the landing page's button mid-hover. */
const BASKET =
  "M12 72h176a8 8 0 0 1 8 8v30a26 26 0 0 1-26 26H30A26 26 0 0 1 4 110V80a8 8 0 0 1 8-8Z";

/** Seconds between one ingredient dropping in and the next. */
const STAGGER = 0.35;

/**
 * One ingredient: placed by `at` (an SVG transform, in the basket's
 * coordinates) and animated by CSS on the inner group, so the two don't fight.
 */
function Ingredient({
  at,
  order,
  spin,
  children,
}: {
  at: string;
  order: number;
  spin: number;
  children: ReactNode;
}) {
  return (
    <g transform={at}>
      <g
        className="[transform-origin:50%_100%] animate-pack [transform-box:fill-box] motion-reduce:animate-none"
        style={
          { "--drop-spin": `${spin}deg`, animationDelay: `${order * STAGGER}s` } as CSSProperties
        }
      >
        {children}
      </g>
    </g>
  );
}

/** The basket the landing page's button turns into, filling and emptying with ingredients. */
function Basket() {
  return (
    <svg aria-hidden viewBox="0 0 200 146" className="w-52 animate-rise overflow-visible sm:w-60">
      <defs>
        {/* Above the rim, or inside the basket: sinking ingredients never poke out below. */}
        <clipPath id="planning-basket-inside">
          <rect x="-100" y="-200" width="400" height="272" />
          <path d={BASKET} />
        </clipPath>
      </defs>

      <ellipse cx="100" cy="141" rx="78" ry="4" className="fill-foreground/6" />

      {/* Shapes and spots match the landing page's button; later ones sit in front. */}
      <g
        clipPath="url(#planning-basket-inside)"
        className="stroke-background [paint-order:stroke]"
        strokeWidth={2}
      >
        <Ingredient at="translate(40 36) scale(1.1)" order={0} spin={-150}>
          <path className="fill-sage" d="M14 44C2 31 1 13 8 1c14 7 20 23 14 43Z" />
          <path className="fill-sage" d="M26 44c-2-12 2-22 12-27 3 10-1 21-8 27Z" />
        </Ingredient>
        <Ingredient at="translate(136 36) rotate(3) scale(1.23)" order={1} spin={130}>
          <g className="fill-saffron">
            <rect x="4" width="18" height="6" rx="3" />
            <rect x="1" y="9" width="24" height="31" rx="6" />
          </g>
        </Ingredient>
        <Ingredient at="translate(22 34) rotate(-12)" order={2} spin={200}>
          <rect x="1" y="1" width="18" height="62" rx="9" className="fill-saffron-ink" />
          <path
            d="m6 14 8 4M6 25l8 4M6 36l8 4"
            className="fill-none stroke-saffron-soft [stroke-linecap:round]"
          />
        </Ingredient>
        <Ingredient at="translate(110 34) rotate(12) scale(1.07)" order={3} spin={-170}>
          <path
            d="M14 12c8 0 12 9 12 20 0 9-5 15-12 15S2 41 2 32c0-11 4-20 12-20Z"
            className="fill-plum"
          />
          <path
            d="M12 4a2 2 0 0 1 4 0v6c3 0 5 1 6 4-4 3-12 3-16 0 1-3 3-4 6-4Z"
            className="fill-sage-ink"
          />
        </Ingredient>
        <Ingredient at="translate(74 40) scale(1.33)" order={4} spin={160}>
          <circle cx="15" cy="18" r="12" className="fill-tomato" />
          <path d="m15 10-6-3 4.5-.5L15 2l1.5 4.5L21 7Z" className="fill-sage-ink" />
        </Ingredient>
      </g>

      <path d={BASKET} className="fill-primary" />
      <path
        d="M18 82h164"
        className="stroke-primary-foreground/15"
        strokeWidth={2}
        strokeLinecap="round"
      />
    </svg>
  );
}
