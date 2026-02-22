import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from "@/lib/queryKeys";
import {
  createService,
  createServiceCustomField,
  deleteService,
  deleteServiceCustomField,
  fetchServiceColumnOrder,
  fetchServiceCustomFields,
  fetchServices,
  type ServicePayload,
  updateService,
  updateServiceColumnOrder,
} from "@/services/serviceApi";

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

  const invalidateServicesAndFields = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.servicesAll() });
    queryClient.invalidateQueries({ queryKey: queryKeys.serviceFields() });
    queryClient.invalidateQueries({ queryKey: queryKeys.serviceColumnOrder() });
    queryClient.invalidateQueries({ queryKey: queryKeys.reservationsAll() });
  };

  const invalidateColumnOrderOnly = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.serviceColumnOrder() });
  };

  const create = useMutation({
    mutationFn: (payload: ServicePayload) => createService(payload),
    onSuccess: invalidateServicesAndFields,
  });

  const update = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: ServicePayload }) =>
      updateService(id, payload),
    onSuccess: invalidateServicesAndFields,
  });

  const remove = useMutation({
    mutationFn: (id: number) => deleteService(id),
    onSuccess: invalidateServicesAndFields,
  });

  const createField = useMutation({
    mutationFn: (name: string) => createServiceCustomField(name),
    onSuccess: invalidateServicesAndFields,
  });

  const deleteField = useMutation({
    mutationFn: (id: number) => deleteServiceCustomField(id),
    onSuccess: invalidateServicesAndFields,
  });

  const updateColumnOrder = useMutation({
    mutationFn: (columns: string[]) => updateServiceColumnOrder(columns),
    onSuccess: invalidateColumnOrderOnly,
  });

  return { create, update, remove, createField, deleteField, updateColumnOrder };
}
