import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { getAppointments, updateAppointmentStatus } from '../../services/appointmentService';
import AppointmentTable from './AppointmentTable';
import DoctorsPanel from './Doctors';
import type { Appointment } from '../../types';

type Filter = 'ALL' | Appointment['status'];
type Tab = 'appointments' | 'doctors';

export default function AdminDashboard() {
  const { token, username, logout } = useAuthStore();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<Filter>('ALL');
  const [tab, setTab] = useState<Tab>('appointments');

  useEffect(() => {
    if (!token) { navigate('/admin/login'); return; }
    getAppointments()
      .then(setAppointments)
      .catch(() => setError('Failed to load appointments.'))
      .finally(() => setLoading(false));
  }, [token, navigate]);

  const handleStatusChange = async (id: number, status: Appointment['status']) => {
    try {
      const updated = await updateAppointmentStatus(id, status);
      setAppointments((prev) => prev.map((a) => (a.id === id ? updated : a)));
    } catch {
      alert('Failed to update status.');
    }
  };

  const counts = {
    ALL:       appointments.length,
    PENDING:   appointments.filter((a) => a.status === 'PENDING').length,
    CONFIRMED: appointments.filter((a) => a.status === 'CONFIRMED').length,
    CANCELLED: appointments.filter((a) => a.status === 'CANCELLED').length,
  };

  const visible = filter === 'ALL' ? appointments : appointments.filter((a) => a.status === filter);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">+</div>
            <span className="text-xl font-semibold text-slate-900 tracking-tight">Aura Health</span>
            <span className="hidden sm:block text-slate-300 mx-1">·</span>
            <span className="hidden sm:block text-sm text-slate-500">Admin</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/" className="text-sm text-slate-500 hover:text-teal-600 transition-colors no-underline hidden sm:block">
              Trang bệnh nhân
            </Link>
            <span className="text-sm text-slate-700 font-medium">{username}</span>
            <button
              onClick={() => { logout(); navigate('/admin/login'); }}
              className="text-sm text-slate-500 hover:text-red-500 transition-colors cursor-pointer font-medium"
            >
              Đăng xuất
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-10">
        {/* Page heading + tabs */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Quản trị</h1>
          <div className="flex gap-1 mt-4 bg-slate-100 rounded-xl p-1 w-fit">
            {([
              { key: 'appointments', label: 'Lịch hẹn' },
              { key: 'doctors',      label: 'Bác sĩ' },
            ] as const).map(({ key, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => setTab(key)}
                className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                  tab === key
                    ? 'bg-white text-teal-700 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Appointments tab ── */}
        {tab === 'appointments' && (
          <>
            {/* Stat cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {([
                { key: 'ALL',       label: 'Tất cả',       color: 'teal'   },
                { key: 'PENDING',   label: 'Chờ xác nhận', color: 'amber'  },
                { key: 'CONFIRMED', label: 'Đã xác nhận',  color: 'green'  },
                { key: 'CANCELLED', label: 'Đã hủy',       color: 'red'    },
              ] as const).map(({ key, label, color }) => {
                const active = filter === key;
                const colorMap = {
                  teal:  { ring: 'ring-teal-500',  text: 'text-teal-600',  bg: 'bg-teal-50'  },
                  amber: { ring: 'ring-amber-400', text: 'text-amber-600', bg: 'bg-amber-50' },
                  green: { ring: 'ring-green-500', text: 'text-green-600', bg: 'bg-green-50' },
                  red:   { ring: 'ring-red-400',   text: 'text-red-600',   bg: 'bg-red-50'   },
                };
                const c = colorMap[color];
                return (
                  <button
                    key={key}
                    onClick={() => setFilter(key)}
                    className={`text-left p-5 rounded-2xl border-2 transition-all cursor-pointer ${
                      active
                        ? `${c.bg} border-transparent ring-2 ${c.ring}`
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <p className={`text-3xl font-extrabold ${active ? c.text : 'text-slate-800'}`}>
                      {counts[key]}
                    </p>
                    <p className={`text-sm font-medium mt-0.5 ${active ? c.text : 'text-slate-500'}`}>
                      {label}
                    </p>
                  </button>
                );
              })}
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100">
                <p className="font-semibold text-slate-900 text-sm">
                  {filter === 'ALL' ? 'Tất cả lịch hẹn' : filter === 'PENDING' ? 'Chờ xác nhận' : filter === 'CONFIRMED' ? 'Đã xác nhận' : 'Đã hủy'}
                  <span className="ml-2 text-xs font-normal text-slate-400">{visible.length} bản ghi</span>
                </p>
              </div>
              {loading ? (
                <div className="divide-y divide-slate-100">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="px-6 py-5 flex items-center gap-4">
                      <div className="w-9 h-9 rounded-full bg-slate-100 animate-pulse shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div className="h-3.5 bg-slate-100 rounded animate-pulse w-40" />
                        <div className="h-3 bg-slate-100 rounded animate-pulse w-24" />
                      </div>
                      <div className="h-6 w-20 bg-slate-100 rounded-full animate-pulse" />
                    </div>
                  ))}
                </div>
              ) : error ? (
                <div className="py-16 text-center text-red-500 text-sm">Không thể tải dữ liệu lịch hẹn.</div>
              ) : (
                <AppointmentTable appointments={visible} onStatusChange={handleStatusChange} />
              )}
            </div>
          </>
        )}

        {/* ── Doctors tab ── */}
        {tab === 'doctors' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <DoctorsPanel />
          </div>
        )}
      </main>

      <footer className="bg-slate-900 text-slate-400 py-6 text-center text-xs mt-auto">
        &copy; {new Date().getFullYear()} Aura Personal Health · Bảng quản trị
      </footer>
    </div>
  );
}
