import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../lib/queryKeys';
import { createStaff, deleteStaff, fetchStaff, StaffPayload, updateStaff } from '../services/staffApi';

export function useStaffQuery(q: string) {
  return useQuery({
    queryKey: queryKeys.staff(q),
    queryFn: () => fetchStaff(q)
  });
}

export function useStaffMutations(q: string) {
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['staff'] });
    queryClient.invalidateQueries({ queryKey: ['reservations'] });
  };

  const create = useMutation({
    mutationFn: (payload: StaffPayload) => createStaff(payload),
    onSuccess: invalidate
  });

  const update = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: StaffPayload }) => updateStaff(id, payload),
    onSuccess: invalidate
  });

  const remove = useMutation({
    mutationFn: (id: number) => deleteStaff(id),
    onSuccess: invalidate
  });

  return { create, update, remove, q };
}
