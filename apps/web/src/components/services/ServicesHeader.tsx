import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CardHeader } from "@/components/ui/card";

type ServicesHeaderProps = {
  searchValue: string;
  onSearchChange: (value: string) => void;
  onAddCustomField: () => void;
  onAddNew: () => void;
};

export function ServicesHeader({ searchValue, onSearchChange, onAddCustomField, onAddNew }: ServicesHeaderProps) {
  return (
    <>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <h2 className="text-2xl font-semibold">Services</h2>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={onAddCustomField}>+ Custom Field</Button>
          <Button onClick={onAddNew}>Add New</Button>
        </div>
      </CardHeader>
      <div className="px-6 pb-4">
        <Input placeholder="Search by name or custom fields" value={searchValue} onChange={e => onSearchChange(e.target.value)} className="max-w-sm" />
      </div>
    </>
  );
}
