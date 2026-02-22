import { Button } from "@/components/ui/button";
import { CardHeader } from "@/components/ui/card";
import { Input } from "../ui/input";
import { useDebouncedSearch } from "@/hooks/useDebouncedSearch";

type StaffHeaderProps = {
  onAddNew: () => void;
};

export function StaffHeader({ onAddNew }: StaffHeaderProps) {
  const { inputValue, setInputValue } = useDebouncedSearch();
  return (
    <>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <h2 className="text-2xl font-semibold">Staff</h2>
        <Button onClick={onAddNew}>Add New</Button>
      </CardHeader>

      <div className="px-6 pb-4">
        <Input
          placeholder="Search by name"
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          className="max-w-sm"
        />
      </div>
    </>
  );
}
