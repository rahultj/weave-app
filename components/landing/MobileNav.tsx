'use client';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { WeaveIcon } from './WeaveIcon';
import { GetStartedButton } from './GetStartedButton';

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { label: 'Features', href: '#features' },
    { label: 'How it works', href: '#how-it-works' },
    { label: 'Benefits', href: '#benefits' },
  ];

  const scrollToSection = (href: string) => {
    setIsOpen(false);
    setTimeout(() => {
      document.getElementById(href.slice(1))?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden p-2 text-[#2B2B2B]"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Mobile menu overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-[#FAF8F5]/95 backdrop-blur-xl md:hidden">
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-[#C85A5A]/10">
              <div className="flex items-center gap-3">
                <WeaveIcon className="w-8 h-8" />
                <span className="text-xl font-semibold text-[#2B2B2B]">weave</span>
              </div>
              <button onClick={() => setIsOpen(false)}>
                <X className="w-6 h-6 text-[#2B2B2B]" />
              </button>
            </div>

            {/* Navigation */}
            <div className="flex-1 px-6 py-8">
              <nav className="space-y-6">
                {navItems.map((item) => (
                  <button
                    key={item.href}
                    onClick={() => scrollToSection(item.href)}
                    className="block w-full text-left text-xl font-medium text-[#2B2B2B] hover:text-[#C85A5A] transition-colors"
                  >
                    {item.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* CTA */}
            <div className="p-6 border-t border-[#C85A5A]/10">
              <GetStartedButton className="w-full">
                Get Started
              </GetStartedButton>
            </div>
          </div>
        </div>
      )}
    </>
  );
}