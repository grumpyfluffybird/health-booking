import { useEffect, useState } from 'react';
import { getDoctorSlots } from '../../services/doctorService';
import { rescheduleAppointment } from '../../services/appointmentService';
import type { Appointment, TimeSlot } from '../../types';
import { apiErrorMessage, formatDateVN, formatTime, todayInAppTz, weekdayLabel } from '../../utils/date';

interface Props {
  appointment: Appointment;
  onClose: () => void;
  onSuccess: (updated: Appointment) => void;
}

/** Hộp thoại nhân viên đổi ngày/giờ khám. Bác sĩ, khách và trạng thái được giữ nguyên. */
export default function RescheduleDialog({ appointment, onClose, onSuccess }: Props) {
  const currentDate = appointment.appointmentDate;
  const currentTime = formatTime(appointment.appointmentTime);
  const today = todayInAppTz();

  const [date, setDate] = useState(currentDate >= today ? currentDate : today);
  const [time, setTime] = useState('');
  const [reload, setReload] = useState(0);
  const [slotResult, setSlotResult] = useState<{ key: string; slots: TimeSlot[]; error: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Tải giờ trống theo (ngày, lần tải); trạng thái loading được suy ra từ key của kết quả gần nhất.
  const slotKey = `${date}#${reload}`;
  useEffect(() => {
    if (!date) return;
    let cancelled = false;
    getDoctorSlots(appointment.doctor.id, date)
      .then((slots) => { if (!cancelled) setSlotResult({ key: slotKey, slots, error: '' }); })
      .catch((e) => {
        if (!cancelled) setSlotResult({ key: slotKey, slots: [], error: apiErrorMessage(e, 'Không tải được khung giờ.') });
      });
    return () => { cancelled = true; };
  }, [appointment.doctor.id, date, slotKey]);

  const loadingSlots = !!date && slotResult?.key !== slotKey;
  const slots = slotResult?.key === slotKey ? slotResult.slots : [];
  const slotsError = slotResult?.key === slotKey ? slotResult.error : '';

  // Đóng bằng phím Esc (trừ khi đang gửi)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && !submitting) onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, submitting]);

  const isSame = date === currentDate && time === currentTime;
  const canSubmit = !!date && !!time && !isSame && !submitting;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    setError('');
    try {
      const updated = await rescheduleAppointment(appointment.id, { appointmentDate: date, appointmentTime: time });
      onSuccess(updated);
    } catch (e) {
      // Giữ nguyên hộp thoại và lựa chọn; tải lại giờ trống để thấy khung vừa bị người khác đặt.
      setError(apiErrorMessage(e, 'Đổi lịch thất bại. Vui lòng thử lại.'));
      setReload((n) => n + 1);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/40 flex items-center justify-center p-4"
      onClick={() => !submitting && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="reschedule-title"
        className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 id="reschedule-title" className="font-semibold text-slate-900">
            Đổi lịch hẹn <span className="text-slate-400 font-normal">#{appointment.id}</span>
          </h2>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="text-slate-400 hover:text-slate-600 text-xl leading-none cursor-pointer disabled:opacity-40"
            aria-label="Đóng"
          >
            ×
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Thông tin hiện tại */}
          <div className="grid grid-cols-2 gap-4 bg-slate-50 border border-slate-200 rounded-xl p-4">
            <Info label="Bệnh nhân" value={appointment.patientName} />
            <Info label="Bác sĩ" value={`${appointment.doctor.name} · ${appointment.doctor.specialty}`} />
            <Info label="Ngày hiện tại" value={`${weekdayLabel(currentDate)}, ${formatDateVN(currentDate)}`} />
            <Info label="Giờ hiện tại" value={currentTime} />
          </div>

          {/* Chọn ngày mới */}
          <div>
            <label htmlFor="reschedule-date" className="block text-xs font-semibold text-slate-600 mb-1">Ngày khám mới</label>
            <input
              id="reschedule-date"
              type="date"
              min={today}
              value={date}
              onChange={(e) => { setDate(e.target.value); setTime(''); setError(''); }}
              className="w-full bg-white border border-slate-200 focus:border-teal-500 text-slate-900 text-sm rounded-xl p-2.5 outline-none transition-colors"
            />
          </div>

          {/* Khung giờ */}
          <div>
            <p className="text-xs font-semibold text-slate-600 mb-2">Khung giờ còn trống</p>
            {!date ? (
              <p className="text-xs text-slate-400 italic">Chọn ngày để xem khung giờ.</p>
            ) : loadingSlots ? (
              <div className="grid grid-cols-4 gap-2">
                {Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-9 bg-slate-100 rounded-lg animate-pulse" />)}
              </div>
            ) : slotsError ? (
              <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">{slotsError}</p>
            ) : slots.length === 0 ? (
              <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                Bác sĩ không làm việc hoặc đã hết giờ khám trong ngày này. Vui lòng chọn ngày khác.
              </p>
            ) : (
              <div className="grid grid-cols-4 gap-2">
                {slots.map((s) => {
                  const isCurrent = date === currentDate && s.time === currentTime;
                  const disabled = isCurrent || !s.available;
                  const selected = time === s.time;
                  return (
                    <button
                      key={s.time}
                      type="button"
                      disabled={disabled}
                      onClick={() => { setTime(s.time); setError(''); }}
                      title={isCurrent ? 'Giờ hiện tại của lịch hẹn' : !s.available ? 'Đã hết chỗ' : `Còn ${s.remaining} chỗ`}
                      className={`py-2 text-xs font-semibold border rounded-lg transition-all ${
                        selected
                          ? 'bg-teal-600 border-teal-600 text-white shadow-sm cursor-pointer'
                          : isCurrent
                            ? 'bg-teal-50 border-teal-200 text-teal-700 cursor-not-allowed'
                            : disabled
                              ? 'bg-slate-50 border-slate-100 text-slate-300 line-through cursor-not-allowed'
                              : 'bg-white border-slate-200 text-slate-600 hover:border-teal-400 hover:text-teal-600 cursor-pointer'
                      }`}
                    >
                      {s.time}
                      {isCurrent && <span className="block text-[10px] font-medium">Hiện tại</span>}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* So sánh cũ / mới */}
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
            <div className="rounded-xl border border-slate-200 px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Lịch cũ</p>
              <p className="text-sm font-semibold text-slate-500 line-through decoration-slate-300">
                {currentTime} · {formatDateVN(currentDate)}
              </p>
            </div>
            <span className="text-slate-300" aria-hidden>→</span>
            <div className={`rounded-xl border px-4 py-3 ${time ? 'border-teal-300 bg-teal-50' : 'border-dashed border-slate-200'}`}>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Lịch mới</p>
              <p className={`text-sm font-semibold ${time ? 'text-teal-800' : 'text-slate-300'}`}>
                {time ? `${time} · ${formatDateVN(date)}` : 'Chưa chọn'}
              </p>
            </div>
          </div>

          {error && (
            <div role="alert" className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
              {error}
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 text-sm font-semibold px-4 py-2 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="bg-teal-600 hover:bg-teal-700 disabled:bg-teal-300 disabled:cursor-not-allowed text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors cursor-pointer"
          >
            {submitting ? 'Đang đổi lịch…' : 'Xác nhận đổi lịch'}
          </button>
        </div>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider mb-0.5">{label}</p>
      <p className="text-sm font-medium text-slate-800 truncate" title={value}>{value}</p>
    </div>
  );
}
