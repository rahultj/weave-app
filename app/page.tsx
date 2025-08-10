'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { ArrowUp } from 'lucide-react';
import { WeaveIcon } from '@/components/landing/WeaveIcon'
import { HeroSection } from '@/components/landing/HeroSection'
import { WhatIsWeaveSection } from '@/components/landing/WhatIsWeaveSection'
import { HowItWorksSection } from '@/components/landing/HowItWorksSection'
import { KeyFeaturesSection } from '@/components/landing/KeyFeaturesSection'
import { BenefitsSection } from '@/components/landing/BenefitsSection'
import { CTASection } from '@/components/landing/CTASection'
import { GetStartedButton } from '@/components/landing/GetStartedButton'
import { MobileNav } from '@/components/landing/MobileNav'

function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      setIsVisible(window.pageYOffset > 300);
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return isVisible ? (
    <button
      onClick={scrollToTop}
      className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 z-40 bg-[#C85A5A] hover:bg-[#B64A4A] text-white p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110"
    >
      <ArrowUp className="w-5 h-5" />
    </button>
  ) : null;
}

export default function LandingPage() {
  return (
          <div className="min-h-screen bg-white">
        {/* Navigation */}
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <WeaveIcon className="w-8 h-8" />
              <span className="text-xl font-semibold text-[#2B2B2B]">weave</span>
            </div>
            
            <div className="hidden md:flex items-center gap-8">
              <a 
                href="#features" 
                className="text-[#6B6B6B] hover:text-[#C85A5A] transition-colors font-medium cursor-pointer"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Features
              </a>
              <a 
                href="#how-it-works" 
                className="text-[#6B6B6B] hover:text-[#C85A5A] transition-colors font-medium cursor-pointer"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                How it works
              </a>
              <a 
                href="#benefits" 
                className="text-[#6B6B6B] hover:text-[#C85A5A] transition-colors font-medium cursor-pointer"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('benefits')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Benefits
              </a>
            </div>

            {/* Desktop CTA */}
            <div className="hidden md:block">
              <GetStartedButton size="small" className="rounded-xl">
                Get Started
              </GetStartedButton>
            </div>

            {/* Mobile menu */}
            <MobileNav />
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main>
        <HeroSection />
        <div id="features">
          <WhatIsWeaveSection />
        </div>
        <div id="how-it-works">
          <HowItWorksSection />
        </div>
        <KeyFeaturesSection />
        <div id="benefits">
          <BenefitsSection />
        </div>
        <CTASection />
      </main>

      {/* Scroll to top button */}
      <ScrollToTop />
    </div>
  )
}