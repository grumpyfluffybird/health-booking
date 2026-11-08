import api from './api';
import type { Doctor, DoctorAvailability, TimeSlot } from '../types';

export const getDoctors = () =>
  api.get<Doctor[]>('/doctors').then((r) => r.data);

export const getDoctorAvailability = (doctorId: number) =>
  api.get<DoctorAvailability[]>(`/doctors/${doctorId}/availability`).then((r) => r.data);

/** Khung giờ còn trống (đã trừ giờ đã qua và giờ hết chỗ) — do backend tính, dùng chung cho đặt lịch & đổi lịch. */
export const getDoctorSlots = (doctorId: number, date: string) =>
  api.get<TimeSlot[]>(`/doctors/${doctorId}/slots`, { params: { date } }).then((r) => r.data);
