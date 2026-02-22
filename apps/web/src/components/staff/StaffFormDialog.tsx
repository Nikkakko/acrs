import type { UseFormReturn } from "react-hook-form";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { ImageUpload } from "@/components/shared/ImageUpload";
import { getStaffPhotoUrl } from "@/services/staffApi";
import type { Staff } from "@/lib/types";
import type { StaffFormValues } from "@/lib/schemas";

type StaffFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: UseFormReturn<StaffFormValues>;
  editing: Staff | null;
  photoFile: File | null;
  onPhotoFileChange: (file: File | null) => void;
  onSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
  createPending: boolean;
  updatePending: boolean;
};

export function StaffFormDialog({ open, onOpenChange, form, editing, photoFile, onPhotoFileChange, onSubmit, createPending, updatePending }: StaffFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editing ? "Edit Staff" : "Add Staff"}</DialogTitle>
          <DialogDescription>Manage specialist data.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <FormField control={form.control} name="firstName" render={({ field }) => (
              <FormItem>
                <FormLabel>First name</FormLabel>
                <FormControl><Input placeholder="First name" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="lastName" render={({ field }) => (
              <FormItem>
                <FormLabel>Last name</FormLabel>
                <FormControl><Input placeholder="Last name" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="photoUrl" render={({ field }) => (
              <FormItem>
                <FormLabel>Photo</FormLabel>
                <FormControl>
                  <ImageUpload
                    value={field.value || undefined}
                    file={photoFile}
                    resolveUrl={getStaffPhotoUrl}
                    onFileSelect={f => { onPhotoFileChange(f); if (!f) field.onChange(""); }}
                    onClear={() => { onPhotoFileChange(null); field.onChange(""); }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <Button type="submit" disabled={createPending || updatePending}>Save</Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
