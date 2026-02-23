export type Staff = {
  id: string;
  first_name: string;
  last_name: string;
  photo_url: string | null;
};

export type Service = {
  id: string;
  name: string;
  price: string;
  color: string;
  customFields?: Record<string, string>;
};

export type CustomField = {
  id: string;
  name: string;
};

export type Reservation = {
  id: string;
  specialist_id: string;
  reservation_date: string;
  start_time: string;
  end_time: string;
  duration_min: number;
  services:Array<Pick<Service, "id" | "name" | "color">>
};
