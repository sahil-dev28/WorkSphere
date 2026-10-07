import { Card, CardContent } from "@WorkSphere/ui/components/card";
import { Skeleton } from "@WorkSphere/ui/components/skeleton";

import { PageHeaderSkeleton } from "@/components/page-header-skeleton";

export default function OrgChartLoading() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeaderSkeleton />

      <Card>
        <CardContent className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Skeleton className="size-12 rounded-full" />
            <div className="flex flex-col gap-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
          <Skeleton className="h-10 w-40" />
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Skeleton className="h-[680px] w-full" />
        </CardContent>
      </Card>
    </div>
  );
}
