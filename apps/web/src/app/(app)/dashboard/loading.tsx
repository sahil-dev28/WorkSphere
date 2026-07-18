import { Card, CardContent } from "@WorkSphere/ui/components/card";
import { Skeleton } from "@WorkSphere/ui/components/skeleton";

// File-convention loading UI — Next wraps the async page in a Suspense
// boundary automatically. Role isn't known yet at this point, so this
// approximates the more complex (admin) shape; the employee variant just
// pops in with different content once its own fetches resolve.
export default function DashboardLoading() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <Skeleton className="h-6 w-48" />

      <div className="grid grid-cols-1 gap-4 min-[860px]:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="flex flex-col gap-2 py-2">
              <Skeleton className="size-5" />
              <Skeleton className="h-7 w-12" />
              <Skeleton className="h-3 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 min-[1100px]:grid-cols-[1.6fr_1fr]">
        <Card>
          <CardContent className="flex flex-col gap-3 py-4">
            {Array.from({ length: 4 }).map((_, j) => (
              <Skeleton key={j} className="h-8 w-full" />
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <Skeleton className="h-36 w-full" />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 min-[1100px]:grid-cols-[1.6fr_1fr]">
        <Card>
          <CardContent className="py-4">
            <Skeleton className="h-48 w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col gap-3 py-4">
            {Array.from({ length: 5 }).map((_, j) => (
              <Skeleton key={j} className="h-8 w-full" />
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
