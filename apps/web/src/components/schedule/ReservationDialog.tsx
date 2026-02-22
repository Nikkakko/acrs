import type { UseFormReturn } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
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
import { DatePicker } from "@/components/ui/date-picker";
import { ServiceMultiSelect } from "@/components/services/ServiceMultiSelect";
import { ConfirmDeleteDialog } from "@/components/shared/ConfirmDeleteDialog";
import type { ReservationFormValues } from "@/lib/schemas";
import type { CustomField, Staff } from "@/lib/types";
import { formatPrice } from "@/lib/formatPrice";
import { parse } from "date-fns";
import { TIME_SLOTS, toDateOnly, today } from "@/lib/timeUtils";
import { RESERVATION_DURATIONS } from "@/lib/constants";

type Service = {
  id: number;
  name: string;
  price?: string;
  color?: string;
  customFields?: Record<string, string>;
};

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
  orderedFields?: CustomField[];
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
  orderedFields = [],
  createPending,
  updatePending,
  removePending,
}: ReservationDialogProps) {

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
            <form onSubmit={onSubmit} className="flex flex-col gap-4 max-w-xl">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col gap-2">
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <DatePicker
                        selected={parse(
                          field.value || today(),
                          "yyyy-MM-dd",
                          new Date(),
                        )}
                        onSelect={d => d && field.onChange(toDateOnly(d))}
                      />
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
                    <FormLabel>Start Time</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select time" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {TIME_SLOTS.map(slot => (
                          <SelectItem key={slot} value={slot}>
                            {slot}
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
                        {RESERVATION_DURATIONS.map(option => (
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
                        orderedFields={orderedFields}
                        className="max-w-md"
                      />
                    </FormControl>
                    {field.value.length > 0 && (
                      <div className="mt-2 space-y-2 rounded-md border border-border bg-muted/30 p-3">
                        <p className="text-sm font-medium text-muted-foreground">
                          Selected services
                        </p>
                        <ul className="space-y-2">
                          {field.value
                            .map(id => services.find(s => s.id === id))
                            .filter((s): s is Service => Boolean(s))
                            .map(service => (
                              <li key={service.id} className="flex flex-col gap-1 text-sm">
                                <div className="flex items-center gap-2">
                                  {service.color && (
                                    <span
                                      className="size-3 shrink-0 rounded-full border border-border"
                                      style={{ background: service.color }}
                                      aria-hidden
                                    />
                                  )}
                                  <span className="font-medium">
                                    {service.name}
                                    {formatPrice(service.price) && (
                                      <> — {formatPrice(service.price)}</>
                                    )}
                                  </span>
                                </div>
                                {service.customFields &&
                                  orderedFields.length > 0 && (
                                    <div className="ml-5 flex flex-col gap-0.5 text-muted-foreground">
                                      {orderedFields
                                        .filter(
                                          f =>
                                            service.customFields?.[String(f.id)]?.trim(),
                                        )
                                        .map(f => (
                                          <span key={f.id}>
                                            {f.name}:{" "}
                                            {service.customFields?.[String(f.id)]}
                                          </span>
                                        ))}
                                    </div>
                                  )}
                              </li>
                            ))}
                        </ul>
                      </div>
                    )}
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
