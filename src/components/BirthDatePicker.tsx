import React from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { fr } from "date-fns/locale";

export interface BirthDatePickerProps {
  selectedDate: Date | null;
  onChange: (date: Date | null) => void;
}

const BirthDatePicker: React.FC<BirthDatePickerProps> = ({
  selectedDate,
  onChange,
}) => {
  return (
    <DatePicker
      selected={selectedDate}
      onChange={onChange}
      dateFormat="PPP"
      locale={fr}
      showYearDropdown
      scrollableYearDropdown
      yearDropdownItemNumber={100}
      maxDate={new Date()}
      placeholderText="Sélectionnez une date"
      className="form-input-base bg-gray-100 border border-gray-300 rounded px-3 py-2"
    />
  );
};

export default BirthDatePicker;
