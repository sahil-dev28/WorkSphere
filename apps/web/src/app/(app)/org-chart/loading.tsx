import { Card, CardContent } from "@WorkSphere/ui/components/card";
import { Skeleton } from "@WorkSphere/ui/components/skeleton";

export default function OrgChartLoading() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <Card>
        <CardContent className="flex items-center justify-between gap-4 py-4">
          <Skeleton className="h-12 w-48" />
          <Skeleton className="h-12 w-32" />
        </CardContent>
      </Card>

      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i}>
          <CardContent className="flex flex-col gap-4 py-4">
            <Skeleton className="h-9 w-64" />
            <div className="grid grid-cols-2 gap-3 min-[640px]:grid-cols-4">
              {Array.from({ length: 4 }).map((_, j) => (
                <Skeleton key={j} className="h-12 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
