import { useMemo, useCallback, useState } from "react";
import type { Resolver } from "react-hook-form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import type { DragEndEvent } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import {
  useServiceColumnOrderQuery,
  useServiceFieldsQuery,
  useServiceMutations,
} from "@/hooks/useServices";
import type { CustomField, Service } from "@/lib/types";
import {
  serviceFormSchema,
  customFieldSchema,
  type ServiceFormValues,
} from "@/lib/schemas";
import { getErrorMessage } from "@/lib/apiError";
import {
  formToServicePayload,
  serviceToFormValues,
} from "@/lib/serviceMappers";
import { DEFAULT_SERVICE_COLOR } from "@/lib/constants";
import { z } from "zod";

export type ServicesModalState =
  | { kind: "closed" }
  | { kind: "service-form"; editing: Service | null }
  | { kind: "custom-field-form" }
  | { kind: "delete-service"; id: string }
  | { kind: "delete-field"; id: string };

export function useServicesPage() {
  const [modalState, setModalState] = useState<ServicesModalState>({
    kind: "closed",
  });

  const { data: fields = [] } = useServiceFieldsQuery();
  const { data: orderRows = [] } = useServiceColumnOrderQuery();
  const {
    create,
    update,
    remove,
    createField,
    deleteField,
    updateColumnOrder,
  } = useServiceMutations();

  const orderedFields = useMemo<CustomField[]>(() => {
    const customIdsInOrder = orderRows
      .map(row => row.columnKey)
      .filter(key => key.startsWith("custom_"))
      .map(key => key.replace("custom_", ""))
      .filter(id => fields.some(f => f.id === String(id)));

    const missing = fields
      .map(f => f.id)
      .filter(id => !customIdsInOrder.includes(id));
    const fullOrder = [...customIdsInOrder, ...missing];

    const map = new Map(fields.map(f => [f.id, f]));
    return fullOrder
      .map(id => map.get(id))
      .filter((f): f is CustomField => Boolean(f));
  }, [fields, orderRows]);

  const form = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceFormSchema) as Resolver<ServiceFormValues>,
    defaultValues: {
      name: "",
      price: 0,
      color: DEFAULT_SERVICE_COLOR,
      customFieldValues: {},
    },
  });

  const fieldForm = useForm<z.infer<typeof customFieldSchema>>({
    resolver: zodResolver(customFieldSchema),
    defaultValues: { name: "" },
  });

  const openCreate = useCallback(() => {
    form.reset({
      name: "",
      price: 0,
      color: DEFAULT_SERVICE_COLOR,
      customFieldValues: Object.fromEntries(
        orderedFields.map(f => [String(f.id), ""]),
      ),
    });
    setModalState({ kind: "service-form", editing: null });
  }, [form, orderedFields]);

  const openEdit = useCallback(
    (row: Service) => {
      form.reset(serviceToFormValues(row));
      setModalState({ kind: "service-form", editing: row });
    },
    [form],
  );

  const editing =
    modalState.kind === "service-form" ? modalState.editing : null;

  const onSubmit = form.handleSubmit(async values => {
    const payload = formToServicePayload(values);
    try {
      if (editing) {
        await update.mutateAsync({ id: editing.id, payload });
        toast.success("Service updated");
      } else {
        await create.mutateAsync(payload);
        toast.success("Service added");
      }
      setModalState({ kind: "closed" });
    } catch (err) {
      const msg = getErrorMessage(err, "Failed to save");
      toast.error(msg);
      form.setError("name", { type: "manual", message: msg });
    }
  });

  const onAddFieldClick = useCallback(() => {
    fieldForm.reset({ name: "" });
    setModalState({ kind: "custom-field-form" });
  }, [fieldForm]);

  const onAddFieldSubmit = fieldForm.handleSubmit(async values => {
    try {
      await createField.mutateAsync(values.name);
      toast.success("Custom field added");
      setModalState({ kind: "closed" });
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to add field"));
    }
  });

  const onDeleteClick = useCallback((id: string) => {
    setModalState({ kind: "delete-service", id });
  }, []);

  const onDeleteConfirm = useCallback(async () => {
    if (modalState.kind !== "delete-service") return;
    try {
      await remove.mutateAsync(modalState.id);
      toast.success("Service removed");
      setModalState({ kind: "closed" });
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to delete"));
    }
  }, [modalState, remove]);

  const onDeleteFieldClick = useCallback(
    (fieldId: string) => (e: React.MouseEvent) => {
      e.stopPropagation();
      setModalState({ kind: "delete-field", id: fieldId });
    },
    [],
  );

  const onDeleteFieldConfirm = useCallback(async () => {
    if (modalState.kind !== "delete-field") return;
    try {
      await deleteField.mutateAsync(modalState.id);
      toast.success("Custom field removed");
      setModalState({ kind: "closed" });
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to remove field"));
    }
  }, [modalState, deleteField]);

  const columnIds = useMemo(
    () => orderedFields.map(f => `column-${f.id}`),
    [orderedFields],
  );

  const handleColumnDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const oldIndex = columnIds.indexOf(active.id as string);
      const newIndex = columnIds.indexOf(over.id as string);
      if (oldIndex < 0 || newIndex < 0) return;

      const newOrder = arrayMove(orderedFields, oldIndex, newIndex);
      updateColumnOrder.mutate(
        newOrder.map(f => `custom_${f.id}`),
        {
          onError: err =>
            toast.error(getErrorMessage(err, "Failed to reorder columns")),
        },
      );
    },
    [columnIds, orderedFields, updateColumnOrder],
  );

  return {
    form,
    fieldForm,
    open: modalState.kind === "service-form",
    setOpen: (open: boolean) => {
      if (!open) setModalState({ kind: "closed" });
    },
    fieldOpen: modalState.kind === "custom-field-form",
    setFieldOpen: (open: boolean) => {
      if (!open) setModalState({ kind: "closed" });
    },
    deleteOpen: modalState.kind === "delete-service",
    setDeleteOpen: (open: boolean) => {
      if (!open) setModalState({ kind: "closed" });
    },
    fieldDeleteOpen: modalState.kind === "delete-field",
    setFieldDeleteOpen: (open: boolean) => {
      if (!open) setModalState({ kind: "closed" });
    },
    editing,
    deleteId: modalState.kind === "delete-service" ? modalState.id : null,
    fieldDeleteId: modalState.kind === "delete-field" ? modalState.id : null,
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
    updateColumnOrder,
  };
}
