import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { TableHead } from "@/components/ui/table";

type SortableColumnHeaderProps = {
  id: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
};

export function SortableColumnHeader({ id, children, actions }: SortableColumnHeaderProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  return (
    <TableHead ref={setNodeRef} style={style} title="Drag to reorder" className={isDragging ? "opacity-50" : ""}>
      <div className="flex items-center gap-1">
        <span {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing shrink-0">{children}</span>
        {actions}
      </div>
    </TableHead>
  );
}
