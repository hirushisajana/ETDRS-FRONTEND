import { useNavigate } from 'react-router-dom'
import {
  ShieldCheck,
  GitBranch,
  BadgeCheck,
  Globe,
  ArrowRight,
  Lock,
  Clock,
  Users,
  Sparkles,
} from 'lucide-react'
import nationalEmblem from '../../../images/national.png'
import rgdLogo from '../../../images/RGD.png'

const features = [
  {
    icon: ShieldCheck,
    title: 'Secure Trust Registration',
    description:
      'Electronic registration of trust deeds under Chapter 87 of the Sri Lanka Trust Ordinance.',
    accent: 'from-blue-600 to-blue-500',
  },
  {
    icon: GitBranch,
    title: 'Folio Chain Tracking',
    description:
      'Maintain an unbroken chain of title for every trust folio from creation to the latest entry.',
    accent: 'from-cyan-500 to-teal-400',
  },
  {
    icon: BadgeCheck,
    title: 'Digital Certificates',
    description:
      'Issue and verify trust certificates online, replacing paper-based documentation.',
    accent: 'from-emerald-500 to-lime-400',
  },
  {
    icon: Globe,
    title: '24/7 Public Portal',
    description:
      'Trustees, beneficiaries and parties can access trust details and registrations at any time.',
    accent: 'from-violet-500 to-purple-400',
  },
]

const trustBadges = [
  { icon: Lock, label: 'Encrypted & Secure' },
  { icon: Clock, label: 'Fast Digital Service' },
  { icon: Users, label: 'Serving the Public' },
]

export default function LandingPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-900 antialiased">

      {/* ═══ NAVBAR ═══ */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/60 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <a href="#" className="flex items-center gap-2.5">
            <span className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 text-white shadow-lg shadow-blue-500/30">
              <span className="text-sm font-black tracking-tight">eT</span>
            </span>
            <span className="text-base font-bold tracking-tight text-white">
              e-Trust<span className="text-blue-400">.</span>
            </span>
          </a>

          <nav className="hidden items-center gap-8 md:flex">
            <a href="#about" className="text-sm font-medium text-slate-300 transition-colors hover:text-white">
              About
            </a>
            <a href="#access" className="text-sm font-medium text-slate-300 transition-colors hover:text-white">
              Access
            </a>
            <a href="#contact" className="text-sm font-medium text-slate-300 transition-colors hover:text-white">
              Contact
            </a>
          </nav>

          <button
            onClick={() => navigate('/login')}
            className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-lg shadow-black/20 transition-all hover:bg-blue-50 active:scale-[0.98]"
          >
            Sign In
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* ═══ HERO ═══ */}
      <section className="relative overflow-hidden bg-slate-950">
        {/* Ambient glows */}
        <div className="pointer-events-none absolute -left-32 -top-40 h-[28rem] w-[28rem] rounded-full bg-blue-600/30 blur-3xl" />
        <div className="pointer-events-none absolute -right-24 top-1/4 h-96 w-96 rounded-full bg-cyan-500/20 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-indigo-500/20 blur-3xl" />

        {/* Grid pattern */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage:
              'linear-gradient(to right, rgba(148,163,184,0.25) 1px, transparent 1px), linear-gradient(to bottom, rgba(148,163,184,0.25) 1px, transparent 1px)',
            backgroundSize: '56px 56px',
          }}
        />

        <div className="relative mx-auto grid max-w-7xl items-center gap-16 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-28">
          {/* Left: headline + CTAs */}
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-blue-400/30 bg-blue-400/10 px-4 py-1.5 text-xs font-semibold text-blue-200">
              <Sparkles className="h-3.5 w-3.5" />
              Official Registrar General's Platform
            </span>

            <h1 className="mt-6 text-4xl font-black leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-6xl">
              Electronic Trust
              <span className="block bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-400 bg-clip-text text-transparent">
                Registration System
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-base leading-relaxed text-slate-300 sm:text-lg">
              Digitising the registration, management and verification of trust deeds across
              Sri Lanka — faster, fully verified and more transparent than ever.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-4">
              <button
                onClick={() => navigate('/register')}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 px-6 py-3 text-sm font-semibold text-white shadow-xl shadow-blue-600/30 transition-all hover:from-blue-500 hover:to-blue-400 active:scale-[0.98]"
              >
                Public Portal
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                onClick={() => navigate('/login')}
                className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-white backdrop-blur transition-all hover:bg-white/10 active:scale-[0.98]"
              >
                Internal Staff Login
              </button>
            </div>

            {/* Trust badges */}
            <div className="mt-12 flex flex-wrap items-center gap-x-8 gap-y-4">
              {trustBadges.map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2 text-sm text-slate-400">
                  <Icon className="h-4 w-4 text-blue-400" />
                  {label}
                </div>
              ))}
            </div>
          </div>

          {/* Right: emblem panel */}
          <div className="relative mx-auto w-full max-w-md">
            <div className="absolute -inset-3 rounded-[2rem] bg-gradient-to-tr from-blue-600/40 to-cyan-400/20 blur-2xl" />
            <div className="relative rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl sm:p-10">
              {/* Logos */}
              <div className="flex items-center justify-center gap-6">
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white shadow-xl ring-1 ring-slate-900/5 sm:h-24 sm:w-24">
                  <img src={nationalEmblem} alt="National Emblem of Sri Lanka" className="h-14 w-auto object-contain mix-blend-multiply sm:h-16" />
                </div>
                <span className="h-px w-8 bg-white/20 sm:w-12" />
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white shadow-xl ring-1 ring-slate-900/5 sm:h-24 sm:w-24">
                  <img src={rgdLogo} alt="Registrar General's Department Logo" className="h-14 w-auto object-contain sm:h-16" />
                </div>
              </div>

              <p className="mt-8 text-center text-[10px] font-semibold tracking-[0.3em] text-blue-200/90 sm:text-[11px]">
                DEMOCRATIC SOCIALIST REPUBLIC OF SRI LANKA
              </p>
              <div className="mx-auto mt-4 h-px w-28 bg-gradient-to-r from-transparent via-blue-300/50 to-transparent" />
              <h2 className="mt-5 text-center text-xl font-bold leading-tight text-white sm:text-2xl">
                Registrar General's Department
              </h2>
              <p className="mt-2.5 text-center text-sm font-light tracking-wide text-blue-100/70">
                Electronic Trust Registration System
              </p>
            </div>
          </div>
        </div>

        {/* Bottom fade into page */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-slate-50 to-transparent" />
      </section>

      {/* ═══ ACCESS CARDS ═══ */}
      <section id="access" className="bg-slate-50">
        <div className="mx-auto max-w-5xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="text-center">
            <span className="text-xs font-bold uppercase tracking-[0.25em] text-blue-700">
              Two Ways In
            </span>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Choose how you access the system
            </h2>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {/* Staff Login */}
            <div
              onClick={() => navigate('/login')}
              className="group cursor-pointer overflow-hidden rounded-3xl border border-slate-200 bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-900/5"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-700 transition-colors group-hover:bg-blue-100">
                  <Lock className="h-7 w-7" />
                </div>
                <ArrowRight className="h-5 w-5 text-slate-300 transition-all group-hover:translate-x-1 group-hover:text-blue-700" />
              </div>
              <h3 className="mt-6 text-xl font-bold text-slate-900">Internal Staff Login</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">
                For authorised land registry staff and head office personnel. Access by
                invitation only — no self-registration.
              </p>
              <button className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-blue-700">
                Go to Staff Login
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            {/* Public Portal */}
            <div
              onClick={() => navigate('/register')}
              className="group cursor-pointer overflow-hidden rounded-3xl border border-slate-200 bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-900/5"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-700 transition-colors group-hover:bg-blue-100">
                  <Globe className="h-7 w-7" />
                </div>
                <ArrowRight className="h-5 w-5 text-slate-300 transition-all group-hover:translate-x-1 group-hover:text-blue-700" />
              </div>
              <h3 className="mt-6 text-xl font-bold text-slate-900">Public Portal</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">
                For trust parties, beneficiaries and trustees. Register or sign in to view
                your trust details and certificates.
              </p>
              <button className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-blue-700">
                Register or Sign In
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ FEATURES ═══ */}
      <section id="about" className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
            <div>
              <span className="text-xs font-bold uppercase tracking-[0.25em] text-blue-700">
                About the System
              </span>
              <h2 className="mt-3 max-w-xl text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                Everything you expect, nothing you don't
              </h2>
            </div>
            <p className="max-w-sm text-sm leading-relaxed text-slate-500">
              A purpose-built platform for the Registrar General's Department, engineered
              for reliability, transparency and ease of use.
            </p>
          </div>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map(({ icon: Icon, title, description, accent }) => (
              <div
                key={title}
                className="group rounded-3xl border border-slate-200 bg-slate-50 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-slate-300 hover:bg-white hover:shadow-xl hover:shadow-slate-900/5"
              >
                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${accent} text-white shadow-lg`}>
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mt-5 text-base font-bold text-slate-900">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CTA BAND ═══ */}
      <section className="bg-slate-950">
        <div className="relative overflow-hidden">
          <div className="pointer-events-none absolute -left-20 -top-24 h-72 w-72 rounded-full bg-blue-600/30 blur-3xl" />
          <div className="pointer-events-none absolute -right-20 -bottom-24 h-72 w-72 rounded-full bg-cyan-500/20 blur-3xl" />
          <div className="relative mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Ready to get started?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-slate-300 sm:text-base">
              Access your trust records through the public portal, or sign in to the
              internal system as an authorised staff member.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <button
                onClick={() => navigate('/register')}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 px-6 py-3 text-sm font-semibold text-white shadow-xl shadow-blue-600/30 transition-all hover:from-blue-500 hover:to-blue-400 active:scale-[0.98]"
              >
                Open Public Portal
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                onClick={() => navigate('/login')}
                className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-white backdrop-blur transition-all hover:bg-white/10 active:scale-[0.98]"
              >
                Staff Sign In
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer id="contact" className="border-t border-white/10 bg-slate-950">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {/* Brand */}
            <div className="sm:col-span-2 lg:col-span-1">
              <div className="flex items-center gap-2">
                <img src={nationalEmblem} alt="" className="h-8 w-auto opacity-90 mix-blend-screen" />
                <span className="text-slate-500 text-lg font-thin">|</span>
                <img src={rgdLogo} alt="" className="h-8 w-auto opacity-90 mix-blend-screen" />
              </div>
              <p className="mt-4 text-sm font-semibold text-white">Registrar General's Department</p>
              <p className="mt-1 text-xs leading-relaxed text-slate-400">
                Ministry of Public Administration, Sri Lanka
              </p>
              <p className="mt-4 text-xs leading-relaxed italic text-slate-500">
                "Facilitating the registration of trust deeds under Chapter 87 of the Sri
                Lanka Trust Ordinance."
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-white">
                Quick Links
              </h3>
              <ul className="mt-4 space-y-2.5">
                {['About the Department', 'Trust Ordinance — Chapter 87', 'Find Your Land Registry', 'FAQs'].map((item) => (
                  <li key={item}>
                    <a href="#" className="text-sm text-slate-400 transition-colors hover:text-white">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-white">Contact</h3>
              <ul className="mt-4 space-y-3 text-sm text-slate-400">
                <li>+94 11 234 5678</li>
                <li>registrar@rgd.gov.lk</li>
                <li>
                  No. 123, Bauddhaloka Mawatha,
                  <br />
                  Colombo 07, Sri Lanka
                </li>
              </ul>
            </div>

            {/* Help */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-white">Help</h3>
              <ul className="mt-4 space-y-2.5">
                {['Report a Technical Issue', 'Data Protection Notice', 'Accessibility Statement'].map((item) => (
                  <li key={item}>
                    <a href="#" className="text-sm text-slate-400 transition-colors hover:text-white">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-5 sm:flex-row sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Lock className="h-3.5 w-3.5" />
              Secure .gov.lk connection
            </div>
            <p className="text-xs text-slate-500">
              &copy; {new Date().getFullYear()} Registrar General's Department. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              {['Privacy Policy', 'Terms of Use', 'Sitemap'].map((label) => (
                <a key={label} href="#" className="text-xs text-slate-500 transition-colors hover:text-white">
                  {label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}