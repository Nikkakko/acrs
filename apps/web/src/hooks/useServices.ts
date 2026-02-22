import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../lib/queryKeys';
import {
  createService,
  createServiceCustomField,
  deleteService,
  deleteServiceCustomField,
  fetchServiceColumnOrder,
  fetchServiceCustomFields,
  fetchServices,
  ServicePayload,
  updateService,
  updateServiceColumnOrder
} from '../services/serviceApi';

export function useServicesQuery(q: string) {
  return useQuery({
    queryKey: queryKeys.services(q),
    queryFn: () => fetchServices(q)
  });
}

export function useServiceFieldsQuery() {
  return useQuery({
    queryKey: queryKeys.serviceFields(),
    queryFn: fetchServiceCustomFields
  });
}

export function useServiceColumnOrderQuery() {
  return useQuery({
    queryKey: queryKeys.serviceColumnOrder(),
    queryFn: fetchServiceColumnOrder
  });
}

export function useServiceMutations() {
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['services'] });
    queryClient.invalidateQueries({ queryKey: ['service-custom-fields'] });
    queryClient.invalidateQueries({ queryKey: ['service-column-order'] });
    queryClient.invalidateQueries({ queryKey: ['reservations'] });
  };

  const create = useMutation({
    mutationFn: (payload: ServicePayload) => createService(payload),
    onSuccess: invalidate
  });

  const update = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: ServicePayload }) => updateService(id, payload),
    onSuccess: invalidate
  });

  const remove = useMutation({
    mutationFn: (id: number) => deleteService(id),
    onSuccess: invalidate
  });

  const createField = useMutation({
    mutationFn: (name: string) => createServiceCustomField(name),
    onSuccess: invalidate
  });

  const deleteField = useMutation({
    mutationFn: (id: number) => deleteServiceCustomField(id),
    onSuccess: invalidate
  });

  const updateColumnOrder = useMutation({
    mutationFn: (columns: string[]) => updateServiceColumnOrder(columns),
    onSuccess: invalidate
  });

  return { create, update, remove, createField, deleteField, updateColumnOrder };
}
