import { Button } from "@/components/ui/button";
import { CardHeader } from "@/components/ui/card";

type StaffHeaderProps = {
  onAddNew: () => void;
};

export function StaffHeader({ onAddNew }: StaffHeaderProps) {
  return (
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <h2 className="text-2xl font-semibold">Staff</h2>
      <Button onClick={onAddNew}>Add New</Button>
    </CardHeader>
  );
}
