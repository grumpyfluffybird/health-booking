import api from './api';
import type { Appointment, AppointmentRequest } from '../types';

export const createAppointment = (data: AppointmentRequest) =>
  api.post<Appointment>('/appointments', data).then((r) => r.data);

export const getAppointments = () =>
  api.get<Appointment[]>('/admin/appointments').then((r) => r.data);

export const updateAppointmentStatus = (id: number, status: Appointment['status']) =>
  api.patch<Appointment>(`/admin/appointments/${id}/status`, { status }).then((r) => r.data);
