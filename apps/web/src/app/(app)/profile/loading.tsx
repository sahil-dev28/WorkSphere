import { Card, CardContent } from "@WorkSphere/ui/components/card";
import { Skeleton } from "@WorkSphere/ui/components/skeleton";

import { PageHeaderSkeleton } from "@/components/page-header-skeleton";

export default function ProfileLoading() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeaderSkeleton />
      <Card className="overflow-hidden pt-0">
        <div className="h-20 bg-muted" />
        <CardContent className="flex items-end gap-4 pt-0">
          <Skeleton className="-mt-10 size-20 rounded-full" />
          <Skeleton className="h-5 w-40" />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-col gap-4 py-4">
          <div className="grid grid-cols-1 gap-4 min-[600px]:grid-cols-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
          <div className="grid grid-cols-1 gap-4 min-[500px]:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
