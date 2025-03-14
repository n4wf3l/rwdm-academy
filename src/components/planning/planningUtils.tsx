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
  type: AppointmentType;
  personName: string;
  adminName: string;
  notes?: string;
  email?: string;
}

// Mock data for our demo
export const MOCK_APPOINTMENTS: Appointment[] = [
  {
    id: "APP-001",
    date: new Date(2023, 7, 15, 10, 0), // 15 août 2023, 10:00
    type: "registration",
    personName: "Lucas Dubois",
    adminName: "Sophie Dupont",
    notes: "Premier rendez-vous pour l'inscription",
    email: "lucas.dubois@example.com",
  },
  {
    id: "APP-002",
    date: new Date(2023, 7, 15, 14, 30), // 15 août 2023, 14:30
    type: "selection-tests",
    personName: "Emma Petit",
    adminName: "Thomas Martin",
    notes: "Préparation aux tests de la semaine prochaine",
    email: "emma.petit@example.com",
  },
  {
    id: "APP-003",
    date: new Date(2023, 7, 16, 9, 15), // 16 août 2023, 9:15
    type: "accident-report",
    personName: "Noah Lambert",
    adminName: "Elise Bernard",
    notes: "Suivi de la déclaration d'accident du 10/08",
    email: "noah.lambert@example.com",
  },
  {
    id: "APP-004",
    date: new Date(2023, 7, 17, 11, 0), // 17 août 2023, 11:00
    type: "responsibility-waiver",
    personName: "Chloé Moreau",
    adminName: "Michael Lambert",
    notes: "Signature de la décharge pour le tournoi",
    email: "chloe.moreau@example.com",
  },
  {
    id: "APP-005",
    date: new Date(2023, 7, 18, 15, 45), // 18 août 2023, 15:45
    type: "other",
    personName: "Louis Lefevre",
    adminName: "Sophie Dupont",
    notes: "Discussion sur le programme d'entraînement",
    email: "louis.lefevre@example.com",
  },
];

// Available times for appointments
export const AVAILABLE_TIMES = [
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
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
    const dateStr = format(appointment.date, "yyyy-MM-dd");
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
export const getAvailableTimeSlotsForDate = (
  appointments: Appointment[],
  date: Date
) => {
  return AVAILABLE_TIMES.filter((time) =>
    isTimeSlotAvailable(appointments, date, time)
  );
};

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
