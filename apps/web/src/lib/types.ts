export type Staff = {
  id: number;
  first_name: string;
  last_name: string;
  photo_url: string | null;
};

export type Service = {
  id: number;
  name: string;
  price: string;
  color: string;
  customFields?: Record<string, string>;
};

export type CustomField = {
  id: number;
  name: string;
};

export type Reservation = {
  id: number;
  specialist_id: number;
  reservation_date: string;
  start_time: string;
  end_time: string;
  duration_min: number;
  services: Array<{ id: number; name: string; color: string }>;
};
