import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ConfirmDeleteDialog } from '@/components/ConfirmDeleteDialog';
import { useStaffMutations, useStaffQuery } from '@/hooks/useStaff';
import type { Staff } from '@/lib/types';
import { staffFormSchema, type StaffFormValues } from '@/lib/schemas';

export function StaffPage() {
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editing, setEditing] = useState<Staff | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data: rows = [] } = useStaffQuery(q);
  const { create, update, remove } = useStaffMutations(q);

  const form = useForm<StaffFormValues>({
    resolver: zodResolver(staffFormSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      photoUrl: ''
    }
  });

  const openCreate = () => {
    setEditing(null);
    form.reset({ firstName: '', lastName: '', photoUrl: '' });
    setOpen(true);
  };

  const openEdit = (row: Staff) => {
    setEditing(row);
    form.reset({
      firstName: row.first_name,
      lastName: row.last_name,
      photoUrl: row.photo_url || ''
    });
    setOpen(true);
  };

  const onSubmit = form.handleSubmit(async (values) => {
    const payload = {
      firstName: values.firstName,
      lastName: values.lastName,
      photoUrl: values.photoUrl || undefined
    };
    try {
      if (editing) {
        await update.mutateAsync({ id: editing.id, payload });
      } else {
        await create.mutateAsync(payload);
      }
      setOpen(false);
    } catch (err) {
      form.setError('firstName', {
        type: 'manual',
        message: err instanceof Error ? err.message : 'Failed to save'
      });
    }
  });

  const onDeleteClick = (id: number) => {
    setDeleteId(id);
    setDeleteOpen(true);
  };

  const onDeleteConfirm = async () => {
    if (deleteId === null) return;
    await remove.mutateAsync(deleteId);
    setDeleteOpen(false);
    setDeleteId(null);
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
          onChange={(e) => setQ(e.target.value)}
          className="max-w-sm"
        />

        <ul className="flex flex-col gap-2">
          {rows.map((s) => (
            <li
              key={s.id}
              className="flex items-center gap-3 rounded-lg border border-border bg-card p-3 shadow-sm transition-shadow hover:shadow"
            >
              <img
                className="h-12 w-12 rounded-full object-cover"
                src={s.photo_url || 'https://via.placeholder.com/48'}
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
                <Button variant="secondary" size="sm" onClick={() => openEdit(s)}>
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

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editing ? 'Edit Staff' : 'Add Staff'}</DialogTitle>
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
                      <FormLabel>Photo URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://..." {...field} />
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
