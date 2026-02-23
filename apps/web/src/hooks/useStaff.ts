import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from "@/lib/queryKeys";
import {
  createStaff,
  deleteStaff,
  fetchStaff,
  type StaffPayload,
  updateStaff,
} from "@/services/staffApi";

export function useStaffQuery(q: string) {
  return useQuery({
    queryKey: queryKeys.staff(q),
    queryFn: () => fetchStaff(q)
  });
}

export function useStaffMutations() {
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.staffAll() });
    queryClient.invalidateQueries({ queryKey: queryKeys.reservationsAll() });
  };

  const create = useMutation({
    mutationFn: (payload: StaffPayload) => createStaff(payload),
    onSuccess: invalidate
  });

  const update = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: StaffPayload }) => updateStaff(id, payload),
    onSuccess: invalidate
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteStaff(id),
    onSuccess: invalidate
  });

  return { create, update, remove };
}
