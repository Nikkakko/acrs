import { useCallback, useState } from "react";
import { useQueryState } from "nuqs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Users } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/EmptyState";
import { StaffListSkeleton } from "@/components/StaffListSkeleton";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ConfirmDeleteDialog } from "@/components/ConfirmDeleteDialog";
import { useStaffMutations, useStaffQuery } from "@/hooks/useStaff";
import type { Staff } from "@/lib/types";
import { staffFormSchema, type StaffFormValues } from "@/lib/schemas";
import { ImageUpload } from "@/components/ImageUpload";
import { getStaffPhotoUrl, uploadStaffPhoto } from "@/services/staffApi";

export function StaffPage() {
  const [q, setQ] = useQueryState("q", { defaultValue: "" });
  const [open, setOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editing, setEditing] = useState<Staff | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  const { data: rows = [], isPending } = useStaffQuery(q);
  const { create, update, remove } = useStaffMutations();

  const form = useForm<StaffFormValues>({
    resolver: zodResolver(staffFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      photoUrl: "",
    },
  });

  const openCreate = useCallback(() => {
    setEditing(null);
    setPhotoFile(null);
    form.reset({ firstName: "", lastName: "", photoUrl: "" });
    setOpen(true);
  }, [form]);

  const openEdit = useCallback(
    (row: Staff) => {
      setEditing(row);
      setPhotoFile(null);
      form.reset({
        firstName: row.first_name,
        lastName: row.last_name,
        photoUrl: row.photo_url || "",
      });
      setOpen(true);
    },
    [form],
  );

  const onSubmit = form.handleSubmit(async values => {
    let photoUrl: string | undefined = values.photoUrl || undefined;
    if (photoFile) {
      try {
        const { path } = await uploadStaffPhoto(photoFile);
        photoUrl = path;
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Failed to upload image";
        toast.error(msg);
        form.setError("photoUrl", { type: "manual", message: msg });
        return;
      }
    }
    const payload = {
      firstName: values.firstName,
      lastName: values.lastName,
      photoUrl,
    };
    try {
      if (editing) {
        await update.mutateAsync({ id: editing.id, payload });
        toast.success("Staff updated");
      } else {
        await create.mutateAsync(payload);
        toast.success("Staff added");
      }
      setPhotoFile(null);
      setOpen(false);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to save";
      toast.error(msg);
      form.setError("firstName", { type: "manual", message: msg });
    }
  });

  const onDeleteClick = (id: number) => {
    setDeleteId(id);
    setDeleteOpen(true);
  };

  const onDeleteConfirm = async () => {
    if (deleteId === null) return;
    try {
      await remove.mutateAsync(deleteId);
      toast.success("Staff removed");
      setDeleteOpen(false);
      setDeleteId(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete");
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <h2 className="text-2xl font-semibold">Staff</h2>
        <Button onClick={openCreate}>Add New</Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input
          placeholder="Search by name or surname"
          value={q}
          onChange={e => setQ(e.target.value)}
          className="max-w-sm"
        />

        {isPending ? (
          <StaffListSkeleton />
        ) : rows.length === 0 ? (
          <EmptyState
            icon={<Users className="h-6 w-6" />}
            title={q ? "No matching staff" : "No staff yet"}
            description={
              q
                ? "Try a different search term."
                : "Add your first specialist to get started."
            }
            action={
              !q ? <Button onClick={openCreate}>Add New</Button> : undefined
            }
          />
        ) : (
          <ul className="flex flex-col gap-2">
            {rows.map(s => (
              <li
                key={s.id}
                className="flex items-center gap-3 rounded-lg border border-border bg-card p-3 shadow-sm transition-shadow hover:shadow"
              >
                <img
                  className="h-12 w-12 rounded-full object-cover"
                  src={getStaffPhotoUrl(s.photo_url)}
                  alt={`${s.first_name} ${s.last_name}`}
                  width={48}
                  height={48}
                />
                <div className="flex-1">
                  <strong className="text-sm font-medium">
                    {s.first_name} {s.last_name}
                  </strong>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => openEdit(s)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => onDeleteClick(s.id)}
                  >
                    Delete
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editing ? "Edit Staff" : "Add Staff"}</DialogTitle>
              <DialogDescription>Manage specialist data.</DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={onSubmit} className="flex flex-col gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First name</FormLabel>
                      <FormControl>
                        <Input placeholder="First name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last name</FormLabel>
                      <FormControl>
                        <Input placeholder="Last name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="photoUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Photo</FormLabel>
                      <FormControl>
                        <ImageUpload
                          value={field.value || undefined}
                          file={photoFile}
                          resolveUrl={getStaffPhotoUrl}
                          onFileSelect={f => {
                            setPhotoFile(f);
                            if (!f) field.onChange("");
                          }}
                          onClear={() => {
                            setPhotoFile(null);
                            field.onChange("");
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  disabled={create.isPending || update.isPending}
                >
                  Save
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        <ConfirmDeleteDialog
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
          title="Delete staff member?"
          description="This action cannot be undone."
          onConfirm={onDeleteConfirm}
          isLoading={remove.isPending}
        />
      </CardContent>
    </Card>
  );
}
