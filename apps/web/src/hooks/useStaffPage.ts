import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useStaffMutations } from "@/hooks/useStaff";
import type { Staff } from "@/lib/types";
import { staffFormSchema, type StaffFormValues } from "@/lib/schemas";
import { getErrorMessage } from "@/lib/apiError";
import { formToStaffPayload, staffToFormValues } from "@/lib/staffMappers";
import { uploadStaffPhoto } from "@/services/staffApi";

export type StaffModalState =
  | { kind: "closed" }
  | { kind: "form"; editing: Staff | null }
  | { kind: "delete"; id: number };

export function useStaffPage() {
  const [modalState, setModalState] = useState<StaffModalState>({
    kind: "closed",
  });
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  const { create, update, remove } = useStaffMutations();

  const form = useForm<StaffFormValues>({
    resolver: zodResolver(staffFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      photoUrl: "",
    },
  });

  const editing = modalState.kind === "form" ? modalState.editing : null;

  const openCreate = useCallback(() => {
    setPhotoFile(null);
    form.reset({ firstName: "", lastName: "", photoUrl: "" });
    setModalState({ kind: "form", editing: null });
  }, [form]);

  const openEdit = useCallback(
    (row: Staff) => {
      setPhotoFile(null);
      form.reset(staffToFormValues(row));
      setModalState({ kind: "form", editing: row });
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
        const msg = getErrorMessage(err, "Failed to upload image");
        toast.error(msg);
        form.setError("photoUrl", { type: "manual", message: msg });
        return;
      }
    }
    const payload = formToStaffPayload({
      ...values,
      photoUrl: photoUrl ?? values.photoUrl ?? "",
    });
    try {
      if (editing) {
        await update.mutateAsync({ id: editing.id, payload });
        toast.success("Staff updated");
      } else {
        await create.mutateAsync(payload);
        toast.success("Staff added");
      }
      setPhotoFile(null);
      setModalState({ kind: "closed" });
    } catch (err) {
      const msg = getErrorMessage(err, "Failed to save");
      toast.error(msg);
      form.setError("firstName", { type: "manual", message: msg });
    }
  });

  const onDeleteClick = useCallback((id: number) => {
    setModalState({ kind: "delete", id });
  }, []);

  const onDeleteConfirm = useCallback(async () => {
    if (modalState.kind !== "delete") return;
    try {
      await remove.mutateAsync(modalState.id);
      toast.success("Staff removed");
      setModalState({ kind: "closed" });
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to delete"));
    }
  }, [modalState, remove]);

  return {
    form,
    open: modalState.kind === "form",
    setOpen: (open: boolean) => {
      if (!open) setModalState({ kind: "closed" });
    },
    deleteOpen: modalState.kind === "delete",
    setDeleteOpen: (open: boolean) => {
      if (!open) setModalState({ kind: "closed" });
    },
    editing,
    deleteId: modalState.kind === "delete" ? modalState.id : null,
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
  };
}
