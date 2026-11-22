import type { Metadata, Viewport } from "next";
import { Fraunces, Geist } from "next/font/google";
import { ThemeSync } from "@/components/theme-toggle";
import { THEME_COLORS, THEME_SCRIPT } from "@/lib/theme";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["SOFT", "opsz"],
});

export const metadata: Metadata = {
  title: {
    default: "Plantry · Dinner, sorted for the week",
    template: "%s · Plantry",
  },
  description:
    "Plantry plans a week of dinners around what you like and what's already in your kitchen, then turns it into one tidy grocery list.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: THEME_COLORS.light },
    { media: "(prefers-color-scheme: dark)", color: THEME_COLORS.dark },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      // Smooth for in-page jumps only: the attribute tells Next to switch it off while changing routes.
      data-scroll-behavior="smooth"
      className={`${geist.variable} ${fraunces.variable} h-full antialiased motion-safe:scroll-smooth`}
      // THEME_SCRIPT adds the theme class before React hydrates.
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body className="flex min-h-full flex-col">
        <ThemeSync />
        {children}
      </body>
    </html>
  );
}
