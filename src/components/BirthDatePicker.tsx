import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { fr } from "date-fns/locale";
import { useTranslation } from "@/hooks/useTranslation";

export interface BirthDatePickerProps {
  selectedDate: Date | null;
  onChange: (date: Date | null) => void;
  onCalendarOpen?: () => void;
  onCalendarClose?: () => void;
  required?: boolean;
}

const BirthDatePicker: React.FC<BirthDatePickerProps> = ({
  selectedDate,
  onChange,
  onCalendarOpen,
  onCalendarClose,
  required = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobilePicker, setIsMobilePicker] = useState(false);
  const { t } = useTranslation();

  // Ouvre 5 ans en arrière par défaut
  const fiveYearsAgo = new Date();
  fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - 5);

  // Détection "mobile tactile"
  useEffect(() => {
    if (typeof window !== "undefined") {
      const mql = window.matchMedia("(pointer: coarse)");
      setIsMobilePicker(mql.matches);
      const listener = (e: MediaQueryListEvent) => setIsMobilePicker(e.matches);
      mql.addEventListener("change", listener);
      return () => mql.removeEventListener("change", listener);
    }
  }, []);

  // Sur mobile, on rend l'input natif pour avoir la wheel picker
  if (isMobilePicker) {
    return (
      <input
        type="date"
        required={required}
        className="form-input-base w-full text-sm"
        value={selectedDate ? selectedDate.toISOString().slice(0, 10) : ""}
        onChange={(e) => {
          const v = e.currentTarget.value;
          onChange(v ? new Date(v) : null);
        }}
        onFocus={onCalendarOpen}
        onBlur={onCalendarClose}
        placeholder={t("select_date_placeholder")}
      />
    );
  }

  // Sur desktop, on garde react-datepicker mais avec onSelect
  return (
    <DatePicker
      selected={selectedDate}
      onSelect={(date: Date) => {
        onChange(date);
        setIsOpen(false);
        onCalendarClose?.();
      }}
      openToDate={fiveYearsAgo}
      maxDate={new Date()}
      dateFormat="PPP"
      locale={fr}
      showYearDropdown
      scrollableYearDropdown
      yearDropdownItemNumber={100}
      placeholderText={t("select_date_placeholder")}
      className="form-input-base bg-gray-50 w-full text-sm placeholder-black cursor-pointer"
      popperClassName="z-[9999]"
      onFocus={() => {
        setIsOpen(true);
        onCalendarOpen?.();
      }}
      onClickOutside={() => {
        setIsOpen(false);
        onCalendarClose?.();
      }}
      open={isOpen}
      required={required}
    />
  );
};

export default BirthDatePicker;
