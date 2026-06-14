const FEATURES = [
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: 'Bác sĩ được chứng nhận',
    desc: 'Tất cả bác sĩ đều có chứng chỉ hành nghề và được kiểm tra lý lịch.',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: 'Đặt lịch trong 2 phút',
    desc: 'Không cần gọi điện. Chọn khung giờ và xác nhận ngay lập tức.',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
    title: 'Bảo mật & Riêng tư',
    desc: 'Dữ liệu sức khỏe của bạn được mã hóa và không chia sẻ với bên thứ ba.',
  },
];

export default function HeroSection() {
  return (
    <>
      {/* Hero */}
      <section className="bg-linear-to-br from-teal-700 to-teal-900 py-28 md:py-36 text-white text-center">
        <div className="max-w-3xl mx-auto px-6">
          <span className="inline-block bg-white/10 text-white/90 text-xs font-semibold px-4 py-1.5 rounded-full mb-8 uppercase tracking-widest">
            Chăm sóc sức khỏe hiện đại
          </span>
          <h1 className="text-5xl md:text-7xl font-extrabold leading-none tracking-tight mb-6">
            Sức khỏe của bạn,<br />
            <span className="text-teal-300">đơn giản hóa.</span>
          </h1>
          <p className="text-lg text-white/65 max-w-xl mx-auto mb-10 leading-relaxed">
            Không cần chờ đợi. Đặt lịch tư vấn với các chuyên gia hàng đầu của chúng tôi trong vòng chưa đầy hai phút, từ bất kỳ đâu.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <a
              href="#booking"
              className="bg-white text-teal-700 px-8 py-3.5 rounded-full font-semibold hover:bg-teal-50 transition-colors shadow-lg no-underline"
            >
              Đặt lịch khám
            </a>
            <a
              href="#services"
              className="border border-white/25 text-white px-8 py-3.5 rounded-full font-semibold hover:bg-white/10 transition-colors no-underline"
            >
              Tìm hiểu thêm
            </a>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 mt-20 pt-12 border-t border-white/10 max-w-lg mx-auto">
            {[
              { value: '5+',   label: 'Chuyên gia' },
              { value: '1k+',  label: 'Bệnh nhân' },
              { value: '4.9★', label: 'Đánh giá TB' },
            ].map(({ value, label }) => (
              <div key={label}>
                <p className="text-3xl font-extrabold">{value}</p>
                <p className="text-white/50 text-xs mt-1 uppercase tracking-wider">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature strip */}
      <div className="bg-slate-50 border-b border-slate-200 py-12">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
          {FEATURES.map(({ icon, title, desc }) => (
            <div key={title} className="flex items-start gap-4">
              <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center text-teal-600 shrink-0">
                {icon}
              </div>
              <div>
                <p className="font-semibold text-slate-900">{title}</p>
                <p className="text-sm text-slate-500 mt-0.5 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
