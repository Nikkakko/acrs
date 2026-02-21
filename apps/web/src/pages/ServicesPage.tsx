import { DragEvent, useMemo, useState } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { ConfirmDeleteDialog } from '@/components/ConfirmDeleteDialog';
import {
  useServiceColumnOrderQuery,
  useServiceFieldsQuery,
  useServiceMutations,
  useServicesQuery
} from '@/hooks/useServices';
import type { CustomField, Service } from '@/lib/types';
import {
  serviceFormSchema,
  customFieldSchema,
  type ServiceFormValues
} from '@/lib/schemas';
import { SERVICE_COLORS } from '@/lib/colors';
import { z } from 'zod';

export function ServicesPage() {
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const [fieldOpen, setFieldOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editing, setEditing] = useState<Service | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data: rows = [] } = useServicesQuery(q);
  const { data: fields = [] } = useServiceFieldsQuery();
  const { data: orderRows = [] } = useServiceColumnOrderQuery();
  const { create, update, remove, createField, updateColumnOrder } =
    useServiceMutations();

  const orderedFields = useMemo<CustomField[]>(() => {
    const customIdsInOrder = orderRows
      .map((row) => row.columnKey)
      .filter((key) => key.startsWith('custom_'))
      .map((key) => Number(key.replace('custom_', '')))
      .filter((id) => fields.some((f) => f.id === id));

    const missing = fields.map((f) => f.id).filter((id) => !customIdsInOrder.includes(id));
    const fullOrder = [...customIdsInOrder, ...missing];

    const map = new Map(fields.map((f) => [f.id, f]));
    return fullOrder.map((id) => map.get(id)).filter((f): f is CustomField => Boolean(f));
  }, [fields, orderRows]);

  const form = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceFormSchema) as never,
    defaultValues: {
      name: '',
      price: 0,
      color: '#53B3CB',
      customFieldValues: {}
    }
  });

  const fieldForm = useForm<z.infer<typeof customFieldSchema>>({
    resolver: zodResolver(customFieldSchema),
    defaultValues: { name: '' }
  });

  const openCreate = () => {
    setEditing(null);
    form.reset({
      name: '',
      price: 0,
      color: '#53B3CB',
      customFieldValues: Object.fromEntries(orderedFields.map((f) => [String(f.id), '']))
    });
    setOpen(true);
  };

  const openEdit = (row: Service) => {
    setEditing(row);
    form.reset({
      name: row.name,
      price: Number(row.price) || 0,
      color: row.color,
      customFieldValues: row.customFields ?? {}
    });
    setOpen(true);
  };

  const onSubmit = form.handleSubmit(async (values) => {
    const payload = {
      name: values.name,
      price: Number(values.price),
      color: values.color,
      customFieldValues: values.customFieldValues ?? {}
    };
    try {
      if (editing) {
        await update.mutateAsync({ id: editing.id, payload });
      } else {
        await create.mutateAsync(payload);
      }
      setOpen(false);
    } catch (err) {
      form.setError('name', {
        type: 'manual',
        message: err instanceof Error ? err.message : 'Failed to save'
      });
    }
  });

  const onAddFieldClick = () => {
    fieldForm.reset({ name: '' });
    setFieldOpen(true);
  };

  const onAddFieldSubmit = fieldForm.handleSubmit(async (values) => {
    await createField.mutateAsync(values.name);
    setFieldOpen(false);
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

  const onHeaderDragStart = (e: DragEvent<HTMLTableHeaderCellElement>, id: number) => {
    e.dataTransfer.setData('text/plain', String(id));
  };

  const onHeaderDrop = async (e: DragEvent<HTMLTableHeaderCellElement>, targetId: number) => {
    e.preventDefault();
    const sourceId = Number(e.dataTransfer.getData('text/plain'));
    if (!sourceId || sourceId === targetId) return;

    const order = orderedFields.map((f) => f.id);
    const from = order.indexOf(sourceId);
    const to = order.indexOf(targetId);
    if (from < 0 || to < 0) return;

    order.splice(from, 1);
    order.splice(to, 0, sourceId);
    await updateColumnOrder.mutateAsync(order.map((id) => `custom_${id}`));
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <h2 className="text-2xl font-semibold">Services</h2>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={onAddFieldClick}>
            + Custom Field
          </Button>
          <Button onClick={openCreate}>Add New</Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input
          placeholder="Search by name or custom fields"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="max-w-sm"
        />

        <div className="overflow-auto rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted hover:bg-muted">
                <TableHead>Name</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Color</TableHead>
                {orderedFields.map((f) => (
                  <TableHead
                    key={f.id}
                    draggable
                    onDragStart={(e) => onHeaderDragStart(e, f.id)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => onHeaderDrop(e, f.id)}
                    title="Drag to reorder"
                    className="cursor-grab active:cursor-grabbing"
                  >
                    {f.name}
                  </TableHead>
                ))}
                <TableHead className="w-[140px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">{s.name}</TableCell>
                  <TableCell>{s.price}</TableCell>
                  <TableCell>
                    <span
                      className="inline-block h-4 w-4 rounded-full border border-border"
                      style={{ background: s.color }}
                    />
                  </TableCell>
                  {orderedFields.map((f) => (
                    <TableCell key={f.id}>
                      {s.customFields?.[String(f.id)] || '-'}
                    </TableCell>
                  ))}
                  <TableCell>
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
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editing ? 'Edit Service' : 'Add Service'}</DialogTitle>
              <DialogDescription>
                Define service pricing, color, and custom fields.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={onSubmit} className="flex flex-col gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Service name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price</FormLabel>
                      <FormControl>
                        <Input type="number" min={0} placeholder="0" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="color"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Color</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {SERVICE_COLORS.map((color) => (
                            <SelectItem key={color} value={color}>
                              <div className="flex items-center gap-2">
                                <span
                                  className="inline-block h-4 w-4 rounded-full border"
                                  style={{ background: color }}
                                />
                                {color}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {orderedFields.map((f) => (
                  <FormField
                    key={f.id}
                    control={form.control}
                    name={`customFieldValues.${f.id}` as const}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{f.name}</FormLabel>
                        <FormControl>
                          <Input placeholder={f.name} {...field} value={field.value ?? ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}
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

        <Dialog open={fieldOpen} onOpenChange={setFieldOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Custom Field</DialogTitle>
              <DialogDescription>
                Enter a name for the new column. It will be added to the services table.
              </DialogDescription>
            </DialogHeader>
            <Form {...fieldForm}>
              <form onSubmit={onAddFieldSubmit} className="flex flex-col gap-4">
                <FormField
                  control={fieldForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Field name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Notes" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={createField.isPending}>
                  Add
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        <ConfirmDeleteDialog
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
          title="Delete service?"
          description="This action cannot be undone."
          onConfirm={onDeleteConfirm}
          isLoading={remove.isPending}
        />
      </CardContent>
    </Card>
  );
}
