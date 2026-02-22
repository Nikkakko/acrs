import { Package } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/EmptyState";
import { ServicesTableSkeleton } from "@/components/services/ServicesTableSkeleton";
import { ServicesHeader } from "@/components/services/ServicesHeader";
import { ServicesTable } from "@/components/services/ServicesTable";
import { ServiceFormDialog } from "@/components/services/ServiceFormDialog";
import { CustomFieldDialog } from "@/components/services/CustomFieldDialog";
import { ConfirmDeleteDialog } from "@/components/shared/ConfirmDeleteDialog";
import { useServicesQuery } from "@/hooks/useServices";
import { useServicesPage } from "@/hooks/useServicesPage";
import { useDebouncedSearch } from "@/hooks/useDebouncedSearch";

export function ServicesPage() {
  const { inputValue, setInputValue, debouncedQ } = useDebouncedSearch();
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
