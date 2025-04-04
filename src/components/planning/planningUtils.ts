import { format, isSameDay } from "date-fns";

// Types for our planning
export type AppointmentType =
  | "registration"
  | "selection-tests"
  | "accident-report"
  | "responsibility-waiver"
  | "other";

export interface Appointment {
  id: string;
  date: Date;
  time: string;
  type: AppointmentType;
  personName: string;
  email?: string;
  adminName: string;
  adminFirstName?: string;
  adminLastName?: string;
  notes?: string;
}

// Mock data for our demo

// Available times for appointments
export const AVAILABLE_TIMES = [
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "12:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
  "17:30",
  "18:00",
  "18:30",
  "19:00",
  "19:30",
  "20:00",
];

// Available admins
export const AVAILABLE_ADMINS = [
  { id: "1", name: "Sophie Dupont" },
  { id: "2", name: "Thomas Martin" },
  { id: "3", name: "Elise Bernard" },
  { id: "4", name: "Michael Lambert" },
];

// Start and end hours for the planning
export const START_HOUR = 9;
export const END_HOUR = 18;

// Translate appointment type
export const translateAppointmentType = (type: AppointmentType): string => {
  switch (type) {
    case "registration":
      return "Inscription à l'académie";
    case "selection-tests":
      return "Tests de sélection";
    case "accident-report":
      return "Déclaration d'accident";
    case "responsibility-waiver":
      return "Décharge de responsabilité";
    case "other":
      return "Autre";
    default:
      return type;
  }
};

// Badge color based on appointment type
export const getAppointmentBadge = (type: AppointmentType) => {
  switch (type) {
    case "registration":
      return "bg-green-500";
    case "selection-tests":
      return "bg-blue-500";
    case "accident-report":
      return "bg-red-500";
    case "responsibility-waiver":
      return "bg-purple-500";
    case "other":
      return "bg-gray-500";
    default:
      return "bg-gray-500";
  }
};

// Group appointments by day
export const groupAppointmentsByDay = (appointments: Appointment[]) => {
  const grouped: Record<string, Appointment[]> = {};

  appointments.forEach((appointment) => {
    if (
      !(appointment.date instanceof Date) ||
      isNaN(appointment.date.getTime())
    ) {
      console.error("⛔ Mauvaise date dans le rendez-vous :", appointment);
      return; // ignore cette entrée corrompue
    }

    const dateStr = format(appointment.date, "yyyy-MM-dd"); // ✅ Ne plantera plus
    if (!grouped[dateStr]) {
      grouped[dateStr] = [];
    }
    grouped[dateStr].push(appointment);
  });

  return grouped;
};

// Sort appointments by time
export const sortAppointmentsByTime = (appointments: Appointment[]) => {
  return [...appointments].sort((a, b) => a.date.getTime() - b.date.getTime());
};

// Generate a new appointment ID
export const generateAppointmentId = (appointments: Appointment[]) => {
  const lastId =
    appointments.length > 0
      ? parseInt(appointments[appointments.length - 1].id.split("-")[1])
      : 0;
  const newIdNumber = (lastId + 1).toString().padStart(3, "0");
  return `APP-${newIdNumber}`;
};

// Check if a time slot is available
export const isTimeSlotAvailable = (
  appointments: Appointment[],
  date: Date,
  time: string
) => {
  const [hours, minutes] = time.split(":").map(Number);
  const timeSlotDate = new Date(date);
  timeSlotDate.setHours(hours, minutes, 0, 0);

  return !appointments.some((appointment) => {
    const appointmentTime = appointment.date.getTime();
    const slotTime = timeSlotDate.getTime();
    return appointmentTime === slotTime;
  });
};

// Get available time slots for a date
export function getAvailableTimeSlotsForDate(
  appointments: Appointment[],
  date: Date
): string[] {
  const validAppointments = appointments.filter(
    (a) => a.date instanceof Date && !isNaN(a.date.getTime())
  );

  const taken = validAppointments
    .filter(
      (a) =>
        a.date.getFullYear() === date.getFullYear() &&
        a.date.getMonth() === date.getMonth() &&
        a.date.getDate() === date.getDate()
    )
    .map((a) => a.time); // Assurez-vous que vous utilisez a.time ici

  return AVAILABLE_TIMES.filter((time) => !taken.includes(time));
}

// Format hour (9 -> 09:00)
export const formatHour = (hour: number) => {
  return `${hour.toString().padStart(2, "0")}:00`;
};

// Get time from date
export const getTimeFromDate = (date: Date) => {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  return {
    hours,
    minutes,
    formattedTime: `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}`,
  };
};

// Check if an appointment is in a specific hour
export const isAppointmentInHour = (
  appointment: Appointment,
  date: Date,
  hour: number
) => {
  return (
    appointment.date.getHours() === hour && isSameDay(appointment.date, date)
  );
};

// Get all appointments for a specific hour and date
export const getAppointmentsForHourAndDate = (
  appointments: Appointment[],
  date: Date,
  hour: number
) => {
  return appointments.filter((appointment) =>
    isAppointmentInHour(appointment, date, hour)
  );
};
