import api from './api';
import type { Doctor, DoctorRequest, DoctorAvailability, DoctorAvailabilityRequest } from '../types';

export const adminCreateDoctor = (data: DoctorRequest) =>
  api.post<Doctor>('/admin/doctors', data).then(r => r.data);

export const adminUpdateDoctor = (id: number, data: DoctorRequest) =>
  api.put<Doctor>(`/admin/doctors/${id}`, data).then(r => r.data);

export const adminDeleteDoctor = (id: number) =>
  api.delete(`/admin/doctors/${id}`);

export const getDoctorAvailability = (doctorId: number) =>
  api.get<DoctorAvailability[]>(`/admin/doctors/${doctorId}/availability`).then(r => r.data);

export const addDoctorAvailability = (doctorId: number, data: DoctorAvailabilityRequest) =>
  api.post<DoctorAvailability>(`/admin/doctors/${doctorId}/availability`, data).then(r => r.data);

export const deleteDoctorAvailability = (doctorId: number, availId: number) =>
  api.delete(`/admin/doctors/${doctorId}/availability/${availId}`);
