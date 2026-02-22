import { Skeleton } from "@/components/ui/skeleton";

const ROW_COUNT = 5;

/** Skeleton loading state for the staff list. */
export function StaffListSkeleton() {
  return (
    <ul className="flex flex-col gap-2">
      {Array.from({ length: ROW_COUNT }).map((_, i) => (
        <li
          key={i}
          className="flex items-center gap-3 rounded-lg border border-border bg-card p-3"
        >
          <Skeleton className="h-12 w-12 shrink-0 rounded-full" />
          <div className="flex-1">
            <Skeleton className="h-4 w-32" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-8 w-12" />
            <Skeleton className="h-8 w-14" />
          </div>
        </li>
      ))}
    </ul>
  );
}
