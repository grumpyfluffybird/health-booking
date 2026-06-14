import { useEffect, useMemo, useState } from 'react';
import { getDoctors, getDoctorAvailability } from '../../services/doctorService';
import { createAppointment } from '../../services/appointmentService';
import type { Doctor, DoctorAvailability, Appointment } from '../../types';

const DAYS_OF_WEEK = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'] as const;

function slotsFromWindows(windows: DoctorAvailability[]): string[] {
  const slots: string[] = [];
  for (const w of windows) {
    const [sh, sm] = w.startTime.substring(0, 5).split(':').map(Number);
    const [eh, em] = w.endTime.substring(0, 5).split(':').map(Number);
    let mins = sh * 60 + sm;
    const end = eh * 60 + em;
    while (mins < end) {
      slots.push(
        `${String(Math.floor(mins / 60)).padStart(2, '0')}:${String(mins % 60).padStart(2, '0')}`,
      );
      mins += 30;
    }
  }
  return slots;
}

const WHY_ITEMS = [
  { icon: '🩺', text: 'Bác sĩ được chứng nhận trong tất cả các chuyên khoa' },
  { icon: '⚡', text: 'Có lịch trong ngày và ngày hôm sau' },
  { icon: '🔒', text: 'Dữ liệu của bạn được mã hóa hoàn toàn và bảo mật' },
  { icon: '✅', text: 'Xác nhận ngay lập tức — không cần chờ đợi' },
];

function getInitials(name: string) {
  const parts = name.replace('Dr. ', '').split(' ');
  return (parts[0][0] + (parts[parts.length - 1][0] ?? '')).toUpperCase();
}


export default function BookingSection() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [availability, setAvailability] = useState<DoctorAvailability[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState<Appointment | null>(null);

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    getDoctors().then(setDoctors).finally(() => setLoadingDoctors(false));
  }, []);

  useEffect(() => {
    if (!selectedDoctor) { setAvailability([]); return; }
    setLoadingSlots(true);
    setSelectedTime('');
    getDoctorAvailability(selectedDoctor.id)
      .then(setAvailability)
      .finally(() => setLoadingSlots(false));
  }, [selectedDoctor]);

  // Reset time when date changes
  useEffect(() => { setSelectedTime(''); }, [selectedDate]);

  const timeSlots = useMemo(() => {
    if (!selectedDate || availability.length === 0) return [];
    const dow = DAYS_OF_WEEK[new Date(selectedDate + 'T00:00:00').getDay()];
    const windows = availability.filter(w => w.dayOfWeek === dow);
    return slotsFromWindows(windows);
  }, [selectedDate, availability]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!selectedDoctor) e.doctor = 'Vui lòng chọn bác sĩ.';
    if (!selectedDate)   e.date   = 'Vui lòng chọn ngày khám.';
    if (!selectedTime)   e.time   = 'Vui lòng chọn khung giờ.';
    if (!name.trim())    e.name   = 'Họ và tên là bắt buộc.';
    if (!email.trim() || !email.includes('@')) e.email = 'Vui lòng nhập email hợp lệ.';
    if (!phone.trim())   e.phone  = 'Số điện thoại là bắt buộc.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate() || !selectedDoctor) return;
    setSubmitting(true);
    try {
      const appt = await createAppointment({
        patientName: name,
        patientPhone: phone,
        patientEmail: email,
        doctorId: selectedDoctor.id,
        appointmentDate: selectedDate,
        appointmentTime: selectedTime,
      });
      setConfirmed(appt);
    } catch {
      setErrors({ submit: 'Có lỗi xảy ra. Vui lòng thử lại.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setConfirmed(null);
    setSelectedDoctor(null);
    setSelectedDate('');
    setSelectedTime('');
    setName(''); setEmail(''); setPhone('');
    setErrors({});
    setAvailability([]);
  };

  return (
    <section id="booking" className="bg-white py-24">
      <div className="max-w-6xl mx-auto px-6">
        {confirmed ? (
          <SuccessState appt={confirmed} onReset={handleReset} />
        ) : (
          <div className="grid md:grid-cols-5 gap-12 lg:gap-20 items-start">

            {/* ── Left: form ── */}
            <div className="md:col-span-3">
              <p className="text-xs font-bold text-teal-600 uppercase tracking-widest mb-2">Bắt đầu ngay</p>
              <h2 className="text-3xl font-extrabold text-slate-900 mb-2">Đặt lịch khám</h2>
              <p className="text-slate-500 mb-8">Điền thông tin bên dưới và chúng tôi sẽ xác nhận lịch hẹn của bạn.</p>

              <div className="space-y-4">

                {/* Step 1 — Doctor */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
                  <p className="text-xs font-bold text-teal-600 uppercase tracking-widest mb-4">
                    Bước 01 — Chọn bác sĩ
                  </p>
                  {errors.doctor && <p className="text-xs text-red-500 mb-3">{errors.doctor}</p>}
                  {loadingDoctors ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="h-16 rounded-xl bg-slate-200 animate-pulse" />
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {doctors.map((doc) => {
                        const active = selectedDoctor?.id === doc.id;
                        return (
                          <button
                            key={doc.id}
                            type="button"
                            onClick={() => { setSelectedDoctor(doc); setErrors((e) => ({ ...e, doctor: '' })); }}
                            className={`flex items-center gap-3 p-3.5 rounded-xl border text-left cursor-pointer transition-all w-full ${
                              active
                                ? 'bg-teal-50 border-teal-500 ring-1 ring-teal-500'
                                : 'bg-white border-slate-200 hover:border-teal-400'
                            }`}
                          >
                            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${active ? 'bg-teal-600 text-white' : 'bg-teal-100 text-teal-700'}`}>
                              {getInitials(doc.name)}
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-slate-900 text-sm truncate">{doc.name}</p>
                              <p className="text-xs text-slate-500 truncate">{doc.specialty}</p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Step 2 — Date & Time */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
                  <p className="text-xs font-bold text-teal-600 uppercase tracking-widest mb-4">
                    Bước 02 — Ngày &amp; Giờ
                  </p>

                  <input
                    type="date"
                    min={today}
                    value={selectedDate}
                    onChange={(e) => { setSelectedDate(e.target.value); setErrors((x) => ({ ...x, date: '' })); }}
                    className={`w-full bg-white border text-slate-900 text-sm rounded-xl p-3 outline-none transition-colors mb-1 ${
                      errors.date ? 'border-red-400' : 'border-slate-200 focus:border-teal-500'
                    }`}
                  />
                  {errors.date && <p className="text-xs text-red-500 mb-3">{errors.date}</p>}

                  {/* Time slots */}
                  {!selectedDoctor ? (
                    <p className="text-xs text-slate-400 italic mt-3">Vui lòng chọn bác sĩ trước để xem khung giờ.</p>
                  ) : !selectedDate ? (
                    <p className="text-xs text-slate-400 italic mt-3">Vui lòng chọn ngày để xem khung giờ.</p>
                  ) : loadingSlots ? (
                    <div className="grid grid-cols-3 gap-2 mt-3">
                      {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="h-9 bg-slate-200 rounded-lg animate-pulse" />
                      ))}
                    </div>
                  ) : timeSlots.length === 0 ? (
                    <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mt-3">
                      Bác sĩ không làm việc vào ngày này. Vui lòng chọn ngày khác.
                    </p>
                  ) : (
                    <>
                      <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mt-4 mb-2">
                        Khung giờ trống ({timeSlots.length} ca)
                      </p>
                      <div className="grid grid-cols-3 gap-2">
                        {timeSlots.map((t) => (
                          <button
                            key={t}
                            type="button"
                            onClick={() => { setSelectedTime(t); setErrors((x) => ({ ...x, time: '' })); }}
                            className={`py-2.5 text-xs font-semibold border rounded-lg transition-all cursor-pointer ${
                              selectedTime === t
                                ? 'bg-teal-600 border-teal-600 text-white shadow-sm'
                                : 'bg-white border-slate-200 text-slate-600 hover:border-teal-400 hover:text-teal-600'
                            }`}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                  {errors.time && <p className="text-xs text-red-500 mt-2">{errors.time}</p>}
                </div>

                {/* Step 3 — Details */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
                  <p className="text-xs font-bold text-teal-600 uppercase tracking-widest mb-4">
                    Bước 03 — Thông tin của bạn
                  </p>
                  <div className="space-y-3">
                    <div>
                      <input
                        type="text"
                        placeholder="Họ và tên"
                        value={name}
                        onChange={(e) => { setName(e.target.value); setErrors((x) => ({ ...x, name: '' })); }}
                        className={`w-full bg-white border text-slate-900 text-sm rounded-xl p-3 outline-none transition-colors ${errors.name ? 'border-red-400' : 'border-slate-200 focus:border-teal-500'}`}
                      />
                      {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                    </div>
                    <div>
                      <input
                        type="email"
                        placeholder="Địa chỉ email"
                        value={email}
                        onChange={(e) => { setEmail(e.target.value); setErrors((x) => ({ ...x, email: '' })); }}
                        className={`w-full bg-white border text-slate-900 text-sm rounded-xl p-3 outline-none transition-colors ${errors.email ? 'border-red-400' : 'border-slate-200 focus:border-teal-500'}`}
                      />
                      {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                    </div>
                    <div>
                      <input
                        type="tel"
                        placeholder="Số điện thoại"
                        value={phone}
                        onChange={(e) => { setPhone(e.target.value); setErrors((x) => ({ ...x, phone: '' })); }}
                        className={`w-full bg-white border text-slate-900 text-sm rounded-xl p-3 outline-none transition-colors ${errors.phone ? 'border-red-400' : 'border-slate-200 focus:border-teal-500'}`}
                      />
                      {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
                    </div>
                  </div>
                </div>

                {/* Submit */}
                {errors.submit && <p className="text-sm text-red-500 text-center">{errors.submit}</p>}
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="w-full bg-teal-600 hover:bg-teal-700 disabled:bg-teal-300 text-white font-bold rounded-xl text-base px-5 py-4 transition-colors shadow-md cursor-pointer"
                >
                  {submitting ? 'Đang xử lý…' : 'Xác nhận lịch hẹn →'}
                </button>
                <p className="text-center text-xs text-slate-400 flex items-center justify-center gap-1.5">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Thông tin của bạn được mã hóa bảo mật
                </p>
              </div>
            </div>

            {/* ── Right: info panel ── */}
            <div className="md:col-span-2">
              <div className="bg-linear-to-br from-teal-700 to-teal-900 rounded-3xl p-8 text-white sticky top-24">
                <p className="text-xs font-bold uppercase tracking-widest text-teal-300 mb-4">Tại sao chọn Aura Health?</p>
                <h3 className="text-xl font-bold mb-6 leading-snug">
                  Chăm sóc sức khỏe đặt bạn lên hàng đầu.
                </h3>
                <ul className="space-y-4">
                  {WHY_ITEMS.map(({ icon, text }) => (
                    <li key={text} className="flex items-start gap-3 text-sm text-white/80">
                      <span className="text-base shrink-0 mt-0.5">{icon}</span>
                      {text}
                    </li>
                  ))}
                </ul>
                <div className="mt-8 pt-6 border-t border-white/15">
                  <p className="text-white/50 text-xs uppercase tracking-wider mb-1">Cần hỗ trợ đặt lịch?</p>
                  <p className="font-semibold text-white">+84 123 456 789</p>
                  <p className="text-white/50 text-xs mt-0.5">Thứ 2 – Thứ 6, 8:00 – 18:00</p>
                </div>
                <div className="mt-6 bg-white/10 rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex -space-x-2">
                      {['AN', 'TB', 'LC'].map((i) => (
                        <div key={i} className="w-7 h-7 rounded-full bg-teal-400 border-2 border-teal-700 flex items-center justify-center text-xs font-bold text-white">
                          {i[0]}
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-white/70">+1.000 bệnh nhân tháng này</p>
                  </div>
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <svg key={i} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                    <span className="text-white/60 text-xs ml-1 self-center">4.9 / 5.0</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}
      </div>
    </section>
  );
}

function SuccessState({ appt, onReset }: { appt: Appointment; onReset: () => void }) {
  return (
    <div className="max-w-lg mx-auto text-center py-16">
      <div className="w-20 h-20 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-6">
        <svg className="w-10 h-10 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h3 className="text-3xl font-extrabold text-slate-900 mb-2">Đặt lịch thành công!</h3>
      <p className="text-slate-500 mb-8">
        Thông tin xác nhận đã được gửi đến <strong className="text-slate-700">{appt.patientEmail}</strong>.
      </p>
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-left space-y-3 mb-8">
        {[
          ['Bệnh nhân',   appt.patientName],
          ['Bác sĩ',      appt.doctor.name],
          ['Chuyên khoa', appt.doctor.specialty],
          ['Ngày khám',   appt.appointmentDate],
          ['Giờ khám',    appt.appointmentTime],
        ].map(([label, value]) => (
          <div key={label} className="flex justify-between text-sm">
            <span className="text-slate-400 font-medium">{label}</span>
            <span className="font-semibold text-slate-800">{value}</span>
          </div>
        ))}
      </div>
      <button
        onClick={onReset}
        className="bg-teal-600 hover:bg-teal-700 text-white font-semibold px-8 py-3 rounded-full transition-colors cursor-pointer text-sm"
      >
        Đặt lịch khám khác
      </button>
    </div>
  );
}
