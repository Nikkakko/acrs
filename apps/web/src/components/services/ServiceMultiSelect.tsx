import {
  MultiSelect,
  type MultiSelectOption,
} from "@/components/ui/multi-select";
import { formatPrice } from "@/lib/formatPrice";

type CustomFieldDef = { id: number; name: string };

type Service = {
  id: number;
  name: string;
  price?: string;
  color?: string;
  customFields?: Record<string, string>;
};

type ServiceMultiSelectProps = {
  services: Service[];
  value: number[];
  onChange: (ids: number[]) => void;
  orderedFields?: CustomFieldDef[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
};

function formatCustomFields(
  customFields: Record<string, string> | undefined,
  orderedFields: CustomFieldDef[],
): string {
  if (!customFields || Object.keys(customFields).length === 0) return "";
  const parts: string[] = [];
  for (const f of orderedFields) {
    const val = customFields[String(f.id)];
    if (val?.trim()) parts.push(`${f.name}: ${val}`);
  }
  return parts.length > 0 ? ` | ${parts.join(", ")}` : "";
}

export function ServiceMultiSelect({
  services,
  value,
  onChange,
  orderedFields = [],
  placeholder = "Select services...",
  disabled = false,
  className,
}: ServiceMultiSelectProps) {
  const options: MultiSelectOption[] = services.map(service => {
    const priceStr = formatPrice(service.price);
    const customStr = formatCustomFields(service.customFields, orderedFields);
    const label = `${service.name}${priceStr ? ` — ${priceStr}` : ""}${customStr}`;
    const badgeLabel = priceStr
      ? `${service.name} — ${priceStr}`
      : service.name;
    const render = (
      <div className="flex items-center gap-2">
        {service.color && (
          <span
            className="size-3 shrink-0 rounded-full border border-border"
            style={{ background: service.color }}
            aria-hidden
          />
        )}
        <span>
          {service.name}
          {priceStr && ` — ${priceStr}`}
          {customStr}
        </span>
      </div>
    );
    return {
      value: String(service.id),
      label,
      badgeLabel: service.color ? (
        <>
          <span
            className="size-2.5 shrink-0 rounded-full border border-border"
            style={{ background: service.color }}
            aria-hidden
          />
          {badgeLabel}
        </>
      ) : (
        badgeLabel
      ),
      render,
    };
  });

  const stringValues = value.map(String);

  return (
    <MultiSelect
      options={options}
      values={stringValues}
      onValuesChange={vals => onChange(vals.map(Number))}
      placeholder={placeholder}
      disabled={disabled}
      className={"w-full"}
      searchPlaceholder="Search services..."
      searchEmptyMessage="No service found."
    />
  );
}
