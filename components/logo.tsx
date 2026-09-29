import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function LogoMark({
  className,
  variant = "color",
}: {
  className?: string;
  variant?: "color" | "badge";
}) {
  return (
    <span
      aria-hidden="true"
      className={cn("relative inline-block size-9 shrink-0 overflow-hidden", className)}
    >
      {variant === "badge" ? (
        <Image
          src="/brand/plantry-badge.png"
          alt=""
          width={1254}
          height={1254}
          sizes="(min-width: 1024px) 80px, 36px"
          className="size-full rounded-[24%]"
        />
      ) : (
        <Image
          src="/brand/plantry-mark.png"
          alt=""
          width={1254}
          height={1254}
          sizes="48px"
          className="absolute -top-[22.8%] -left-[18.2%] w-[137.8%] max-w-none"
        />
      )}
    </span>
  );
}

export function Logo({ href = "/", className }: { href?: string; className?: string }) {
  return (
    <Link
      href={href}
      aria-label="Plantry home"
      className={cn(
        "inline-flex shrink-0 items-center gap-2 rounded-lg outline-none focus-visible:ring-4 focus-visible:ring-ring/20 sm:gap-2.5",
        className,
      )}
    >
      <LogoMark className="size-7 sm:size-9" />
      <span aria-hidden="true" className="relative block aspect-[3.3] w-20 overflow-hidden sm:w-28">
        <Image
          src="/brand/plantry-wordmark.png"
          alt=""
          width={2172}
          height={724}
          sizes="(min-width: 640px) 128px, 92px"
          className="absolute -top-[18.8%] -left-[8.9%] w-[114.4%] max-w-none"
        />
      </span>
    </Link>
  );
}
