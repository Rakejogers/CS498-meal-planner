// Entrances for things inside a `Reveal`. Kept out of the client module so Server
// Components get the plain strings rather than client references.

/** Rises in when its `Reveal` scrolls into view. Stagger with `animation-delay`. */
export const RISE = "opacity-0 group-data-[shown]/reveal:animate-rise";
/** The same, for small things that pop in: chips, badges. */
export const POP = "opacity-0 group-data-[shown]/reveal:animate-pop-in";
