import { Card, CardContent } from "@WorkSphere/ui/components/card";
import { Skeleton } from "@WorkSphere/ui/components/skeleton";

export default function DirectoryLoading() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between gap-4">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-8 w-32" />
      </div>

      <Card>
        <CardContent className="flex flex-col gap-3 py-3 min-[700px]:flex-row min-[700px]:items-center">
          <Skeleton className="h-8 min-[700px]:flex-1" />
          <div className="grid grid-cols-2 gap-2 min-[700px]:flex min-[700px]:shrink-0">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-8 min-[700px]:w-32" />
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="hidden min-[860px]:block">
        <CardContent className="flex flex-col gap-3 py-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-full" />
          ))}
        </CardContent>
      </Card>

      <div className="flex flex-col gap-2 min-[860px]:hidden">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    </div>
  );
}
