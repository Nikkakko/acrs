import { DragEvent, FormEvent, useMemo, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '../components/ui/dialog';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import {
  useServiceColumnOrderQuery,
  useServiceFieldsQuery,
  useServiceMutations,
  useServicesQuery
} from '../hooks/useServices';
import { CustomField, Service } from '../lib/types';

type ServiceForm = {
  name: string;
  price: string;
  color: string;
  customFieldValues: Record<string, string>;
};

const EMPTY_FORM: ServiceForm = {
  name: '',
  price: '',
  color: '#53B3CB',
  customFieldValues: {}
};

export function ServicesPage() {
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Service | null>(null);
  const [form, setForm] = useState<ServiceForm>(EMPTY_FORM);

  const { data: rows = [] } = useServicesQuery(q);
  const { data: fields = [] } = useServiceFieldsQuery();
  const { data: orderRows = [] } = useServiceColumnOrderQuery();
  const { create, update, remove, createField, updateColumnOrder } = useServiceMutations();

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

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setOpen(true);
  };

  const openEdit = (row: Service) => {
    setEditing(row);
    setForm({
      name: row.name,
      price: row.price,
      color: row.color,
      customFieldValues: row.customFields || {}
    });
    setOpen(true);
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const payload = {
      name: form.name,
      price: Number(form.price),
      color: form.color,
      customFieldValues: form.customFieldValues
    };

    if (editing) {
      await update.mutateAsync({ id: editing.id, payload });
    } else {
      await create.mutateAsync(payload);
    }

    setOpen(false);
  };

  const onDelete = async (id: number) => {
    if (!confirm('Delete this service?')) return;
    await remove.mutateAsync(id);
  };

  const onAddField = async () => {
    const name = prompt('Field name');
    if (!name) return;
    await createField.mutateAsync(name);
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
    <section>
      <div className="section-head">
        <h2>Services</h2>
        <div className="row">
          <Button variant="secondary" onClick={onAddField}>
            + Custom Field
          </Button>
          <Button onClick={openCreate}>Add New</Button>
        </div>
      </div>

      <Input placeholder="Search by name or custom fields" value={q} onChange={(e) => setQ(e.target.value)} />

      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Price</th>
            <th>Color</th>
            {orderedFields.map((f) => (
              <th
                key={f.id}
                draggable
                onDragStart={(e) => onHeaderDragStart(e, f.id)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => onHeaderDrop(e, f.id)}
                title="Drag to reorder"
              >
                {f.name}
              </th>
            ))}
            <th />
          </tr>
        </thead>
        <tbody>
          {rows.map((s) => (
            <tr key={s.id}>
              <td>{s.name}</td>
              <td>{s.price}</td>
              <td>
                <span className="swatch" style={{ background: s.color }} />
              </td>
              {orderedFields.map((f) => (
                <td key={f.id}>{s.customFields?.[String(f.id)] || '-'}</td>
              ))}
              <td>
                <div className="row">
                  <Button variant="secondary" onClick={() => openEdit(s)}>
                    Edit
                  </Button>
                  <Button variant="destructive" onClick={() => onDelete(s.id)}>
                    Delete
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Service' : 'Add Service'}</DialogTitle>
            <DialogDescription>Define service pricing, color, and custom fields.</DialogDescription>
          </DialogHeader>

          <form onSubmit={onSubmit} className="stack-form">
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Name" required />
            <Input
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              placeholder="Price"
              type="number"
              min="0"
              required
            />
            <label className="field-label">
              Color
              <Input type="color" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} />
            </label>

            {orderedFields.map((f) => (
              <Input
                key={f.id}
                placeholder={f.name}
                value={form.customFieldValues[String(f.id)] || ''}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    customFieldValues: {
                      ...prev.customFieldValues,
                      [String(f.id)]: e.target.value
                    }
                  }))
                }
              />
            ))}

            <Button type="submit" disabled={create.isPending || update.isPending}>
              Save
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  );
}
