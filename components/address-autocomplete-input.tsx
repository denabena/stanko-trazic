"use client";

import { MapPin } from "lucide-react";
import { useCallback, useEffect, useId, useRef, useState } from "react";

import {
  PLACES_AUTOCOMPLETE_MIN_INPUT_LENGTH,
} from "@/constants/index";
import { postPlacesAutocomplete } from "@/lib/stanko-api-client";
import type { PlacesAutocompleteSuggestion } from "@/lib/types";

type Props = {
  value: string;
  onChange: (value: string) => void;
  onPickSuggestion?: (s: PlacesAutocompleteSuggestion) => void;
  placeholder?: string;
  sessionToken?: string;
  disabled?: boolean;
  className?: string;
  inputClassName?: string;
  showMapPin?: boolean;
  id?: string;
};

export function AddressAutocompleteInput({
  value,
  onChange,
  onPickSuggestion,
  placeholder,
  sessionToken,
  disabled,
  className = "",
  inputClassName = "",
  showMapPin = true,
  id: idProp,
}: Props) {
  const genId = useId();
  const inputId = idProp ?? genId;
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<PlacesAutocompleteSuggestion[]>(
    [],
  );
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  const fetchSuggestions = useCallback(
    async (input: string) => {
      const trimmed = input.trim();
      if (trimmed.length < PLACES_AUTOCOMPLETE_MIN_INPUT_LENGTH) {
        setSuggestions([]);
        setOpen(false);
        return;
      }
      setLoading(true);
      const res = await postPlacesAutocomplete({
        input: trimmed,
        sessionToken,
      });
      setLoading(false);
      if (!res.ok) {
        setSuggestions([]);
        setOpen(false);
        return;
      }
      setSuggestions(res.data.suggestions);
      setOpen(res.data.suggestions.length > 0);
    },
    [sessionToken],
  );

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      void fetchSuggestions(value);
    }, 280);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [value, fetchSuggestions]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const baseInput =
    "w-full rounded border border-[#E5E7EB] bg-white py-2.5 text-sm text-[#0A0A0A] placeholder:text-[#D1D5DB] transition-colors focus:border-[#163D73] focus:outline-none disabled:opacity-60";

  return (
    <div ref={wrapRef} className={`relative ${className}`}>
      {showMapPin && (
        <MapPin className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#9CA3AF]" />
      )}
      <input
        id={inputId}
        type="text"
        autoComplete="off"
        disabled={disabled}
        placeholder={placeholder}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(false);
        }}
        onFocus={() => {
          if (suggestions.length > 0) setOpen(true);
        }}
        className={`${baseInput} ${showMapPin ? "pl-9 pr-3" : "px-3"} ${inputClassName}`}
        aria-autocomplete="list"
        aria-controls={open ? `${inputId}-listbox` : undefined}
      />
      {open && suggestions.length > 0 && (
        <ul
          id={`${inputId}-listbox`}
          role="listbox"
          className="absolute z-50 mt-1 max-h-56 w-full overflow-auto rounded border border-[#E5E7EB] bg-white py-1 shadow-lg"
        >
          {suggestions.map((s) => (
            <li key={s.placeId} role="presentation">
              <button
                type="button"
                role="option"
                aria-selected={false}
                className="w-full px-3 py-2.5 text-left text-sm text-[#0A0A0A] hover:bg-[#F3F4F6]"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  onChange(s.description);
                  onPickSuggestion?.(s);
                  setOpen(false);
                }}
              >
                <span className="font-medium">{s.mainText}</span>
                {s.secondaryText ? (
                  <span className="mt-0.5 block text-xs text-[#9CA3AF]">
                    {s.secondaryText}
                  </span>
                ) : null}
              </button>
            </li>
          ))}
        </ul>
      )}
      {loading && (
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-[#9CA3AF]">
          …
        </span>
      )}
    </div>
  );
}
