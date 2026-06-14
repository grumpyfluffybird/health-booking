import { useEffect, useState } from 'react';
import { getDoctors } from '../../services/doctorService';
import {
  adminCreateDoctor,
  adminUpdateDoctor,
  adminDeleteDoctor,
  getDoctorAvailability,
  addDoctorAvailability,
  deleteDoctorAvailability,
} from '../../services/adminDoctorService';
import type { Doctor, DoctorAvailability, DoctorAvailabilityRequest } from '../../types';

const DAYS: { value: DoctorAvailability['dayOfWeek']; label: string }[] = [
  { value: 'MONDAY',    label: 'Thứ Hai' },
  { value: 'TUESDAY',   label: 'Thứ Ba' },
  { value: 'WEDNESDAY', label: 'Thứ Tư' },
  { value: 'THURSDAY',  label: 'Thứ Năm' },
  { value: 'FRIDAY',    label: 'Thứ Sáu' },
  { value: 'SATURDAY',  label: 'Thứ Bảy' },
  { value: 'SUNDAY',    label: 'Chủ Nhật' },
];

const dayLabel = (v: DoctorAvailability['dayOfWeek']) =>
  DAYS.find(d => d.value === v)?.label ?? v;

function getInitials(name: string) {
  const parts = name.replace('Dr. ', '').replace('Bác sĩ ', '').split(' ');
  return (parts[0][0] + (parts[parts.length - 1][0] ?? '')).toUpperCase();
}

/* ─── Doctor form ─── */
function DoctorForm({
  initial,
  onSave,
  onCancel,
}: {
  initial?: Doctor;
  onSave: (data: { name: string; specialty: string }) => Promise<void>;
  onCancel: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? '');
  const [specialty, setSpecialty] = useState(initial?.specialty ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    if (!name.trim() || !specialty.trim()) return setError('Vui lòng điền đầy đủ thông tin.');
    setSaving(true);
    setError('');
    try {
      await onSave({ name: name.trim(), specialty: specialty.trim() });
    } catch {
      setError('Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-teal-50 border border-teal-200 rounded-2xl p-5 mb-4">
      <p className="text-sm font-semibold text-teal-800 mb-4">
        {initial ? 'Chỉnh sửa bác sĩ' : 'Thêm bác sĩ mới'}
      </p>
      {error && <p className="text-xs text-red-500 mb-3">{error}</p>}
      <div className="grid sm:grid-cols-2 gap-3 mb-4">
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Họ và tên</label>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="VD: Dr. Nguyễn Văn An"
            className="w-full bg-white border border-slate-200 focus:border-teal-500 text-slate-900 text-sm rounded-xl p-2.5 outline-none transition-colors"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Chuyên khoa</label>
          <input
            value={specialty}
            onChange={e => setSpecialty(e.target.value)}
            placeholder="VD: Tim mạch"
            className="w-full bg-white border border-slate-200 focus:border-teal-500 text-slate-900 text-sm rounded-xl p-2.5 outline-none transition-colors"
          />
        </div>
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="bg-teal-600 hover:bg-teal-700 disabled:bg-teal-300 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors cursor-pointer"
        >
          {saving ? 'Đang lưu…' : 'Lưu'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 text-sm font-semibold px-4 py-2 rounded-lg transition-colors cursor-pointer"
        >
          Hủy
        </button>
      </div>
    </div>
  );
}

/* ─── Availability panel ─── */
function AvailabilityPanel({ doctor }: { doctor: Doctor }) {
  const [slots, setSlots] = useState<DoctorAvailability[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<DoctorAvailabilityRequest>({
    dayOfWeek: 'MONDAY',
    startTime: '08:00',
    endTime: '17:00',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    getDoctorAvailability(doctor.id)
      .then(setSlots)
      .finally(() => setLoading(false));
  }, [doctor.id]);

  const handleAdd = async () => {
    if (form.startTime >= form.endTime) return setError('Giờ bắt đầu phải trước giờ kết thúc.');
    setSaving(true);
    setError('');
    try {
      const slot = await addDoctorAvailability(doctor.id, form);
      setSlots(prev => [...prev, slot]);
      setShowForm(false);
    } catch {
      setError('Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (availId: number) => {
    await deleteDoctorAvailability(doctor.id, availId);
    setSlots(prev => prev.filter(s => s.id !== availId));
  };

  return (
    <div className="mt-4 pt-4 border-t border-slate-100">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          Lịch làm việc — {doctor.name}
        </p>
        <button
          type="button"
          onClick={() => { setShowForm(v => !v); setError(''); }}
          className="text-xs font-semibold text-teal-600 hover:text-teal-700 cursor-pointer flex items-center gap-1"
        >
          <span className="text-base leading-none">+</span> Thêm khung giờ
        </button>
      </div>

      {showForm && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-3">
          {error && <p className="text-xs text-red-500 mb-2">{error}</p>}
          <div className="grid grid-cols-3 gap-3 mb-3">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Ngày</label>
              <select
                value={form.dayOfWeek}
                onChange={e => setForm(f => ({ ...f, dayOfWeek: e.target.value as DoctorAvailability['dayOfWeek'] }))}
                className="w-full bg-white border border-slate-200 text-slate-800 text-xs rounded-lg p-2 outline-none focus:border-teal-500"
              >
                {DAYS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Bắt đầu</label>
              <input
                type="time"
                value={form.startTime}
                onChange={e => setForm(f => ({ ...f, startTime: e.target.value }))}
                className="w-full bg-white border border-slate-200 text-slate-800 text-xs rounded-lg p-2 outline-none focus:border-teal-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Kết thúc</label>
              <input
                type="time"
                value={form.endTime}
                onChange={e => setForm(f => ({ ...f, endTime: e.target.value }))}
                className="w-full bg-white border border-slate-200 text-slate-800 text-xs rounded-lg p-2 outline-none focus:border-teal-500"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleAdd}
              disabled={saving}
              className="bg-teal-600 hover:bg-teal-700 disabled:bg-teal-300 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
            >
              {saving ? 'Đang lưu…' : 'Thêm'}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="bg-white border border-slate-200 text-slate-600 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
            >
              Hủy
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="space-y-2">
          {[1, 2].map(i => <div key={i} className="h-8 bg-slate-100 rounded-lg animate-pulse" />)}
        </div>
      ) : slots.length === 0 ? (
        <p className="text-xs text-slate-400 italic">Chưa có lịch làm việc nào.</p>
      ) : (
        <div className="space-y-1.5">
          {slots.map(slot => (
            <div key={slot.id} className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-teal-700 w-20">{dayLabel(slot.dayOfWeek)}</span>
                <span className="text-xs text-slate-600">{slot.startTime} – {slot.endTime}</span>
              </div>
              <button
                type="button"
                onClick={() => handleDelete(slot.id)}
                className="text-slate-300 hover:text-red-500 transition-colors cursor-pointer text-lg leading-none"
                title="Xóa"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Main Doctors panel ─── */
export default function DoctorsPanel() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    getDoctors().then(setDoctors).finally(() => setLoading(false));
  }, []);

  const handleCreate = async (data: { name: string; specialty: string }) => {
    const created = await adminCreateDoctor(data);
    setDoctors(prev => [...prev, created]);
    setShowAddForm(false);
  };

  const handleUpdate = async (id: number, data: { name: string; specialty: string }) => {
    const updated = await adminUpdateDoctor(id, data);
    setDoctors(prev => prev.map(d => d.id === id ? updated : d));
    setEditingId(null);
  };

  const handleDelete = async (id: number) => {
    setDeletingId(id);
    try {
      await adminDeleteDoctor(id);
      setDoctors(prev => prev.filter(d => d.id !== id));
      if (expandedId === id) setExpandedId(null);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div>
      {/* Add button */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-slate-500">{doctors.length} bác sĩ trong hệ thống</p>
        {!showAddForm && (
          <button
            type="button"
            onClick={() => setShowAddForm(true)}
            className="bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <span className="text-base leading-none">+</span> Thêm bác sĩ
          </button>
        )}
      </div>

      {/* Add form */}
      {showAddForm && (
        <DoctorForm onSave={handleCreate} onCancel={() => setShowAddForm(false)} />
      )}

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="h-16 bg-slate-100 rounded-2xl animate-pulse" />)}
        </div>
      ) : doctors.length === 0 ? (
        <div className="py-16 text-center text-slate-400 text-sm">Chưa có bác sĩ nào.</div>
      ) : (
        <div className="space-y-3">
          {doctors.map(doc => (
            <div key={doc.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
              {/* Row */}
              <div className="flex items-center gap-4 px-5 py-4">
                <div className="w-10 h-10 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-sm shrink-0">
                  {getInitials(doc.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900 text-sm truncate">{doc.name}</p>
                  <p className="text-xs text-slate-500">{doc.specialty}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => { setExpandedId(expandedId === doc.id ? null : doc.id); setEditingId(null); }}
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-50 text-slate-600 hover:bg-teal-50 hover:text-teal-700 border border-slate-200 transition-colors cursor-pointer"
                  >
                    {expandedId === doc.id ? 'Đóng' : 'Lịch làm việc'}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setEditingId(editingId === doc.id ? null : doc.id); setExpandedId(null); }}
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
                  >
                    Sửa
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(doc.id)}
                    disabled={deletingId === doc.id}
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {deletingId === doc.id ? '…' : 'Xóa'}
                  </button>
                </div>
              </div>

              {/* Edit form */}
              {editingId === doc.id && (
                <div className="px-5 pb-4">
                  <DoctorForm
                    initial={doc}
                    onSave={data => handleUpdate(doc.id, data)}
                    onCancel={() => setEditingId(null)}
                  />
                </div>
              )}

              {/* Availability */}
              {expandedId === doc.id && (
                <div className="px-5 pb-4">
                  <AvailabilityPanel doctor={doc} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
