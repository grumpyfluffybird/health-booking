import api from './api';
import type { Appointment, AppointmentRequest, AppointmentStats, RescheduleRequest } from '../types';

export const createAppointment = (data: AppointmentRequest) =>
  api.post<Appointment>('/appointments', data).then((r) => r.data);

export const getAppointments = () =>
  api.get<Appointment[]>('/admin/appointments').then((r) => r.data);

export const updateAppointmentStatus = (id: number, status: Appointment['status']) =>
  api.patch<Appointment>(`/admin/appointments/${id}/status`, { status }).then((r) => r.data);

export const rescheduleAppointment = (id: number, data: RescheduleRequest) =>
  api.patch<Appointment>(`/admin/appointments/${id}/schedule`, data).then((r) => r.data);

export const getAppointmentStats = (from: string, to: string) =>
  api.get<AppointmentStats>('/admin/appointments/stats', { params: { from, to } }).then((r) => r.data);
