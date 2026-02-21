import {
  MultiSelect,
  MultiSelectContent,
  MultiSelectGroup,
  MultiSelectItem,
  MultiSelectTrigger,
  MultiSelectValue,
} from "@/components/ui/multi-select";

type Service = { id: number; name: string; price?: string; color?: string };

type ServiceMultiSelectProps = {
  services: Service[];
  value: number[];
  onChange: (ids: number[]) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
};

export function ServiceMultiSelect({
  services,
  value,
  onChange,
  placeholder = "Select services...",
  disabled = false,
  className,
}: ServiceMultiSelectProps) {
  const stringValues = value.map(String);
  const handleValuesChange = (values: string[]) => {
    onChange(values.map(Number));
  };

  return (
    <MultiSelect values={stringValues} onValuesChange={handleValuesChange}>
      <MultiSelectTrigger disabled={disabled} className={className}>
        <MultiSelectValue placeholder={placeholder} />
      </MultiSelectTrigger>
      <MultiSelectContent
        search={{
          placeholder: "Search services...",
          emptyMessage: "No service found.",
        }}
        className="p-2"
      >
        <MultiSelectGroup>
          {services.map(service => (
            <MultiSelectItem key={service.id} value={String(service.id)}>
              {service.name}
            </MultiSelectItem>
          ))}
        </MultiSelectGroup>
      </MultiSelectContent>
    </MultiSelect>
  );
}
