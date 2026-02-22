import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { parse } from "date-fns";
import { toDateOnly, today } from "@/lib/timeUtils";
import { DatePicker } from "@/components/ui/date-picker";

type DateNavigatorProps = {
  date: string;
  onDateChange: (date: string) => void;
};

export function DateNavigator({ date, onDateChange }: DateNavigatorProps) {
  const prevDay = () => {
    const d = parse(date, "yyyy-MM-dd", new Date());
    d.setDate(d.getDate() - 1);
    onDateChange(toDateOnly(d));
  };

  const nextDay = () => {
    const d = parse(date, "yyyy-MM-dd", new Date());
    d.setDate(d.getDate() + 1);
    onDateChange(toDateOnly(d));
  };

  const goToday = () => onDateChange(today());

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="icon" onClick={prevDay} className="h-9 w-9 rounded-full border-border">
        <ChevronLeft className="h-5 w-5" />
      </Button>
      <DatePicker selected={parse(date, "yyyy-MM-dd", new Date())} onSelect={(d) => d && onDateChange(toDateOnly(d))} />
      <Button variant="outline" size="icon" onClick={nextDay} className="h-9 w-9 rounded-full border-border">
        <ChevronRight className="h-5 w-5" />
      </Button>
      <Button variant="outline" onClick={goToday} className="rounded-lg border-border text-sm font-medium">
        Today
      </Button>
    </div>
  );
}
