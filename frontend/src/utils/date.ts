import axios from 'axios';

/** Múi giờ thống nhất của ứng dụng (khớp với app.timezone ở backend). */
export const APP_TIME_ZONE = 'Asia/Ho_Chi_Minh';

/** Ngày/giờ hiện tại theo múi giờ ứng dụng: { date: 'YYYY-MM-DD', time: 'HH:mm' }. */
export function nowInAppTz(): { date: string; time: string } {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: APP_TIME_ZONE,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).formatToParts(new Date());
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '00';
  return { date: `${get('year')}-${get('month')}-${get('day')}`, time: `${get('hour')}:${get('minute')}` };
}

export const todayInAppTz = () => nowInAppTz().date;

/** 'YYYY-MM-DD' → 'dd/MM/yyyy' */
export function formatDateVN(iso: string) {
  const [y, m, d] = iso.split('-');
  return y && m && d ? `${d}/${m}/${y}` : iso;
}

/** 'HH:mm:ss' | 'HH:mm' → 'HH:mm' */
export const formatTime = (t: string) => t.substring(0, 5);

const WEEKDAYS = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];

const toUtc = (iso: string) => new Date(`${iso}T00:00:00Z`);

export const weekdayLabel = (iso: string) => WEEKDAYS[toUtc(iso).getUTCDay()];

export const addDays = (iso: string, n: number) => {
  const d = toUtc(iso);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
};

/** Số ngày trong khoảng [from, to], tính cả hai đầu. */
export const daysInclusive = (from: string, to: string) =>
  Math.round((toUtc(to).getTime() - toUtc(from).getTime()) / 86_400_000) + 1;

/** Lịch hẹn còn chưa đến giờ khám (theo múi giờ ứng dụng)? */
export function isUpcoming(date: string, time: string) {
  const now = nowInAppTz();
  return `${date}T${formatTime(time)}` > `${now.date}T${now.time}`;
}

/** Lấy thông điệp lỗi cụ thể do backend trả về ({ error }) hoặc dùng thông điệp mặc định. */
export function apiErrorMessage(err: unknown, fallback: string): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as Record<string, string> | undefined;
    if (data?.error) return data.error;
    if (data && typeof data === 'object') {
      const first = Object.values(data).find((v) => typeof v === 'string');
      if (first) return first;
    }
    if (err.response?.status === 401 || err.response?.status === 403) {
      return 'Phiên đăng nhập đã hết hạn hoặc bạn không có quyền. Vui lòng đăng nhập lại.';
    }
    if (!err.response) return 'Không kết nối được máy chủ. Vui lòng thử lại.';
  }
  return fallback;
}
