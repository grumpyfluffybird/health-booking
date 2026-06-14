import api from './api';
import type { Doctor, DoctorAvailability } from '../types';

export const getDoctors = () =>
  api.get<Doctor[]>('/doctors').then((r) => r.data);

export const getDoctorAvailability = (doctorId: number) =>
  api.get<DoctorAvailability[]>(`/doctors/${doctorId}/availability`).then((r) => r.data);
