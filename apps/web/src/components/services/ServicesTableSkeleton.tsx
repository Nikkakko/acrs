import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

const ROW_COUNT = 6;
const CUSTOM_COLUMNS = 2;

export function ServicesTableSkeleton() {
  return (
    <div className="overflow-auto rounded-lg border border-border">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted hover:bg-muted">
            <TableHead><Skeleton className="h-4 w-16" /></TableHead>
            <TableHead><Skeleton className="h-4 w-12" /></TableHead>
            <TableHead><Skeleton className="h-4 w-10" /></TableHead>
            {Array.from({ length: CUSTOM_COLUMNS }).map((_, i) => (
              <TableHead key={i}><Skeleton className="h-4 w-16" /></TableHead>
            ))}
            <TableHead className="w-[140px]" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: ROW_COUNT }).map((_, rowIndex) => (
            <TableRow key={rowIndex}>
              <TableCell><Skeleton className="h-4 w-28" /></TableCell>
              <TableCell><Skeleton className="h-4 w-12" /></TableCell>
              <TableCell><Skeleton className="h-4 w-4 rounded-full" /></TableCell>
              {Array.from({ length: CUSTOM_COLUMNS }).map((_, i) => (
                <TableCell key={i}><Skeleton className="h-4 w-20" /></TableCell>
              ))}
              <TableCell>
                <div className="flex gap-2">
                  <Skeleton className="h-8 w-12" />
                  <Skeleton className="h-8 w-14" />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
