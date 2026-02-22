import type { UseFormReturn } from "react-hook-form";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SERVICE_COLORS } from "@/lib/colors";
import type { CustomField, Service } from "@/lib/types";
import type { ServiceFormValues } from "@/lib/schemas";

type ServiceFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: UseFormReturn<ServiceFormValues>;
  editing: Service | null;
  orderedFields: CustomField[];
  onSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
  createPending: boolean;
  updatePending: boolean;
};

export function ServiceFormDialog({ open, onOpenChange, form, editing, orderedFields, onSubmit, createPending, updatePending }: ServiceFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editing ? "Edit Service" : "Add Service"}</DialogTitle>
          <DialogDescription>Define service pricing, color, and custom fields.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <FormField control={form.control} name="name" render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl><Input placeholder="Service name" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="price" render={({ field }) => (
              <FormItem>
                <FormLabel>Price</FormLabel>
                <FormControl><Input type="number" min={0} placeholder="0" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="color" render={({ field }) => (
              <FormItem>
                <FormLabel>Color</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {SERVICE_COLORS.map(color => (
                      <SelectItem key={color} value={color}>
                        <div className="flex items-center gap-2">
                          <span className="inline-block h-4 w-4 rounded-full border" style={{ background: color }} />
                          {color}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
            {orderedFields.map(f => (
              <FormField key={f.id} control={form.control} name={`customFieldValues.${f.id}` as const} render={({ field }) => (
                <FormItem>
                  <FormLabel>{f.name}</FormLabel>
                  <FormControl><Input placeholder={f.name} {...field} value={field.value ?? ""} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            ))}
            <Button type="submit" disabled={createPending || updatePending}>Save</Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
