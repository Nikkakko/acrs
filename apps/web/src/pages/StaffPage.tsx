import { useEffect, useRef, useState } from "react";
import { useQueryState } from "nuqs";
import { Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/EmptyState";
import { StaffListSkeleton } from "@/components/StaffListSkeleton";
import { StaffHeader } from "@/components/StaffHeader";
import { StaffList } from "@/components/StaffList";
import { StaffFormDialog } from "@/components/StaffFormDialog";
import { ConfirmDeleteDialog } from "@/components/ConfirmDeleteDialog";
import { useStaffQuery } from "@/hooks/useStaff";
import { useStaffPage } from "@/hooks/useStaffPage";
import { useDebounce } from "@/hooks/useDebounce";
import { SEARCH_DEBOUNCE_MS } from "@/lib/constants";

export function StaffPage() {
  const [q, setQ] = useQueryState("q", { defaultValue: "" });
  const [inputValue, setInputValue] = useState(q ?? "");
  const debouncedQ = useDebounce(inputValue, SEARCH_DEBOUNCE_MS);
  const lastSyncedQRef = useRef(q ?? "");

  useEffect(() => {
    setQ(debouncedQ);
    lastSyncedQRef.current = debouncedQ;
  }, [debouncedQ, setQ]);

  useEffect(() => {
    if ((q ?? "") !== lastSyncedQRef.current) {
      setInputValue(q ?? "");
      lastSyncedQRef.current = q ?? "";
    }
  }, [q]);

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
