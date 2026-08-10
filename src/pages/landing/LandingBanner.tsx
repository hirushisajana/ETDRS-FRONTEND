import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import landing1 from '../../../images/landing1.jpg'
import landing2 from '../../../images/landing2.jpg'
import landing3 from '../../../images/landing3.jpg'
import landing4 from '../../../images/landing4.jpg'
import landing5 from '../../../images/landing5.jpg'
import landing6 from '../../../images/landing6.jpg'
import landing7 from '../../../images/landing7.jpg'
import landing8 from '../../../images/landing8.png'
import nationalEmblem from '../../../images/national.png'
import rgdLogo from '../../../images/RGD.png'

const slides = [landing1, landing2, landing3, landing4, landing5, landing6, landing7, landing8]

const AUTOPLAY_INTERVAL = 4000

export default function LandingBanner() {
  const [current, setCurrent] = useState(0)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    if (paused) return
    const id = window.setInterval(() => {
      setCurrent((c) => (c + 1) % slides.length)
    }, AUTOPLAY_INTERVAL)
    return () => window.clearInterval(id)
  }, [paused])

  const goPrev = () => setCurrent((c) => (c - 1 + slides.length) % slides.length)
  const goNext = () => setCurrent((c) => (c + 1) % slides.length)

  return (
    <div
      className="relative h-[55vh] min-h-[320px] w-full overflow-hidden bg-slate-100"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {slides.map((src, index) => (
        <img
          key={src}
          src={src}
          alt={`Landing slide ${index + 1}`}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
            index === current ? 'opacity-100' : 'opacity-0'
          }`}
        />
      ))}

      {/* Overlay gradient for readability */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/30 via-transparent to-slate-950/10" />

      {/* Government branding shape */}
      <div className="pointer-events-none absolute right-6 top-1/2 hidden -translate-y-1/2 lg:block xl:right-10">
        <div className="relative w-[340px] rounded-[30px] border border-white/50 bg-white/90 p-8 shadow-2xl shadow-slate-950/20 backdrop-blur-md ring-1 ring-blue-900/5">
          {/* Decorative arch highlight */}
          <div className="absolute inset-x-10 -top-1 h-1 rounded-full bg-gradient-to-r from-transparent via-blue-700/60 to-transparent" />

          {/* Logos */}
          <div className="mb-6 flex items-center justify-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full border border-blue-900/10 bg-white p-1.5 shadow-sm">
              <img src={nationalEmblem} alt="National Emblem of Sri Lanka" className="h-12 w-auto object-contain mix-blend-multiply" />
            </div>
            <span className="text-slate-300 text-2xl font-thin">|</span>
            <div className="flex h-16 w-16 items-center justify-center rounded-full border border-blue-900/10 bg-white p-1.5 shadow-sm">
              <img src={rgdLogo} alt="Registrar General's Department Logo" className="h-12 w-auto object-contain mix-blend-multiply" />
            </div>
          </div>

          {/* Divider */}
          <div className="mx-auto mb-5 h-px w-28 bg-gradient-to-r from-transparent via-blue-700/40 to-transparent" />

          {/* Text */}
          <p className="text-center text-[10px] font-semibold leading-relaxed tracking-[0.28em] text-slate-600">
            DEMOCRATIC SOCIALIST REPUBLIC OF SRI LANKA
          </p>
          <h2 className="mt-3 text-center text-xl font-bold leading-tight text-slate-900">
            Registrar General's Department
          </h2>
          <p className="mt-2 text-center text-sm font-light tracking-wide text-slate-500">
            Electronic Trust Registration System
          </p>
        </div>
      </div>

      {/* Prev / Next arrows */}
      <button
        onClick={goPrev}
        aria-label="Previous slide"
        className="absolute left-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/80 text-slate-700 shadow-md backdrop-blur-sm transition-colors hover:bg-white hover:text-blue-700"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        onClick={goNext}
        aria-label="Next slide"
        className="absolute right-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/80 text-slate-700 shadow-md backdrop-blur-sm transition-colors hover:bg-white hover:text-blue-700"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrent(index)}
            aria-label={`Go to slide ${index + 1}`}
            className={`h-2.5 rounded-full transition-all duration-300 ${
              index === current ? 'w-8 bg-white' : 'w-2.5 bg-white/50 hover:bg-white/80'
            }`}
          />
        ))}
      </div>
    </div>
  )
}