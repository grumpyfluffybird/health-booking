import React, { useState } from 'react';
import type { Appointment } from '../../types';

interface Props {
  appointments: Appointment[];
  onStatusChange: (id: number, status: Appointment['status']) => void;
}

const STATUS_PILL: Record<string, string> = {
  PENDING:   'bg-amber-50  text-amber-700  border-amber-200',
  CONFIRMED: 'bg-green-50  text-green-700  border-green-200',
  CANCELLED: 'bg-red-50    text-red-600    border-red-200',
};

const DOT: Record<string, string> = {
  PENDING:   'bg-amber-400',
  CONFIRMED: 'bg-green-500',
  CANCELLED: 'bg-red-400',
};

const STATUS_LABEL: Record<string, string> = {
  PENDING:   'Chờ xác nhận',
  CONFIRMED: 'Đã xác nhận',
  CANCELLED: 'Đã hủy',
};

export default function AppointmentTable({ appointments, onStatusChange }: Props) {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  if (appointments.length === 0) {
    return (
      <div className="py-16 text-center">
        <svg className="w-10 h-10 text-slate-200 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <p className="text-sm font-medium text-slate-500">Không có lịch hẹn nào</p>
        <p className="text-xs text-slate-400 mt-1">Lịch đặt khám sẽ xuất hiện ở đây khi bệnh nhân đăng ký.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-100 text-xs font-semibold text-slate-400 uppercase tracking-widest">
            <th className="px-6 py-3 text-left w-6" />
            <th className="px-6 py-3 text-left">Bệnh nhân</th>
            <th className="px-6 py-3 text-left">Bác sĩ</th>
            <th className="px-6 py-3 text-left">Ngày &amp; Giờ</th>
            <th className="px-6 py-3 text-left">Trạng thái</th>
            <th className="px-6 py-3 text-left">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {appointments.map((appt) => {
            const expanded = expandedId === appt.id;
            return (
              <React.Fragment key={appt.id}>
                {/* Main row */}
                <tr
                  onClick={() => setExpandedId(expanded ? null : appt.id)}
                  className={`border-b border-slate-100 cursor-pointer transition-colors ${expanded ? 'bg-teal-50/40' : 'hover:bg-slate-50/70'}`}
                >
                  {/* Chevron */}
                  <td className="pl-6 py-4">
                    <svg
                      className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${expanded ? 'rotate-90' : ''}`}
                      fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </td>

                  {/* Patient */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-xs font-bold shrink-0">
                        {appt.patientName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-slate-800">{appt.patientName}</p>
                        <p className="text-xs text-slate-400">{appt.patientEmail}</p>
                      </div>
                    </div>
                  </td>

                  {/* Doctor */}
                  <td className="px-6 py-4">
                    <p className="font-medium text-slate-700">{appt.doctor.name}</p>
                    <p className="text-xs text-slate-400">{appt.doctor.specialty}</p>
                  </td>

                  {/* Date & time */}
                  <td className="px-6 py-4">
                    <p className="font-medium text-slate-700">{appt.appointmentDate}</p>
                    <p className="text-xs text-slate-400">{appt.appointmentTime}</p>
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${STATUS_PILL[appt.status]}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${DOT[appt.status]}`} />
                      {STATUS_LABEL[appt.status]}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center gap-2">
                      {appt.status !== 'CONFIRMED' && (
                        <button
                          onClick={() => onStatusChange(appt.id, 'CONFIRMED')}
                          className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-teal-50 text-teal-700 hover:bg-teal-100 border border-teal-200 transition-colors cursor-pointer"
                        >
                          Xác nhận
                        </button>
                      )}
                      {appt.status !== 'CANCELLED' && (
                        <button
                          onClick={() => onStatusChange(appt.id, 'CANCELLED')}
                          className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 transition-colors cursor-pointer"
                        >
                          Hủy lịch
                        </button>
                      )}
                      {appt.status === 'CANCELLED' && (
                        <span className="text-xs text-slate-300">—</span>
                      )}
                    </div>
                  </td>
                </tr>

                {/* Accordion detail row */}
                {expanded && (
                  <tr className="bg-teal-50/40 border-b border-slate-100">
                    <td />
                    <td colSpan={5} className="px-6 py-5">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Detail label="Mã lịch hẹn" value={`#${appt.id}`} />
                        <Detail label="Số điện thoại" value={appt.patientPhone || '—'} />
                        <Detail label="Email bệnh nhân" value={appt.patientEmail} />
                        <Detail label="Ngày đặt" value={formatDateTime(appt.createdAt)} />
                        <Detail label="Bác sĩ" value={appt.doctor.name} />
                        <Detail label="Chuyên khoa" value={appt.doctor.specialty} />
                        <Detail label="Ngày khám" value={appt.appointmentDate} />
                        <Detail label="Giờ khám" value={appt.appointmentTime} />
                        {appt.notes && (
                          <div className="col-span-2 md:col-span-4">
                            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">Ghi chú</p>
                            <p className="text-sm text-slate-700 bg-white border border-slate-200 rounded-xl px-4 py-2.5">{appt.notes}</p>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-0.5">{label}</p>
      <p className="text-sm font-medium text-slate-800">{value}</p>
    </div>
  );
}

function formatDateTime(iso: string) {
  if (!iso) return '—';
  const d = new Date(iso);
  return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
}
