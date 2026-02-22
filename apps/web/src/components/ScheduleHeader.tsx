import { DateNavigator } from "@/components/DateNavigator";

type ScheduleHeaderProps = {
  date: string;
  onDateChange: (date: string) => void;
};

export function ScheduleHeader({ date, onDateChange }: ScheduleHeaderProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border bg-card px-0 pb-4">
      <h1 className="text-2xl font-medium tracking-tight text-foreground">
        Schedule
      </h1>
      <DateNavigator date={date} onDateChange={onDateChange} />
    </div>
  );
}
