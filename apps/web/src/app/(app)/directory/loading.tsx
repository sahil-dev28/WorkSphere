import { Card, CardContent } from "@WorkSphere/ui/components/card";
import { Skeleton } from "@WorkSphere/ui/components/skeleton";

export default function DirectoryLoading() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between gap-4">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-8 w-32" />
      </div>

      <Card>
        <CardContent className="flex flex-col gap-3 py-3 min-[860px]:flex-row min-[860px]:items-center">
          <Skeleton className="h-8 flex-1" />
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-[150px]" />
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="hidden min-[860px]:block">
        <CardContent className="flex flex-col gap-3 py-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </CardContent>
      </Card>

      <div className="flex flex-col gap-2 min-[860px]:hidden">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="flex items-center gap-3 py-3">
              <Skeleton className="size-9 shrink-0" />
              <div className="flex flex-1 flex-col gap-1.5">
                <Skeleton className="h-3 w-2/3" />
                <Skeleton className="h-3 w-1/2" />
              </div>
              <Skeleton className="h-5 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
