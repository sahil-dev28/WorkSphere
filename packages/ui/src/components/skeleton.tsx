import { cn } from "@WorkSphere/ui/lib/utils";

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("shimmer rounded-md bg-muted", className)}
      {...props}
    />
  );
}

export { Skeleton };
