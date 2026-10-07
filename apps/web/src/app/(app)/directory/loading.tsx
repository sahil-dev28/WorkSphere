import { Card, CardContent } from "@WorkSphere/ui/components/card";
import { Skeleton } from "@WorkSphere/ui/components/skeleton";

import { PageHeaderSkeleton } from "@/components/page-header-skeleton";

export default function DirectoryLoading() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeaderSkeleton />

      <Card>
        <CardContent className="flex flex-col gap-3 min-[700px]:flex-row min-[700px]:items-center">
          <Skeleton className="h-9 min-[700px]:flex-1" />
          <div className="grid grid-cols-2 gap-2 min-[700px]:flex min-[700px]:shrink-0">
            {Array.from({ length: 4 }, (_, i) => (
              <Skeleton key={i} className="h-9 min-[700px]:w-32" />
            ))}
          </div>
        </CardContent>
      </Card>

      <Skeleton className="h-4 w-28" />

      <Card className="hidden min-[860px]:block">
        <CardContent className="flex flex-col gap-3">
          {Array.from({ length: 8 }, (_, i) => (
            <Skeleton key={i} className="h-11 w-full" />
          ))}
        </CardContent>
      </Card>

      <div className="flex flex-col gap-2 min-[860px]:hidden">
        {Array.from({ length: 6 }, (_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    </div>
  );
}
