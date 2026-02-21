import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { today } from "@/lib/timeUtils";
import { Calendar } from "@/components/ui/calendar";
import { DatePicker } from "./ui/date-picker";

type DateNavigatorProps = {
  date: string;
  onDateChange: (date: string) => void;
};

export function DateNavigator({ date, onDateChange }: DateNavigatorProps) {
  const prevDay = () => {
    const d = new Date(date);
    d.setDate(d.getDate() - 1);
    onDateChange(d.toISOString().slice(0, 10));
  };

  const nextDay = () => {
    const d = new Date(date);
    d.setDate(d.getDate() + 1);
    onDateChange(d.toISOString().slice(0, 10));
  };

  const goToday = () => onDateChange(today());

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="icon"
        onClick={prevDay}
        className="h-9 w-9 rounded-full border-border"
      >
        <ChevronLeft className="h-5 w-5" />
      </Button>

      <DatePicker
        selected={new Date(date)}
        onSelect={date => onDateChange(date?.toISOString() ?? today())}
      />

      <Button
        variant="outline"
        size="icon"
        onClick={nextDay}
        className="h-9 w-9 rounded-full border-border"
      >
        <ChevronRight className="h-5 w-5" />
      </Button>
      <Button
        variant="outline"
        onClick={goToday}
        className="rounded-lg border-border text-sm font-medium"
      >
        Today
      </Button>
    </div>
  );
}
