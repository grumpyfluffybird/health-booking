import { Link, useLocation } from 'react-router-dom';

export default function Navbar() {
  const { pathname } = useLocation();
  const isAdmin = pathname.startsWith('/admin');

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 no-underline">
          <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">+</div>
          <span className="text-xl font-semibold text-slate-900 tracking-tight">Aura Health</span>
        </Link>

        {/* Nav */}
        {!isAdmin ? (
          <nav className="hidden md:flex gap-8 text-sm font-medium text-slate-600 items-center">
            <a href="#services" className="hover:text-teal-600 transition-colors">Dịch vụ</a>
            <a href="#booking" className="hover:text-teal-600 transition-colors">Bác sĩ</a>
            <Link to="/admin/login" className="hover:text-teal-600 transition-colors no-underline">Nhân viên</Link>
          </nav>
        ) : (
          <nav className="flex gap-6 text-sm font-medium text-slate-600 items-center">
            <Link to="/" className="hover:text-teal-600 transition-colors no-underline">← Trang bệnh nhân</Link>
            <span className="text-slate-400">Quản trị</span>
          </nav>
        )}

        {/* CTA */}
        {!isAdmin && (
          <a
            href="#booking"
            className="bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-full text-sm font-semibold transition-colors shadow-sm no-underline"
          >
            Đặt lịch khám
          </a>
        )}
      </div>
    </header>
  );
}
