import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function MealLoading() {
  return (
    <div>
      <Skeleton className="h-9 w-28 rounded-full" />
      <Skeleton className="mt-6 h-5 w-56 rounded-lg" />
      <Skeleton className="mt-4 h-11 w-96 max-w-full rounded-2xl sm:h-13" />
      <Skeleton className="mt-4 h-5 w-full max-w-xl rounded-lg" />
      <div className="mt-5 flex gap-2">
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="h-5 w-20 rounded-full" />
        <Skeleton className="h-5 w-24 rounded-full" />
      </div>
      <div className="mt-10 grid items-start gap-10 lg:grid-cols-[22rem_minmax(0,1fr)]">
        <div>
          <Skeleton className="h-7 w-32 rounded-lg" />
          <Card className="mt-4 divide-y overflow-hidden">
            {Array.from({ length: 6 }, (_, row) => (
              <div key={row} className="flex items-center gap-4 px-5 py-4">
                <Skeleton className="h-4 flex-1 rounded-md" />
                <Skeleton className="h-4 w-14 rounded-md" />
              </div>
            ))}
          </Card>
        </div>
        <div className="max-w-2xl">
          <Skeleton className="h-7 w-24 rounded-lg" />
          <div className="mt-4 space-y-6">
            {Array.from({ length: 4 }, (_, row) => (
              <div key={row} className="flex gap-4">
                <Skeleton className="size-8 shrink-0 rounded-full" />
                <div className="flex-1 space-y-2 pt-1">
                  <Skeleton className="h-4 w-full rounded-md" />
                  <Skeleton className="h-4 w-3/4 rounded-md" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
