"use client";

import { useState } from "react";
import { CheckIcon, ChevronsUpDownIcon, XIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export type MultiSelectOption = {
  value: string;
  /** Used for search filtering */
  label: string;
  /** Shown in the badge when selected. Defaults to label if omitted */
  badgeLabel?: React.ReactNode;
  /** Shown in the dropdown. Defaults to label if omitted */
  render?: React.ReactNode;
};

type MultiSelectProps = {
  options: MultiSelectOption[];
  values: string[];
  onValuesChange: (values: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  searchPlaceholder?: string;
  searchEmptyMessage?: string;
};

const maxShownBadges = 2;

export function MultiSelect({
  options,
  values,
  onValuesChange,
  placeholder = "Select...",
  disabled = false,
  className,
  searchPlaceholder = "Search...",
  searchEmptyMessage = "No results found.",
}: MultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const toggleValue = (value: string) => {
    const next = values.includes(value)
      ? values.filter(v => v !== value)
      : [...values, value];
    onValuesChange(next);
  };

  const removeValue = (value: string) => {
    onValuesChange(values.filter(v => v !== value));
  };

  const visibleValues = expanded ? values : values.slice(0, maxShownBadges);
  const hiddenCount = values.length - visibleValues.length;

  const getOption = (val: string) => options.find(o => o.value === val);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "h-auto min-h-9 w-full justify-between hover:bg-transparent",
            className,
          )}
        >
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5 pr-2">
            {values.length > 0 ? (
              <>
                {visibleValues.map(val => {
                  const opt = getOption(val);
                  const badgeContent = opt?.badgeLabel ?? opt?.label ?? val;
                  return (
                    <Badge
                      key={val}
                      variant="outline"
                      className="flex items-center gap-1 rounded-sm"
                    >
                      {badgeContent}
                      <span
                        role="button"
                        tabIndex={0}
                        onClick={e => {
                          e.stopPropagation();
                          removeValue(val);
                        }}
                        onKeyDown={e => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            e.stopPropagation();
                            removeValue(val);
                          }
                        }}
                        className="ml-0.5 cursor-pointer rounded hover:bg-muted"
                        aria-label="Remove"
                      >
                        <XIcon className="size-3" />
                      </span>
                    </Badge>
                  );
                })}
                {(hiddenCount > 0 || expanded) && (
                  <Badge
                    variant="outline"
                    className="cursor-pointer rounded-sm"
                    onClick={e => {
                      e.stopPropagation();
                      setExpanded(prev => !prev);
                    }}
                  >
                    {expanded ? "Show less" : `+${hiddenCount} more`}
                  </Badge>
                )}
              </>
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
          </div>
          <ChevronsUpDownIcon
            className="text-muted-foreground/80 size-4 shrink-0"
            aria-hidden
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[var(--radix-popper-anchor-width)] p-0"
        align="start"
      >
        <Command>
          <CommandInput placeholder={searchPlaceholder} className="my-2" />
          <CommandList>
            <CommandEmpty>{searchEmptyMessage}</CommandEmpty>
            <CommandGroup>
              {options.map(opt => {
                const isSelected = values.includes(opt.value);
                return (
                  <CommandItem
                    key={opt.value}
                    value={opt.label}
                    onSelect={() => toggleValue(opt.value)}
                  >
                    <span className="flex flex-1 truncate">
                      {opt.render ?? opt.label}
                    </span>
                    {isSelected && (
                      <CheckIcon className="ml-auto size-4 shrink-0" />
                    )}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
