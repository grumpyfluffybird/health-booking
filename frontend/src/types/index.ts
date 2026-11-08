export interface Doctor {
  id: number;
  name: string;
  specialty: string;
  avatarUrl?: string;
}

export interface Appointment {
  id: number;
  patientName: string;
  patientPhone: string;
  patientEmail: string;
  doctor: Doctor;
  appointmentDate: string; // ISO date string
  appointmentTime: string; // HH:mm
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
  notes?: string;
  createdAt: string;
}

export interface AppointmentRequest {
  patientName: string;
  patientPhone: string;
  patientEmail: string;
  doctorId: number;
  appointmentDate: string;
  appointmentTime: string;
  notes?: string;
}

export interface DoctorAvailability {
  id: number;
  dayOfWeek: 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';
  startTime: string;
  endTime: string;
}

export interface DoctorRequest {
  name: string;
  specialty: string;
  avatarUrl?: string;
}

export interface DoctorAvailabilityRequest {
  dayOfWeek: DoctorAvailability['dayOfWeek'];
  startTime: string;
  endTime: string;
}

/** Khung giờ khám trả về từ GET /doctors/{id}/slots */
export interface TimeSlot {
  time: string; // HH:mm
  remaining: number;
  available: boolean;
}

export interface RescheduleRequest {
  appointmentDate: string; // YYYY-MM-DD
  appointmentTime: string; // HH:mm
}

export interface AppointmentStats {
  from: string;
  to: string;
  total: number;
  byStatus: { status: Appointment['status'] | string; count: number }[];
  daily: { date: string; count: number }[];
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  username: string;
}
