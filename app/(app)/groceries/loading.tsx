import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function GroceriesLoading() {
  return (
    <div>
      <Skeleton className="h-11 w-72 max-w-full rounded-2xl sm:h-13" />
      <Skeleton className="mt-4 h-5 w-96 max-w-full rounded-lg" />
      <div className="mt-9 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_19rem]">
        <Card className="p-6 lg:order-last">
          <Skeleton className="h-4 w-24 rounded-md" />
          <Skeleton className="mt-3 h-9 w-20 rounded-lg" />
          <Skeleton className="mt-4 h-2 w-full rounded-full" />
        </Card>
        <div className="space-y-8">
          {[4, 3].map((rows, section) => (
            <div key={section}>
              <div className="mb-3 flex items-center gap-3">
                <Skeleton className="size-9 rounded-xl" />
                <Skeleton className="h-6 w-32 rounded-lg" />
              </div>
              <Card className="divide-y overflow-hidden">
                {Array.from({ length: rows }, (_, row) => (
                  <div key={row} className="flex items-center gap-4 px-5 py-4">
                    <Skeleton className="size-5 rounded-md" />
                    <Skeleton className="h-4 flex-1 rounded-md" />
                    <Skeleton className="h-4 w-14 rounded-md" />
                  </div>
                ))}
              </Card>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
