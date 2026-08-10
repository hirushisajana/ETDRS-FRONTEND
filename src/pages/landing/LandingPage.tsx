import { useNavigate } from 'react-router-dom'

const footerLinks = [
  { label: 'Privacy Policy', href: '#' },
  { label: 'Terms of Use', href: '#' },
  { label: 'Sitemap', href: '#' },
]

export default function LandingPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex flex-col bg-maroon-950">

      {/* ═══ NAVBAR ═══ */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/10 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            {/* Brand */}
            <span className="text-white/75 text-sm font-medium tracking-wide">
              Electronic Trust Registration System
            </span>
            {/* Nav links */}
            <div className="flex items-center gap-8">
              {['About', 'Contact', 'Help'].map((label) => (
                <a
                  key={label}
                  href="#"
                  className="text-sm text-white/55 hover:text-white/90 transition-colors"
                >
                  {label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </nav>

      {/* ═══ HERO ═══ */}
      <section className="relative flex-1 flex items-center justify-center bg-gradient-to-b from-maroon-900 via-maroon-950 to-maroon-950 overflow-hidden">
        {/* Subtle pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        <div className="relative z-10 w-full max-w-4xl mx-auto px-4 py-24 text-center">

          {/* Emblems */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="flex items-center justify-center rounded-2xl p-3">
              <img src="/national.jpg?v=2" alt="National Emblem of Sri Lanka" className="h-16 w-auto sm:h-20 mix-blend-multiply brightness-[1.3]" />
            </div>
            <span className="text-maroon-400/30 text-3xl font-thin">|</span>
            <div className="flex items-center justify-center rounded-2xl p-3">
              <img src="/RGD.png" alt="Registrar General's Department Logo" className="h-16 w-auto sm:h-20 mix-blend-multiply brightness-[1.3]" />
            </div>
          </div>

          {/* Republic title */}
          <p className="text-maroon-300/60 text-[10px] sm:text-xs tracking-[0.28em] font-medium mb-8">
            DEMOCRATIC SOCIALIST REPUBLIC OF SRI LANKA
          </p>

          {/* Department title */}
          <div className="mb-3">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight">
              Registrar General's Department
            </h1>
            <p className="text-base sm:text-lg text-maroon-200/70 mt-1.5 font-light tracking-wide">
              Electronic Trust Registration System
            </p>
          </div>

          {/* Divider */}
          <div className="flex items-center justify-center gap-4 my-12">
            <span className="block h-px w-16 bg-maroon-700/30" />
            <span className="text-maroon-500/40 text-base">✦</span>
            <span className="block h-px w-16 bg-maroon-700/30" />
          </div>

          {/* Two Access Cards */}
          <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">

            {/* Staff Login */}
            <div className="group relative bg-white/[0.04] backdrop-blur-sm border border-maroon-700/20 rounded-2xl p-8 text-center transition-all duration-300 hover:bg-white/[0.07] hover:border-maroon-400/40 hover:shadow-[0_0_40px_-8px_rgba(192,168,81,0.12)] hover:-translate-y-0.5">
              <div className="w-14 h-14 mx-auto mb-5 rounded-full bg-maroon-800/50 flex items-center justify-center group-hover:bg-maroon-700/60 transition-colors">
                <svg className="w-7 h-7 text-maroon-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-white mb-2">Internal Staff Login</h2>
              <p className="text-sm text-maroon-200/60 leading-relaxed mb-6">
                For authorised land registry staff and head office personnel.
                <br />
                <span className="text-maroon-300/40 text-xs">Access by invitation only — no self-registration.</span>
              </p>
              <button
                onClick={() => navigate('/login')}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-maroon-700 hover:bg-maroon-600 text-white text-sm font-medium transition-all duration-200 shadow-lg shadow-maroon-900/30 hover:shadow-maroon-700/40 active:scale-[0.98]"
              >
                Go to Staff Login
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </button>
            </div>

            {/* Public Portal */}
            <div className="group relative bg-white/[0.04] backdrop-blur-sm border border-maroon-700/20 rounded-2xl p-8 text-center transition-all duration-300 hover:bg-white/[0.07] hover:border-maroon-400/40 hover:shadow-[0_0_40px_-8px_rgba(192,168,81,0.12)] hover:-translate-y-0.5">
              <div className="w-14 h-14 mx-auto mb-5 rounded-full bg-maroon-800/50 flex items-center justify-center group-hover:bg-maroon-700/60 transition-colors">
                <svg className="w-7 h-7 text-maroon-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm1.294 6.336a6.721 6.721 0 01-3.17.789 6.721 6.721 0 01-3.168-.789 3.376 3.376 0 016.338 0z" />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-white mb-2">Public Portal</h2>
              <p className="text-sm text-maroon-200/60 leading-relaxed mb-6">
                For trust parties, beneficiaries, and trustees.
                <br />
                <span className="text-maroon-300/40 text-xs">Register or sign in to view your trust details and certificates.</span>
              </p>
              <button
                onClick={() => navigate('/register')}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-maroon-700 hover:bg-maroon-600 text-white text-sm font-medium transition-all duration-200 shadow-lg shadow-maroon-900/30 hover:shadow-maroon-700/40 active:scale-[0.98]"
              >
                Register or Sign In
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="bg-maroon-950 border-t border-maroon-800/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

            {/* Brand */}
            <div className="sm:col-span-2 lg:col-span-1">
              <div className="flex items-center gap-2 mb-3">
                <img src="/national.jpg?v=2" alt="" className="h-7 w-auto mix-blend-multiply brightness-[1.3] opacity-90" />
                <span className="text-maroon-400/30 text-lg font-thin">|</span>
                <img src="/RGD.png" alt="" className="h-7 w-auto mix-blend-multiply brightness-[1.3] opacity-90" />
              </div>
              <p className="text-sm font-semibold text-maroon-100">Registrar General's Department</p>
              <p className="text-xs text-maroon-300/50 mt-1 leading-relaxed">
                Ministry of Public Administration, Sri Lanka
              </p>
              <p className="text-xs text-maroon-400/40 mt-3 leading-relaxed italic">
                "Facilitating the registration of trust deeds under Chapter 87 of the Sri Lanka Trust Ordinance."
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-xs font-semibold text-maroon-300 uppercase tracking-wider mb-4">
                Quick Links
              </h3>
              <ul className="space-y-2.5">
                {['About the Department', 'Trust Ordinance — Chapter 87', 'Find Your Land Registry', 'FAQs'].map((item) => (
                  <li key={item}>
                    <a href="#" className="text-sm text-maroon-300/60 hover:text-maroon-100 transition-colors">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="text-xs font-semibold text-maroon-300 uppercase tracking-wider mb-4">
                Contact
              </h3>
              <ul className="space-y-3 text-sm text-maroon-300/60">
                <li className="flex items-start gap-2.5">
                  <svg className="w-4 h-4 mt-0.5 shrink-0 text-maroon-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                  </svg>
                  <span>+94 11 234 5678</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <svg className="w-4 h-4 mt-0.5 shrink-0 text-maroon-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                  </svg>
                  <span>registrar@rgd.gov.lk</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <svg className="w-4 h-4 mt-0.5 shrink-0 text-maroon-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                  </svg>
                  <span>No. 123, Bauddhaloka Mawatha,<br />Colombo 07, Sri Lanka</span>
                </li>
              </ul>
            </div>

            {/* Help */}
            <div>
              <h3 className="text-xs font-semibold text-maroon-300 uppercase tracking-wider mb-4">
                Help
              </h3>
              <ul className="space-y-2.5">
                {['Report a Technical Issue', 'Data Protection Notice', 'Accessibility Statement'].map((item) => (
                  <li key={item}>
                    <a href="#" className="text-sm text-maroon-300/60 hover:text-maroon-100 transition-colors">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-maroon-800/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-maroon-400/40">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
              <span>Secure .gov.lk connection</span>
            </div>
            <p className="text-xs text-maroon-400/40">
              &copy; {new Date().getFullYear()} Registrar General's Department. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              {footerLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-xs text-maroon-400/50 hover:text-maroon-200 transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
