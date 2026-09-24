import { Sprout } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "grid size-9 place-items-center rounded-xl bg-primary text-saffron shadow-sm shadow-primary/30",
        className,
      )}
    >
      <Sprout className="size-5" strokeWidth={2.25} />
    </span>
  );
}

export function Logo({
  href = "/",
  className,
}: {
  href?: string;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn("inline-flex items-center gap-2.5 rounded-xl outline-none focus-visible:ring-4 focus-visible:ring-ring/20", className)}
    >
      <LogoMark />
      <span className="font-display text-[1.6rem] leading-none font-semibold tracking-tight">
        plenly
      </span>
    </Link>
  );
}
