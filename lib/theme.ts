export type Theme = "light" | "dark";

const STORAGE_KEY = "plantry-theme";
const DARK_QUERY = "(prefers-color-scheme: dark)";

/** Browser toolbar colors. These match --background in app/globals.css. */
export const THEME_COLORS: Record<Theme, string> = { light: "#fbf8f3", dark: "#131a15" };

/**
 * Runs in <head> before first paint so a dark-mode visitor never sees a light flash.
 * It's a string, so it can't import from here: keep it in step with `preferredTheme`.
 */
export const THEME_SCRIPT = `(function(){var t;try{t=localStorage.getItem("${STORAGE_KEY}")}catch(e){}if(t!=="light"&&t!=="dark")t=matchMedia("${DARK_QUERY}").matches?"dark":"light";document.documentElement.classList.toggle("dark",t==="dark")})()`;

function systemTheme(): Theme {
  return window.matchMedia(DARK_QUERY).matches ? "dark" : "light";
}

/** The saved choice, or the machine's setting when there isn't one. */
function preferredTheme(): Theme {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "light" || saved === "dark") return saved;
  } catch {
    // Storage can be blocked. The machine's setting still works.
  }
  return systemTheme();
}

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
  document
    .querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]')
    .forEach((meta) => (meta.content = THEME_COLORS[theme]));
}

/** Applies the preferred theme and keeps following the machine and other tabs. */
export function watchTheme() {
  const sync = () => applyTheme(preferredTheme());
  const media = window.matchMedia(DARK_QUERY);
  sync();
  media.addEventListener("change", sync);
  window.addEventListener("storage", sync);
  return () => {
    media.removeEventListener("change", sync);
    window.removeEventListener("storage", sync);
  };
}

/**
 * Flips the theme with a short crossfade. Landing back on the machine's setting
 * clears the saved choice, so the app goes back to following the machine.
 */
export function toggleTheme() {
  const root = document.documentElement;
  const next: Theme = root.classList.contains("dark") ? "light" : "dark";

  try {
    if (next === systemTheme()) localStorage.removeItem(STORAGE_KEY);
    else localStorage.setItem(STORAGE_KEY, next);
  } catch {
    // Storage can be blocked. The theme still changes for this page.
  }

  root.classList.add("theme-changing");
  const finish = () => root.classList.remove("theme-changing");
  if (document.startViewTransition) {
    document.startViewTransition(() => applyTheme(next)).finished.then(finish, finish);
  } else {
    applyTheme(next);
    requestAnimationFrame(() => requestAnimationFrame(finish));
  }
}
