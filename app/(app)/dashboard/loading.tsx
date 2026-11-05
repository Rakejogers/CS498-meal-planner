import { Skeleton } from "@/components/ui/skeleton";
import { DinnerSkeletons } from "./dinner-cards";

export default function DashboardLoading() {
  return (
    <div>
      <Skeleton className="h-11 w-56 rounded-2xl sm:h-13" />
      <Skeleton className="mt-4 h-5 w-80 max-w-full rounded-lg" />
      <DinnerSkeletons count={4} />
    </div>
  );
}
