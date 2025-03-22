import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { fr } from "date-fns/locale";

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
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <DatePicker
      selected={selectedDate}
      onChange={(date: Date | null) => {
        if (date && !Array.isArray(date)) {
          // Vérifie que `date` n'est pas un tableau
          onChange(date);
          setIsOpen(false);
          onCalendarClose?.();
        }
      }}
      dateFormat="PPP"
      locale={fr}
      showYearDropdown
      scrollableYearDropdown
      yearDropdownItemNumber={100}
      maxDate={new Date()}
      placeholderText="Sélectionnez une date"
      className="form-input-base bg-gray-100 border border-gray-300 rounded px-3 py-2"
      onFocus={() => {
        setIsOpen(true);
        onCalendarOpen?.();
      }}
      onClickOutside={() => {
        setIsOpen(false);
        onCalendarClose?.();
      }}
      open={isOpen}
    />
  );
};

export default BirthDatePicker;
