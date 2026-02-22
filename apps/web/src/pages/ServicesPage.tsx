import { useEffect, useRef, useState } from "react";
import { useQueryState } from "nuqs";
import { Package } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/EmptyState";
import { ServicesTableSkeleton } from "@/components/ServicesTableSkeleton";
import { ServicesHeader } from "@/components/ServicesHeader";
import { ServicesTable } from "@/components/ServicesTable";
import { ServiceFormDialog } from "@/components/ServiceFormDialog";
import { CustomFieldDialog } from "@/components/CustomFieldDialog";
import { ConfirmDeleteDialog } from "@/components/ConfirmDeleteDialog";
import { useServicesQuery } from "@/hooks/useServices";
import { useServicesPage } from "@/hooks/useServicesPage";
import { useDebounce } from "@/hooks/useDebounce";
import { SEARCH_DEBOUNCE_MS } from "@/lib/constants";

export function ServicesPage() {
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

  const { data: rows = [], isPending } = useServicesQuery(debouncedQ);
  const {
    form,
    fieldForm,
    open,
    setOpen,
    fieldOpen,
    setFieldOpen,
    deleteOpen,
    setDeleteOpen,
    fieldDeleteOpen,
    setFieldDeleteOpen,
    editing,
    orderedFields,
    columnIds,
    openCreate,
    openEdit,
    onSubmit,
    onAddFieldClick,
    onAddFieldSubmit,
    onDeleteClick,
    onDeleteConfirm,
    onDeleteFieldClick,
    onDeleteFieldConfirm,
    handleColumnDragEnd,
    create,
    update,
    remove,
    createField,
    deleteField,
  } = useServicesPage();

  return (
    <Card>
      <ServicesHeader
        searchValue={inputValue}
        onSearchChange={setInputValue}
        onAddCustomField={onAddFieldClick}
        onAddNew={openCreate}
      />
      <CardContent className="space-y-4">
        {isPending ? (
          <ServicesTableSkeleton />
        ) : rows.length === 0 ? (
          <EmptyState
            icon={<Package className="h-6 w-6" />}
            title={debouncedQ ? "No matching services" : "No services yet"}
            description={
              debouncedQ
                ? "Try a different search term."
                : "Add your first service to offer to customers."
            }
            action={
              !debouncedQ ? (
                <Button onClick={openCreate}>Add New</Button>
              ) : undefined
            }
          />
        ) : (
          <ServicesTable
            rows={rows}
            orderedFields={orderedFields}
            columnIds={columnIds}
            onEdit={openEdit}
            onDelete={onDeleteClick}
            onDeleteField={onDeleteFieldClick}
            onColumnDragEnd={handleColumnDragEnd}
          />
        )}

        <ServiceFormDialog
          open={open}
          onOpenChange={setOpen}
          form={form}
          editing={editing}
          orderedFields={orderedFields}
          onSubmit={onSubmit}
          createPending={create.isPending}
          updatePending={update.isPending}
        />

        <CustomFieldDialog
          open={fieldOpen}
          onOpenChange={setFieldOpen}
          form={fieldForm}
          onSubmit={onAddFieldSubmit}
          createPending={createField.isPending}
        />

        <ConfirmDeleteDialog
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
          title="Delete service?"
          description="This action cannot be undone."
          onConfirm={onDeleteConfirm}
          isLoading={remove.isPending}
        />

        <ConfirmDeleteDialog
          open={fieldDeleteOpen}
          onOpenChange={setFieldDeleteOpen}
          title="Remove custom field?"
          description="This will remove the column and all values for this field. This action cannot be undone."
          onConfirm={onDeleteFieldConfirm}
          isLoading={deleteField.isPending}
        />
      </CardContent>
    </Card>
  );
}
