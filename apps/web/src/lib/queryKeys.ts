export const queryKeys = {
  staff: (q: string) => ["staff", q] as const,
  staffAll: () => ["staff"] as const,
  services: (q: string) => ["services", q] as const,
  servicesAll: () => ["services"] as const,
  serviceFields: () => ["service-custom-fields"] as const,
  serviceColumnOrder: () => ["service-column-order"] as const,
  reservations: (date: string) => ["reservations", date] as const,
  reservationsAll: () => ["reservations"] as const,
};
