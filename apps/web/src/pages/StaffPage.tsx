import { FormEvent, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '../components/ui/dialog';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { useStaffMutations, useStaffQuery } from '../hooks/useStaff';
import { Staff } from '../lib/types';

type StaffForm = {
  firstName: string;
  lastName: string;
  photoUrl: string;
};

const EMPTY_FORM: StaffForm = {
  firstName: '',
  lastName: '',
  photoUrl: ''
};

export function StaffPage() {
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Staff | null>(null);
  const [form, setForm] = useState<StaffForm>(EMPTY_FORM);

  const { data: rows = [] } = useStaffQuery(q);
  const { create, update, remove } = useStaffMutations(q);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setOpen(true);
  };

  const openEdit = (row: Staff) => {
    setEditing(row);
    setForm({
      firstName: row.first_name,
      lastName: row.last_name,
      photoUrl: row.photo_url || ''
    });
    setOpen(true);
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (editing) {
      await update.mutateAsync({ id: editing.id, payload: form });
    } else {
      await create.mutateAsync(form);
    }
    setOpen(false);
  };

  const onDelete = async (id: number) => {
    if (!confirm('Delete this staff member?')) return;
    await remove.mutateAsync(id);
  };

  return (
    <section>
      <div className="section-head">
        <h2>Staff</h2>
        <Button onClick={openCreate}>Add New</Button>
      </div>

      <Input placeholder="Search by name or surname" value={q} onChange={(e) => setQ(e.target.value)} />

      <ul className="card-list">
        {rows.map((s) => (
          <li key={s.id} className="card-row">
            <img
              className="avatar"
              src={s.photo_url || 'https://via.placeholder.com/48'}
              alt={`${s.first_name} ${s.last_name}`}
              width={48}
              height={48}
            />
            <div className="grow">
              <strong>
                {s.first_name} {s.last_name}
              </strong>
            </div>
            <Button variant="secondary" onClick={() => openEdit(s)}>
              Edit
            </Button>
            <Button variant="destructive" onClick={() => onDelete(s.id)}>
              Delete
            </Button>
          </li>
        ))}
      </ul>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Staff' : 'Add Staff'}</DialogTitle>
            <DialogDescription>Manage specialist data.</DialogDescription>
          </DialogHeader>
          <form onSubmit={onSubmit} className="stack-form">
            <Input
              placeholder="First name"
              value={form.firstName}
              onChange={(e) => setForm({ ...form, firstName: e.target.value })}
              required
            />
            <Input
              placeholder="Last name"
              value={form.lastName}
              onChange={(e) => setForm({ ...form, lastName: e.target.value })}
              required
            />
            <Input
              placeholder="Photo URL"
              value={form.photoUrl}
              onChange={(e) => setForm({ ...form, photoUrl: e.target.value })}
            />
            <Button type="submit" disabled={create.isPending || update.isPending}>
              Save
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  );
}
