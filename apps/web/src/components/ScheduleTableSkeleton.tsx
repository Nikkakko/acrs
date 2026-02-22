import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

/** Skeleton loading state for the schedule grid. */
export function ScheduleTableSkeleton() {
  const rows = 8;
  const columns = 4;

  return (
    <div className="overflow-auto rounded-lg border border-border bg-card shadow-sm">
      <Table className="min-w-[980px]">
        <TableHeader>
          <TableRow className="bg-muted hover:bg-muted">
            <TableHead className="w-20 px-4 py-3">
              <Skeleton className="h-3 w-12" />
            </TableHead>
            {Array.from({ length: columns }).map((_, i) => (
              <TableHead
                key={i}
                className="min-w-[220px] px-4 py-3"
              >
                <Skeleton className="h-4 w-24" />
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <TableRow key={rowIndex} className="group">
              <TableCell className="whitespace-nowrap px-4 py-0">
                <Skeleton className="h-3 w-10" />
              </TableCell>
              {Array.from({ length: columns }).map((_, colIndex) => (
                <TableCell
                  key={colIndex}
                  className="min-w-[220px] py-0"
                  style={{ height: 48 }}
                >
                  <Skeleton className="h-9 w-full" />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
