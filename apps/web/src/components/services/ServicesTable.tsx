import { X } from "lucide-react";
import { DndContext, PointerSensor, closestCenter, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, horizontalListSortingStrategy } from "@dnd-kit/sortable";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { SortableColumnHeader } from "./SortableColumnHeader";
import type { CustomField, Service } from "@/lib/types";
import type { DragEndEvent } from "@dnd-kit/core";

type ServicesTableProps = {
  rows: Service[];
  orderedFields: CustomField[];
  columnIds: string[];
  onEdit: (row: Service) => void;
  onDelete: (id: number) => void;
  onDeleteField: (fieldId: number) => (e: React.MouseEvent) => void;
  onColumnDragEnd: (event: DragEndEvent) => void;
};

export function ServicesTable({ rows, orderedFields, columnIds, onEdit, onDelete, onDeleteField, onColumnDragEnd }: ServicesTableProps) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  return (
    <div className="overflow-auto rounded-lg border border-border">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onColumnDragEnd}>
        <Table>
          <TableHeader>
            <TableRow className="bg-muted hover:bg-muted">
              <TableHead>Name</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Color</TableHead>
              <SortableContext items={columnIds} strategy={horizontalListSortingStrategy}>
                {orderedFields.map(f => (
                  <SortableColumnHeader key={f.id} id={`column-${f.id}`} actions={
                    <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={onDeleteField(f.id)} aria-label={`Remove ${f.name} column`}>
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  }>
                    {f.name}
                  </SortableColumnHeader>
                ))}
              </SortableContext>
              <TableHead className="w-[140px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map(s => (
              <TableRow key={s.id}>
                <TableCell className="font-medium">{s.name}</TableCell>
                <TableCell>{s.price}</TableCell>
                <TableCell>
                  <span className="inline-block h-4 w-4 rounded-full border border-border" style={{ background: s.color }} />
                </TableCell>
                {orderedFields.map(f => (
                  <TableCell key={f.id}>{s.customFields?.[String(f.id)] || "-"}</TableCell>
                ))}
                <TableCell>
                  <div className="flex gap-2">
                    <Button variant="secondary" size="sm" onClick={() => onEdit(s)}>Edit</Button>
                    <Button variant="destructive" size="sm" onClick={() => onDelete(s.id)}>Delete</Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DndContext>
    </div>
  );
}
