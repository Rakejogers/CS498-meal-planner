import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap [&_svg]:size-3",
  {
    variants: {
      tone: {
        neutral: "bg-muted text-muted-foreground",
        sage: "bg-sage-soft text-sage-ink",
        saffron: "bg-saffron-soft text-saffron-ink",
        tomato: "bg-tomato-soft text-tomato-ink",
        plum: "bg-plum-soft text-plum-ink",
        sky: "bg-sky-soft text-sky-ink",
      },
    },
    defaultVariants: {
      tone: "neutral",
    },
  },
);

export type Tone = NonNullable<VariantProps<typeof badgeVariants>["tone"]>;

export function Badge({
  className,
  tone,
  ...props
}: ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ tone }), className)} {...props} />;
}
