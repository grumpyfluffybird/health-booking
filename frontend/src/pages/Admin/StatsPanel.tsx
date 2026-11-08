import { useEffect, useMemo, useState } from 'react';
import { getAppointmentStats } from '../../services/appointmentService';
import type { AppointmentStats } from '../../types';
import { apiErrorMessage, daysInclusive, formatDateVN, todayInAppTz, weekdayLabel } from '../../utils/date';

const MAX_DAYS = 90;

/** Nhãn & màu chấm cho từng trạng thái thực tế trong mã nguồn; trạng thái lạ vẫn được hiển thị bằng tên gốc. */
const STATUS_META: Record<string, { label: string; dot: string }> = {
  PENDING:   { label: 'Chờ xác nhận', dot: 'bg-amber-400' },
  CONFIRMED: { label: 'Đã xác nhận',  dot: 'bg-green-500' },
  CANCELLED: { label: 'Đã hủy',       dot: 'bg-red-400' },
};
const STATUS_ORDER = ['PENDING', 'CONFIRMED', 'CANCELLED'];

const startOfMonth = (iso: string) => `${iso.slice(0, 8)}01`;

function validateRange(from: string, to: string): string {
  if (!from || !to) return 'Vui lòng chọn đủ Từ ngày và Đến ngày.';
  if (from > to) return 'Từ ngày phải trước hoặc bằng Đến ngày.';
  const days = daysInclusive(from, to);
  if (days > MAX_DAYS) return `Chỉ được xem tối đa ${MAX_DAYS} ngày mỗi lần (đang chọn ${days} ngày).`;
  return '';
}

export default function StatsPanel() {
  const today = todayInAppTz();
  const [from, setFrom] = useState(startOfMonth(today));
  const [to, setTo] = useState(today);
  // Khoảng ngày đang được truy vấn; n tăng mỗi lần bấm "Xem" để luôn tải lại.
  const [query, setQuery] = useState({ from: startOfMonth(today), to: today, n: 0 });
  const [data, setData] = useState<AppointmentStats | null>(null);
  const [result, setResult] = useState<{ key: string; error: string } | null>(null);
  const [inputError, setInputError] = useState('');

  const queryKey = `${query.from}|${query.to}|${query.n}`;
  useEffect(() => {
    let cancelled = false;
    getAppointmentStats(query.from, query.to)
      .then((d) => { if (!cancelled) { setData(d); setResult({ key: queryKey, error: '' }); } })
      .catch((e) => {
        if (!cancelled) setResult({ key: queryKey, error: apiErrorMessage(e, 'Không thể tải thống kê.') });
      });
    return () => { cancelled = true; };
  }, [query.from, query.to, queryKey]);

  const loading = result?.key !== queryKey;
  const error = inputError || (result?.key === queryKey ? result.error : '');

  const load = (f: string, t: string) => {
    const invalid = validateRange(f, t);
    setInputError(invalid);
    if (!invalid) setQuery((q) => ({ from: f, to: t, n: q.n + 1 }));
  };

  const statuses = useMemo(() => {
    if (!data) return [];
    return [...data.byStatus].sort((a, b) => {
      const ia = STATUS_ORDER.indexOf(a.status), ib = STATUS_ORDER.indexOf(b.status);
      return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib);
    });
  }, [data]);

  return (
    <div className="space-y-6">
      {/* Bộ lọc */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-wrap items-end gap-3">
        <DateField label="Từ ngày" value={from} max={to || undefined} onChange={setFrom} />
        <DateField label="Đến ngày" value={to} min={from || undefined} onChange={setTo} />
        <button
          type="button"
          onClick={() => load(from, to)}
          disabled={loading}
          className="bg-teal-600 hover:bg-teal-700 disabled:bg-teal-300 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors cursor-pointer"
        >
          {loading ? 'Đang tải…' : 'Xem thống kê'}
        </button>
        <button
          type="button"
          onClick={() => { const t = todayInAppTz(); setFrom(startOfMonth(t)); setTo(t); load(startOfMonth(t), t); }}
          className="bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors cursor-pointer"
        >
          Tháng này
        </button>
        <p className="text-xs text-slate-400 basis-full">
          Thống kê theo <strong className="font-semibold text-slate-500">ngày hẹn khám</strong> (không phải ngày tạo), bao gồm trọn ngày đầu và ngày cuối, tối đa {MAX_DAYS} ngày.
        </p>
      </div>

      {error && (
        <div role="alert" className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">{error}</div>
      )}

      {loading && !data ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-24 bg-slate-100 rounded-2xl animate-pulse" />)}
          </div>
          <div className="h-72 bg-slate-100 rounded-2xl animate-pulse" />
        </div>
      ) : data && (
        <div className={`space-y-6 transition-opacity ${loading ? 'opacity-60' : ''}`}>
          {/* Số liệu tổng hợp */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Tổng lịch hẹn" value={data.total} hint="Bao gồm cả lịch đã hủy" highlight />
            {statuses.map((s) => (
              <StatCard
                key={s.status}
                label={STATUS_META[s.status]?.label ?? s.status}
                value={s.count}
                dot={STATUS_META[s.status]?.dot ?? 'bg-slate-400'}
              />
            ))}
          </div>

          {/* Biểu đồ */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <div className="flex flex-wrap items-baseline justify-between gap-2 mb-1">
              <h2 className="font-semibold text-slate-900 text-sm">Số lịch hẹn theo ngày</h2>
              <p className="text-xs text-slate-400">{formatDateVN(data.from)} – {formatDateVN(data.to)}</p>
            </div>
            <p className="text-xs text-slate-400 mb-5">
              Mỗi cột là tổng số lịch hẹn có ngày hẹn khám là ngày đó, gồm mọi trạng thái (kể cả đã hủy).
              Lịch đã đổi được tính vào ngày hẹn mới.
            </p>
            {data.total === 0 && (
              <div className="mb-4 text-center bg-slate-50 border border-dashed border-slate-200 rounded-xl py-3">
                <p className="text-sm font-medium text-slate-500">Không có lịch hẹn nào trong khoảng thời gian này</p>
                <p className="text-xs text-slate-400">Tất cả các ngày đều bằng 0.</p>
              </div>
            )}
            <DailyBarChart daily={data.daily} />
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Biểu đồ cột (dựng bằng HTML/CSS, không thêm thư viện) ─── */

function niceScale(max: number) {
  if (max <= 0) return { top: 4, step: 1 };
  const rough = max / 4;
  const pow = 10 ** Math.floor(Math.log10(rough));
  const step = [1, 2, 5, 10].map((m) => m * pow).find((s) => s >= rough) ?? 10 * pow;
  const stepInt = Math.max(1, Math.round(step));
  return { top: Math.ceil(max / stepInt) * stepInt, step: stepInt };
}

function DailyBarChart({ daily }: { daily: AppointmentStats['daily'] }) {
  const [hover, setHover] = useState<number | null>(null);
  const [showTable, setShowTable] = useState(false);
  const max = Math.max(0, ...daily.map((d) => d.count));
  const { top, step } = niceScale(max);
  const ticks = Array.from({ length: top / step + 1 }, (_, i) => i * step);
  const labelEvery = Math.ceil(daily.length / 12);
  const hovered = hover !== null ? daily[hover] : null;

  return (
    <div>
      {/* pt-14: chừa chỗ cho nhãn trục trên cùng và tooltip (overflow-x-auto cũng cắt theo chiều dọc) */}
      <div className="overflow-x-auto pt-14 pb-1">
        <div className="flex gap-2" style={{ minWidth: daily.length * 8 + 40 }}>
          {/* Trục Y */}
          <div className="relative h-56 w-8 shrink-0 text-right">
            {ticks.map((t) => (
              <span
                key={t}
                className="absolute right-0 -translate-y-1/2 text-[11px] text-slate-400 tabular-nums"
                style={{ bottom: `${(t / top) * 100}%` }}
              >
                {t}
              </span>
            ))}
          </div>

          <div className="flex-1 min-w-0">
            {/* Vùng vẽ */}
            <div className="relative h-56" onMouseLeave={() => setHover(null)}>
              {ticks.map((t) => (
                <div
                  key={t}
                  className={`absolute inset-x-0 border-t ${t === 0 ? 'border-slate-300' : 'border-slate-100'}`}
                  style={{ bottom: `${(t / top) * 100}%` }}
                />
              ))}
              <div className="absolute inset-0 flex items-end gap-0.5">
                {daily.map((d, i) => (
                  <div
                    key={d.date}
                    className="relative flex-1 h-full flex items-end cursor-default"
                    onMouseEnter={() => setHover(i)}
                    onFocus={() => setHover(i)}
                    onBlur={() => setHover(null)}
                    tabIndex={0}
                    aria-label={`${formatDateVN(d.date)}: ${d.count} lịch hẹn`}
                  >
                    {hover === i && <div className="absolute inset-0 bg-slate-100/70 rounded-sm" />}
                    <div
                      className={`relative w-full rounded-t-sm transition-colors ${hover === i ? 'bg-teal-700' : 'bg-teal-600'}`}
                      style={{ height: d.count > 0 ? `${(d.count / top) * 100}%` : 0 }}
                    />
                  </div>
                ))}
              </div>

              {/* Tooltip */}
              {hovered && hover !== null && (
                <div
                  className="pointer-events-none absolute -top-2 z-10 -translate-x-1/2 -translate-y-full bg-slate-900 text-white rounded-lg px-3 py-2 shadow-lg whitespace-nowrap"
                  style={{ left: `${((hover + 0.5) / daily.length) * 100}%` }}
                >
                  <p className="text-[11px] text-slate-300">{weekdayLabel(hovered.date)}, {formatDateVN(hovered.date)}</p>
                  <p className="text-sm font-semibold tabular-nums">{hovered.count} lịch hẹn</p>
                </div>
              )}
            </div>

            {/* Trục X */}
            <div className="flex gap-0.5 mt-2">
              {daily.map((d, i) => (
                <div key={d.date} className="flex-1 min-w-0 text-center">
                  {i % labelEvery === 0 && (
                    <span className={`text-[11px] text-slate-400 tabular-nums whitespace-nowrap ${
                      (i / labelEvery) % 2 === 1 ? 'hidden sm:inline' : ''
                    }`}>
                      {formatDateVN(d.date).slice(0, 5)}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setShowTable((v) => !v)}
        className="mt-4 text-xs font-semibold text-teal-600 hover:text-teal-700 cursor-pointer"
      >
        {showTable ? 'Ẩn bảng số liệu' : 'Xem dạng bảng'}
      </button>
      {showTable && (
        <div className="mt-3 max-h-72 overflow-y-auto border border-slate-200 rounded-xl">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-slate-50">
              <tr className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <th className="px-4 py-2 text-left">Ngày hẹn khám</th>
                <th className="px-4 py-2 text-right">Số lịch hẹn</th>
              </tr>
            </thead>
            <tbody>
              {daily.map((d) => (
                <tr key={d.date} className="border-t border-slate-100">
                  <td className="px-4 py-1.5 text-slate-700">{weekdayLabel(d.date)}, {formatDateVN(d.date)}</td>
                  <td className={`px-4 py-1.5 text-right tabular-nums ${d.count ? 'text-slate-800 font-medium' : 'text-slate-400'}`}>{d.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ─── Thành phần nhỏ ─── */

function StatCard({ label, value, hint, dot, highlight }: {
  label: string; value: number; hint?: string; dot?: string; highlight?: boolean;
}) {
  return (
    <div className={`p-5 rounded-2xl border-2 ${highlight ? 'bg-teal-50 border-transparent ring-2 ring-teal-500' : 'bg-white border-slate-200'}`}>
      <p className={`text-3xl font-extrabold tabular-nums ${highlight ? 'text-teal-700' : 'text-slate-800'}`}>{value}</p>
      <p className={`text-sm font-medium mt-0.5 flex items-center gap-1.5 ${highlight ? 'text-teal-700' : 'text-slate-500'}`}>
        {dot && <span className={`w-2 h-2 rounded-full ${dot}`} />}
        {label}
      </p>
      {hint && <p className="text-xs text-teal-600/70 mt-1">{hint}</p>}
    </div>
  );
}

function DateField({ label, value, min, max, onChange }: {
  label: string; value: string; min?: string; max?: string; onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className="block text-xs font-semibold text-slate-600 mb-1">{label}</span>
      <input
        type="date"
        value={value}
        min={min}
        max={max}
        onChange={(e) => onChange(e.target.value)}
        className="bg-white border border-slate-200 focus:border-teal-500 text-slate-900 text-sm rounded-xl p-2.5 outline-none transition-colors"
      />
    </label>
  );
}
