import { Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/EmptyState";
import { StaffListSkeleton } from "@/components/staff/StaffListSkeleton";
import { StaffHeader } from "@/components/staff/StaffHeader";
import { StaffList } from "@/components/staff/StaffList";
import { StaffFormDialog } from "@/components/staff/StaffFormDialog";
import { ConfirmDeleteDialog } from "@/components/shared/ConfirmDeleteDialog";
import { useStaffQuery } from "@/hooks/useStaff";
import { useStaffPage } from "@/hooks/useStaffPage";
import { useDebouncedSearch } from "@/hooks/useDebouncedSearch";

export function StaffPage() {
  const { inputValue, setInputValue, debouncedQ } = useDebouncedSearch();
  const { data: rows = [], isPending } = useStaffQuery(debouncedQ);
  const {
    form,
    open,
    setOpen,
    deleteOpen,
    setDeleteOpen,
    editing,
    photoFile,
    setPhotoFile,
    openCreate,
    openEdit,
    onSubmit,
    onDeleteClick,
    onDeleteConfirm,
    create,
    update,
    remove,
  } = useStaffPage();

  return (
    <Card>
      <StaffHeader onAddNew={openCreate} />
      <CardContent className="space-y-4">
        <Input
          placeholder="Search by name or surname"
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          className="max-w-sm"
        />

        {isPending ? (
          <StaffListSkeleton />
        ) : rows.length === 0 ? (
          <EmptyState
            icon={<Users className="h-6 w-6" />}
            title={debouncedQ ? "No matching staff" : "No staff yet"}
            description={
              debouncedQ
                ? "Try a different search term."
                : "Add your first specialist to get started."
            }
            action={
              !debouncedQ ? (
                <Button onClick={openCreate}>Add New</Button>
              ) : undefined
            }
          />
        ) : (
          <StaffList rows={rows} onEdit={openEdit} onDelete={onDeleteClick} />
        )}

        <StaffFormDialog
          open={open}
          onOpenChange={setOpen}
          form={form}
          editing={editing}
          photoFile={photoFile}
          onPhotoFileChange={setPhotoFile}
          onSubmit={onSubmit}
          createPending={create.isPending}
          updatePending={update.isPending}
        />

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
