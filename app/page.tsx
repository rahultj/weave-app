'use client'

import { useState, useEffect } from 'react'
import SignInModal from '@/components/SignInModal'
import { AuthProvider } from '@/contexts/AuthContext'

function LandingPageContent() {
  const [scrolled, setScrolled] = useState(false)
  const [showSignIn, setShowSignIn] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#2A2A2A] font-sans overflow-x-hidden">
      {/* Texture overlay */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-[0.03] z-[1000]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
        }}
      />

      {/* Navigation */}
      <nav 
        className={`fixed top-0 left-0 right-0 py-5 z-50 transition-all duration-300 ${
          scrolled 
            ? 'bg-[#FAF8F5]/90 backdrop-blur-lg border-b border-[#E0DCD4]' 
            : 'bg-[#FAF8F5]/90 backdrop-blur-lg border-b border-transparent'
        }`}
      >
        <div className="max-w-[1200px] mx-auto px-6 flex justify-between items-center">
          <a href="#" className="font-serif text-[26px] font-medium text-[#2A2A2A] tracking-tight" style={{ fontFamily: 'var(--font-cormorant)' }}>
            weave
          </a>
          <button 
            onClick={() => setShowSignIn(true)}
            className="bg-[#2A2A2A] text-[#FAF8F5] px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-[#4A4A4A] transition-all hover:-translate-y-0.5"
          >
            Begin your journal
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="min-h-screen flex items-center justify-center text-center px-6 pt-[120px] pb-20">
        <div className="max-w-[720px]">
          <div 
            className="inline-flex items-center gap-2 bg-[#C9A227]/10 border border-[#C9A227]/20 px-4 py-2 rounded-full text-[13px] text-[#A8861E] mb-8 animate-float"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
            A cultural journal
          </div>
          
          <h1 
            className="text-[clamp(48px,8vw,72px)] font-normal leading-[1.1] tracking-tight mb-6"
            style={{ fontFamily: 'var(--font-cormorant)' }}
          >
            A journal for everything that <em className="italic text-[#A8861E]">moves</em> you
          </h1>
          
          <p className="text-xl text-[#4A4A4A] max-w-[520px] mx-auto mb-10 leading-relaxed">
            Reflect on the books, films, and music that stay with you. 
            Learn their histories, influences, and hidden depths. Discover why certain works shape how you see the world.
          </p>
          
          <button 
            onClick={() => setShowSignIn(true)}
            className="inline-flex items-center gap-2.5 bg-[#C9A227] text-white px-8 py-4 rounded-xl text-base font-medium hover:bg-[#A8861E] transition-all hover:-translate-y-0.5 shadow-[0_4px_20px_rgba(201,162,39,0.3)] hover:shadow-[0_6px_24px_rgba(201,162,39,0.35)] group"
          >
            Start reflecting
            <svg className="w-[18px] h-[18px] transition-transform group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </button>
        </div>
      </section>

      {/* The Idea */}
      <section className="py-[120px] px-6 bg-gradient-to-b from-[#FAF8F5] to-[#F5F2ED]">
        <div className="max-w-[680px] mx-auto text-center">
          <div className="text-xs tracking-[0.15em] uppercase text-[#C9A227] mb-6 font-medium">
            The idea
          </div>
          <h2 
            className="text-[clamp(28px,4vw,36px)] font-normal leading-[1.4] mb-8"
            style={{ fontFamily: 'var(--font-cormorant)' }}
          >
            Some things don&apos;t just entertain you. They change you.
          </h2>
          <div className="text-[17px] text-[#4A4A4A] leading-relaxed space-y-5">
            <p>
              A novel that rewired how you think about love. An album that became the soundtrack to a difficult year. A film that gave you language for something you&apos;d always felt but never named.
            </p>
            <p>
              Weave is a space to hold these moments, and to go deeper. Explore the influences behind a work, the historical moment that shaped it, the artistic lineage it belongs to. Understanding where something comes from often reveals why it resonates.
            </p>
            <p>
              It&apos;s not about cataloging or rating. It&apos;s about tracing the thread between what moves you, what it carries, and who you&apos;re becoming.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-[120px] px-6 bg-[#F5F2ED]">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-20">
            <div className="text-xs tracking-[0.15em] uppercase text-[#C9A227] mb-4 font-medium">
              How it works
            </div>
            <h2 
              className="text-[clamp(32px,5vw,42px)] font-normal"
              style={{ fontFamily: 'var(--font-cormorant)' }}
            >
              Three moments of discovery
            </h2>
          </div>
          
          <div className="relative max-w-[1000px] mx-auto">
            {/* Connecting line (desktop only) */}
            <div className="hidden md:block absolute top-9 left-[calc(16.66%+36px)] right-[calc(16.66%+36px)] h-px bg-gradient-to-r from-transparent via-[#E0DCD4] to-transparent" />
            
            <div className="grid md:grid-cols-3 gap-12 md:gap-12">
              {[
                { icon: '✦', num: 'One', title: 'Reflect & learn', desc: 'Explore a work through conversation. Bobbin helps you articulate what moved you, and illuminates the influences, history, and craft behind it.' },
                { icon: '◇', num: 'Two', title: 'Discover patterns', desc: 'Over time, threads emerge. Themes you\'re drawn to. Ideas that keep appearing. A map of your inner landscape.' },
                { icon: '→', num: 'Three', title: 'Find what\'s next', desc: 'New works surface from your patterns. Not from an algorithm, but from the shape of your own curiosity.' }
              ].map((step, i) => (
                <div key={i} className="text-center">
                  <div className="w-[72px] h-[72px] rounded-full bg-[#FAF8F5] border border-[#E0DCD4] flex items-center justify-center mx-auto mb-6 text-[28px] text-[#C9A227] shadow-[0_4px_20px_rgba(0,0,0,0.04)]" style={{ fontFamily: 'var(--font-cormorant)' }}>
                    {step.icon}
                  </div>
                  <div className="text-[11px] tracking-[0.1em] uppercase text-[#8B8578] mb-3">
                    {step.num}
                  </div>
                  <h3 className="text-2xl font-medium mb-3" style={{ fontFamily: 'var(--font-cormorant)' }}>
                    {step.title}
                  </h3>
                  <p className="text-[15px] text-[#4A4A4A] leading-relaxed max-w-[280px] mx-auto">
                    {step.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features + Vignettes */}
      <section className="py-[120px] px-6 bg-[#FAF8F5]">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-20">
            <div className="text-xs tracking-[0.15em] uppercase text-[#C9A227] mb-4 font-medium">
              What you&apos;ll do
            </div>
            <h2 
              className="text-[clamp(32px,5vw,42px)] font-normal"
              style={{ fontFamily: 'var(--font-cormorant)' }}
            >
              Reflect. Learn. Discover.
            </h2>
          </div>

          {/* Feature 1: Reflect with Bobbin */}
          <div className="grid md:grid-cols-2 gap-12 items-center max-w-[1000px] mx-auto mb-20">
            <div className="py-5">
              <div className="text-[11px] tracking-[0.12em] uppercase font-medium text-[#C9A227] mb-3">Reflect</div>
              <h3 className="text-[28px] font-medium mb-3.5 leading-tight" style={{ fontFamily: 'var(--font-cormorant)' }}>
                Have real conversations about what moves you
              </h3>
              <p className="text-base text-[#4A4A4A] leading-relaxed">
                Bobbin asks the questions that help you articulate why something resonates, and teaches you about the influences, techniques, and stories behind the work.
              </p>
            </div>
            <div className="bg-[#F5F2ED] border border-[#E0DCD4] rounded-2xl p-6 shadow-[0_8px_32px_rgba(0,0,0,0.04)]">
              <div className="text-[10px] tracking-[0.1em] uppercase text-[#8B8578] mb-4 pb-3 border-b border-[#E0DCD4]">
                Conversation with Bobbin
              </div>
              <div className="space-y-3">
                <div className="flex gap-2.5 items-start flex-row-reverse">
                  <div className="w-7 h-7 rounded-full bg-[#1E3A5F] text-white flex items-center justify-center text-[11px] font-medium flex-shrink-0">R</div>
                  <div className="bg-[#2A2A2A] text-white px-3.5 py-3 rounded-[14px] rounded-br-[4px] text-[13px] leading-relaxed max-w-[85%]">
                    What influenced Rosalía&apos;s sound on this?
                  </div>
                </div>
                <div className="flex gap-2.5 items-start">
                  <div className="w-7 h-7 rounded-full bg-[#2A2A2A] text-white flex items-center justify-center text-[11px] font-medium flex-shrink-0">B</div>
                  <div className="bg-[#FAF8F5] border border-[#E0DCD4] px-3.5 py-3 rounded-[14px] rounded-bl-[4px] text-[13px] leading-relaxed max-w-[85%]">
                    She draws from flamenco&apos;s emotional intensity, think Camarón de la Isla, but filters it through hyperpop production like Arca. What draws you to that fusion?
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Feature 2: Your Journal */}
          <div className="grid md:grid-cols-2 gap-12 items-center max-w-[1000px] mx-auto mb-20">
            <div className="py-5 md:order-2">
              <div className="text-[11px] tracking-[0.12em] uppercase font-medium text-[#1E3A5F] mb-3">Capture</div>
              <h3 className="text-[28px] font-medium mb-3.5 leading-tight" style={{ fontFamily: 'var(--font-cormorant)' }}>
                Your insights, not just metadata
              </h3>
              <p className="text-base text-[#4A4A4A] leading-relaxed">
                Each journal entry holds your personal reflection from the moment of discovery. What you felt, what you learned, why it matters to you.
              </p>
            </div>
            <div className="bg-[#F5F2ED] border border-[#E0DCD4] rounded-2xl p-6 shadow-[0_8px_32px_rgba(0,0,0,0.04)] md:order-1">
              <div className="text-[10px] tracking-[0.1em] uppercase text-[#8B8578] mb-4 pb-3 border-b border-[#E0DCD4]">
                Journal entry
              </div>
              <div className="space-y-4">
                {[
                  { color: 'bg-gradient-to-br from-[#A4243B] to-[#7A1A2B]', title: 'MOTOMAMI', meta: 'Rosalía · Album · 2022', insight: '"Experimental blend that challenges genre boundaries while remaining deeply personal"' },
                  { color: 'bg-gradient-to-br from-[#1E3A5F] to-[#152A45]', title: 'The Dispossessed', meta: 'Ursula K. Le Guin · Novel · 1974', insight: '"Utopia as a question, not an answer"' }
                ].map((item, i) => (
                  <div key={i} className="flex gap-3.5">
                    <div className={`w-14 h-[72px] rounded-md flex-shrink-0 ${item.color}`} />
                    <div>
                      <h4 className="text-[17px] font-medium mb-0.5" style={{ fontFamily: 'var(--font-cormorant)' }}>{item.title}</h4>
                      <div className="text-xs text-[#8B8578] mb-2.5">{item.meta}</div>
                      <div className="text-[13px] italic text-[#4A4A4A] leading-relaxed">{item.insight}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Feature 3: Pattern Discovery */}
          <div className="grid md:grid-cols-2 gap-12 items-center max-w-[1000px] mx-auto mb-20">
            <div className="py-5">
              <div className="text-[11px] tracking-[0.12em] uppercase font-medium text-[#2D6A4F] mb-3">Patterns</div>
              <h3 className="text-[28px] font-medium mb-3.5 leading-tight" style={{ fontFamily: 'var(--font-cormorant)' }}>
                See connections you hadn&apos;t noticed
              </h3>
              <p className="text-base text-[#4A4A4A] leading-relaxed">
                Over time, threads emerge across your journal. Themes you&apos;re drawn to. Ideas that keep appearing. A map of your inner landscape.
              </p>
            </div>
            <div className="bg-[#F5F2ED] border border-[#E0DCD4] rounded-2xl p-6 shadow-[0_8px_32px_rgba(0,0,0,0.04)]">
              <div className="text-[10px] tracking-[0.1em] uppercase text-[#8B8578] mb-4 pb-3 border-b border-[#E0DCD4]">
                Pattern discovered
              </div>
              <div className="text-center">
                <div className="text-xl text-[#C9A227] mb-3.5">✦</div>
                <h4 className="text-[18px] font-normal leading-snug mb-4" style={{ fontFamily: 'var(--font-cormorant)' }}>
                  You&apos;re drawn to works that challenge conventions while honoring tradition
                </h4>
                <div className="flex flex-wrap gap-2 justify-center">
                  {['MOTOMAMI', 'The Dispossessed', 'In the Mood for Love'].map((tag, i) => (
                    <span key={i} className="text-[11px] px-3 py-1.5 bg-[#C9A227]/10 rounded-full text-[#A8861E]">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Feature 4: Guided Discovery */}
          <div className="grid md:grid-cols-2 gap-12 items-center max-w-[1000px] mx-auto">
            <div className="py-5 md:order-2">
              <div className="text-[11px] tracking-[0.12em] uppercase font-medium text-[#A4243B] mb-3">Discover</div>
              <h3 className="text-[28px] font-medium mb-3.5 leading-tight" style={{ fontFamily: 'var(--font-cormorant)' }}>
                Find what&apos;s next, from your patterns
              </h3>
              <p className="text-base text-[#4A4A4A] leading-relaxed">
                New recommendations emerge from the shape of your curiosity. Works that feel meant for you, not served by an algorithm.
              </p>
            </div>
            <div className="bg-[#F5F2ED] border border-[#E0DCD4] rounded-2xl p-6 shadow-[0_8px_32px_rgba(0,0,0,0.04)] md:order-1">
              <div className="text-[10px] tracking-[0.1em] uppercase text-[#8B8578] mb-4 pb-3 border-b border-[#E0DCD4]">
                Suggested for you
              </div>
              <h4 className="text-[15px] text-[#8B8578] mb-3.5" style={{ fontFamily: 'var(--font-cormorant)' }}>
                Based on your interest in tradition-breaking artists:
              </h4>
              <div className="space-y-3">
                {[
                  { color: 'bg-gradient-to-br from-[#2D6A4F] to-[#1E4D38]', title: 'Blonde', meta: 'Frank Ocean · Album' },
                  { color: 'bg-gradient-to-br from-[#1E3A5F] to-[#152A45]', title: 'The Left Hand of Darkness', meta: 'Ursula K. Le Guin · Novel' }
                ].map((item, i) => (
                  <div key={i} className="flex gap-3 items-center">
                    <div className={`w-11 h-11 rounded-md flex-shrink-0 ${item.color}`} />
                    <div>
                      <h5 className="text-sm font-medium mb-0.5">{item.title}</h5>
                      <span className="text-xs text-[#8B8578]">{item.meta}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="text-xs text-[#A8861E] mt-3 pt-3 border-t border-[#E0DCD4] italic">
                Because you love genre-defying work with emotional depth
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-[140px] px-6 bg-[#2A2A2A] text-center relative overflow-hidden">
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
          }}
        />
        <div className="relative max-w-[600px] mx-auto">
          <h2 
            className="text-[clamp(36px,6vw,52px)] font-normal text-[#FAF8F5] mb-5 leading-tight"
            style={{ fontFamily: 'var(--font-cormorant)' }}
          >
            Begin your journal
          </h2>
          <p className="text-lg text-[#FAF8F5]/70 mb-10 leading-relaxed">
            Start with anything that moved you recently. A book, an album, a film. 
            Let the conversation unfold from there.
          </p>
          <button 
            onClick={() => setShowSignIn(true)}
            className="inline-flex items-center gap-2.5 bg-[#C9A227] text-white px-9 py-[18px] rounded-xl text-[17px] font-medium hover:bg-[#D4B84A] transition-all hover:-translate-y-0.5 shadow-[0_4px_24px_rgba(201,162,39,0.4)] hover:shadow-[0_6px_28px_rgba(201,162,39,0.5)]"
          >
            Start reflecting
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#2A2A2A] border-t border-[#FAF8F5]/10 py-10 text-center">
        <a href="#" className="text-[#FAF8F5]/80 text-[26px] font-medium inline-block mb-4" style={{ fontFamily: 'var(--font-cormorant)' }}>
          weave
        </a>
        <p className="text-[13px] text-[#FAF8F5]/40">
          A cultural journal for everything that moves you
        </p>
      </footer>

      {/* Sign In Modal */}
      <SignInModal isOpen={showSignIn} onClose={() => setShowSignIn(false)} />

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}

// Wrap with AuthProvider
export default function LandingPage() {
  return (
    <AuthProvider>
      <LandingPageContent />
    </AuthProvider>
  )
}
