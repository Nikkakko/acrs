import type { UseFormReturn } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ServiceMultiSelect } from "@/components/ServiceMultiSelect";
import { ConfirmDeleteDialog } from "@/components/ConfirmDeleteDialog";
import type { ReservationFormValues } from "@/lib/schemas";
import type { Staff } from "@/lib/types";

type Service = { id: number; name: string; price?: string; color?: string };

type ReservationDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingId: number | null;
  form: UseFormReturn<ReservationFormValues>;
  onSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
  onDeleteClick: () => void;
  onDeleteConfirm: () => Promise<void>;
  deleteOpen: boolean;
  onDeleteOpenChange: (open: boolean) => void;
  staff: Staff[];
  services: Service[];
  createPending: boolean;
  updatePending: boolean;
  removePending: boolean;
};

export function ReservationDialog({
  open,
  onOpenChange,
  editingId,
  form,
  onSubmit,
  onDeleteClick,
  onDeleteConfirm,
  deleteOpen,
  onDeleteOpenChange,
  staff,
  services,
  createPending,
  updatePending,
  removePending,
}: ReservationDialogProps) {
  const timeOptions = [
    { label: "30 min", value: 30 },
    { label: "60 min", value: 60 },
    { label: "90 min", value: 90 },
    { label: "120 min", value: 120 },
  ];

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Edit Reservation" : "New Reservation"}
            </DialogTitle>
            <DialogDescription>
              Choose specialist, duration, and multiple services.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={onSubmit} className="flex flex-col gap-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <Input {...field} readOnly />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="startTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="startTime">Start Time</FormLabel>
                    <FormControl>
                      <Input
                        type="time"
                        id="startTime"
                        step="1"
                        {...field}
                        className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="specialistId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Specialist</FormLabel>
                    <Select
                      value={String(field.value)}
                      onValueChange={v => field.onChange(Number(v))}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select specialist" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {staff.map(s => (
                          <SelectItem key={s.id} value={String(s.id)}>
                            {s.first_name} {s.last_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="durationMin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration</FormLabel>
                    <Select
                      value={String(field.value)}
                      onValueChange={v => field.onChange(Number(v))}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {timeOptions.map(option => (
                          <SelectItem
                            key={option.value}
                            value={String(option.value)}
                          >
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="serviceIds"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Services</FormLabel>
                    <FormControl>
                      <ServiceMultiSelect
                        services={services}
                        value={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-2">
                <Button type="submit" disabled={createPending || updatePending}>
                  Save
                </Button>
                {editingId && (
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={onDeleteClick}
                    disabled={removePending}
                  >
                    Delete
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <ConfirmDeleteDialog
        open={deleteOpen}
        onOpenChange={onDeleteOpenChange}
        title="Delete reservation?"
        description="This action cannot be undone."
        onConfirm={onDeleteConfirm}
        isLoading={removePending}
      />
    </>
  );
}
