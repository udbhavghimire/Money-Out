"use client";

import * as React from "react";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Command, CommandGroup, CommandItem } from "@/components/ui/command";
import { Command as CommandPrimitive } from "cmdk";

export function MultiSelect({
  options,
  value = [],
  onChange,
  placeholder = "Select items...",
  className,
}) {
  const inputRef = React.useRef(null);
  const [open, setOpen] = React.useState(false);
  const [selected, setSelected] = React.useState(value);
  const [inputValue, setInputValue] = React.useState("");

  const handleSelect = React.useCallback(
    (option) => {
      const isSelected = selected.some((item) => item.value === option.value);
      let updatedSelected;

      if (isSelected) {
        updatedSelected = selected.filter(
          (item) => item.value !== option.value
        );
      } else {
        updatedSelected = [...selected, option];
      }

      setSelected(updatedSelected);
      onChange?.(updatedSelected);
      setInputValue("");
    },
    [selected, onChange]
  );

  const handleRemove = React.useCallback(
    (option) => {
      const filtered = selected.filter((item) => item.value !== option.value);
      setSelected(filtered);
      onChange?.(filtered);
    },
    [selected, onChange]
  );

  React.useEffect(() => {
    setSelected(value);
  }, [value]);

  return (
    <div className="relative">
      <div className="relative flex min-h-[44px] w-full items-center justify-end gap-1 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background">
        <div className="flex flex-wrap gap-1">
          {selected.map((option) => (
            <Badge
              key={option.value}
              variant="secondary"
              className="hover:bg-secondary"
            >
              {option.label}
              <button
                className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleRemove(option);
                  }
                }}
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onClick={() => handleRemove(option)}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          <CommandPrimitive>
            <input
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
              placeholder={selected.length === 0 ? placeholder : ""}
            />
          </CommandPrimitive>
        </div>
      </div>
      <div className="relative mt-2">
        {open && (
          <Command className="absolute top-0 z-10 w-full rounded-md border bg-popover text-popover-foreground shadow-md outline-none animate-in">
            <CommandGroup className="h-full overflow-auto">
              {options.map((option) => {
                const isSelected = selected.some(
                  (item) => item.value === option.value
                );
                return (
                  <CommandItem
                    key={option.value}
                    onSelect={() => handleSelect(option)}
                    className={`flex cursor-pointer items-center gap-2 ${
                      isSelected ? "bg-secondary" : ""
                    }`}
                  >
                    {option.label}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </Command>
        )}
      </div>
    </div>
  );
}
