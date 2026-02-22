import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { TableHead } from "@/components/ui/table";

type SortableColumnHeaderProps = {
  id: string;
  children: React.ReactNode;
};

export function SortableColumnHeader({ id, children }: SortableColumnHeaderProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <TableHead
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      title="Drag to reorder"
      className={`cursor-grab active:cursor-grabbing ${isDragging ? "opacity-50" : ""}`}
    >
      {children}
    </TableHead>
  );
}
