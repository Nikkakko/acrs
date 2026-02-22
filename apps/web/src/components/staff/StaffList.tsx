import { Button } from "@/components/ui/button";
import type { Staff } from "@/lib/types";
import { getStaffPhotoUrl } from "@/services/staffApi";

type StaffListProps = {
  rows: Staff[];
  onEdit: (row: Staff) => void;
  onDelete: (id: number) => void;
};

export function StaffList({ rows, onEdit, onDelete }: StaffListProps) {
  return (
    <ul className="flex flex-col gap-2">
      {rows.map(s => (
        <li key={s.id} className="flex items-center gap-3 rounded-lg border border-border bg-card p-3 shadow-sm transition-shadow hover:shadow">
          <img className="h-12 w-12 rounded-full object-cover" src={getStaffPhotoUrl(s.photo_url)} alt={`${s.first_name} ${s.last_name}`} width={48} height={48} />
          <div className="flex-1">
            <strong className="text-sm font-medium">{s.first_name} {s.last_name}</strong>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={() => onEdit(s)}>Edit</Button>
            <Button variant="destructive" size="sm" onClick={() => onDelete(s.id)}>Delete</Button>
          </div>
        </li>
      ))}
    </ul>
  );
}
