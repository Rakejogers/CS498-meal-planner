import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function MealNotFound() {
  return (
    <div className="mx-auto max-w-md py-12 text-center">
      <h1 className="font-display text-3xl font-medium">We couldn&apos;t find that dinner.</h1>
      <p className="mt-4 text-muted-foreground">
        It may have been swapped out when you planned new dinners.
      </p>
      <Link href="/dashboard" className={buttonVariants({ className: "mt-6" })}>
        Back to your week <ArrowRight aria-hidden="true" />
      </Link>
    </div>
  );
}
