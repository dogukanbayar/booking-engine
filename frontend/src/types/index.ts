export type AppointmentStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';

export interface Specialist {
  id: number;
  firstName: string;
  lastName: string;
  title: string;
  email: string;
}

export interface Appointment {
  id: number;
  specialistId: number;
  specialistFullName: string;
  specialistTitle: string;
  customerFullName: string;
  customerEmail: string;
  customerPhone: string;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  status: AppointmentStatus;
  notes?: string;
}

export interface CreateAppointmentPayload {
  specialistId: number;
  customerFirstName: string;
  customerLastName: string;
  customerEmail: string;
  customerPhone: string;
  appointmentDate: string;
  startTime: string;
  notes?: string;
}
