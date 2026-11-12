"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import type { ReactNode } from "react";

export interface ThemedSelectOption {
  value: string;
  label: string;
}

interface ThemedSelectProps {
  id?: string;
  /** When set, renders a hidden native input so the value is picked up by FormData. */
  name?: string;
  options: ThemedSelectOption[];
  /** Controlled value. Pair with onChange. */
  value?: string;
  /** Initial value for uncontrolled usage. */
  defaultValue?: string;
  onChange?: (value: string) => void;
  /** Accessible label when there is no visible label element. */
  ariaLabel?: string;
  /** Id of a visible label element. */
  ariaLabelledBy?: string;
  placeholder?: string;
  leadingIcon?: ReactNode;
  className?: string;
  buttonClassName?: string;
  listClassName?: string;
  disabled?: boolean;
}

/**
 * Themed dropdown matching the portfolio's Paper Mono aesthetic.
 * Replaces every native <select> in the app with a fully keyboard
 * navigable listbox (button, aria-activedescendant, roving highlight).
 */
export default function ThemedSelect({
  id,
  name,
  options,
  value,
  defaultValue,
  onChange,
  ariaLabel,
  ariaLabelledBy,
  placeholder = "Select…",
  leadingIcon,
  className,
  buttonClassName,
  listClassName,
  disabled,
}: ThemedSelectProps) {
  const autoId = useId();
  const baseId = id ?? autoId;
  const listId = `${baseId}-listbox`;
  const optionId = (index: number) => `${baseId}-option-${index}`;

  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState<string>(
    defaultValue ?? options[0]?.value ?? ""
  );
  const currentValue = isControlled ? value : internalValue;
  const selectedIndex = options.findIndex((o) => o.value === currentValue);
  const selectedOption = selectedIndex >= 0 ? options[selectedIndex] : undefined;

  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(selectedIndex >= 0 ? selectedIndex : 0);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const commit = useCallback(
    (index: number) => {
      const option = options[index];
      if (!option) return;
      if (!isControlled) setInternalValue(option.value);
      onChange?.(option.value);
      setOpen(false);
      buttonRef.current?.focus();
    },
    [options, isControlled, onChange]
  );

  const close = useCallback(() => setOpen(false), []);

  // Close on outside pointer press.
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        close();
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open, close]);

  // Keep the highlighted option visible while arrow-keying.
  useEffect(() => {
    if (!open || !listRef.current) return;
    const el = listRef.current.children[activeIndex] as HTMLElement | undefined;
    el?.scrollIntoView({ block: "nearest" });
  }, [open, activeIndex]);

  const openList = () => {
    if (disabled) return;
    setActiveIndex(selectedIndex >= 0 ? selectedIndex : 0);
    setOpen(true);
  };

  const onButtonKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return;
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        if (!open) {
          openList();
        } else {
          setActiveIndex((i) => Math.min(options.length - 1, i + 1));
        }
        break;
      case "ArrowUp":
        event.preventDefault();
        if (!open) {
          openList();
        } else {
          setActiveIndex((i) => Math.max(0, i - 1));
        }
        break;
      case "Home":
        if (open) {
          event.preventDefault();
          setActiveIndex(0);
        }
        break;
      case "End":
        if (open) {
          event.preventDefault();
          setActiveIndex(options.length - 1);
        }
        break;
      case "Enter":
      case " ":
        event.preventDefault();
        if (open) {
          commit(activeIndex);
        } else {
          openList();
        }
        break;
      case "Escape":
        if (open) {
          event.preventDefault();
          close();
        }
        break;
      case "Tab":
        close();
        break;
      default:
        break;
    }
  };

  return (
    <div
      ref={rootRef}
      className={`tselect${open ? " is-open" : ""}${disabled ? " is-disabled" : ""}${className ? ` ${className}` : ""}`}
    >
      {name ? <input type="hidden" name={name} value={currentValue} /> : null}
      <button
        ref={buttonRef}
        id={baseId}
        type="button"
        className={`tselect__btn${buttonClassName ? ` ${buttonClassName}` : ""}`}
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-activedescendant={open ? optionId(activeIndex) : undefined}
        aria-label={ariaLabelledBy ? undefined : ariaLabel}
        aria-labelledby={ariaLabelledBy}
        onClick={() => (open ? close() : openList())}
        onKeyDown={onButtonKeyDown}
        disabled={disabled}
      >
        {leadingIcon ? <span className="tselect__icon" aria-hidden="true">{leadingIcon}</span> : null}
        <span className="tselect__label">{selectedOption?.label ?? placeholder}</span>
        <svg
          className="tselect__chevron"
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <ul
          ref={listRef}
          id={listId}
          role="listbox"
          className={`tselect__list${listClassName ? ` ${listClassName}` : ""}`}
          aria-label={ariaLabelledBy ? undefined : ariaLabel}
          aria-labelledby={ariaLabelledBy}
        >
          {options.map((option, index) => {
            const selected = option.value === currentValue;
            const active = index === activeIndex;
            return (
              <li
                key={`${option.value}-${index}`}
                id={optionId(index)}
                role="option"
                aria-selected={selected}
                className={`tselect__option${active ? " is-active" : ""}${selected ? " is-selected" : ""}`}
                onMouseEnter={() => setActiveIndex(index)}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => commit(index)}
              >
                <span className="tselect__option-label">{option.label}</span>
                {selected ? (
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <polyline points="20 6 9 17 4 10" />
                  </svg>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
