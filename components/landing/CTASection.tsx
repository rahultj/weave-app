'use client';
import { useState } from 'react';
import { Download, Globe, Check } from 'lucide-react';
import { WeaveIcon } from './WeaveIcon';
import { GetStartedButton } from './GetStartedButton';

export function CTASection() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    
    // Simulate API call - replace with your actual signup logic
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsSubmitted(true);
      setEmail('');
    } catch (error) {
      console.error('Signup error:', error);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <section className="py-24 px-6">
      <div className="max-w-4xl mx-auto text-center">
        <div className="space-y-8">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-[#2B2B2B] px-4">
            Ready to start your<br className="hidden sm:block" />
            <span className="sm:hidden"> </span>cultural journal?
          </h2>
          
          <p className="text-lg sm:text-xl text-[#6B6B6B] max-w-2xl mx-auto px-4">
            Join thousands of cultural explorers discovering deeper meaning in their interests
          </p>

          {/* Email Signup */}
          <div className="bg-[#F7F5F1] rounded-2xl p-8 max-w-md mx-auto">
            {isSubmitted ? (
              <div className="space-y-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <Check className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-[#2B2B2B]">Thanks for signing up!</p>
                  <p className="text-sm text-[#6B6B6B]">We'll be in touch soon.</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleEmailSignup} className="space-y-4">
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="w-full bg-white border-0 rounded-xl px-4 py-3 text-center focus:outline-none focus:ring-2 focus:ring-[#C85A5A]/50"
                  required
                />
                <button 
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#C85A5A] hover:bg-[#B64A4A] text-white py-3 rounded-xl transition-all duration-200 font-medium disabled:opacity-75"
                >
                  {isLoading ? 'Signing up...' : 'Get Early Access'}
                </button>
              </form>
            )}
          </div>

          <p className="text-sm text-[#6B6B6B]">
            Free to start, no commitment required
          </p>

          {/* App Download Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
            <GetStartedButton 
              variant="secondary" 
              className="border border-[#C85A5A] text-[#C85A5A] hover:bg-[#C85A5A] hover:text-white rounded-xl px-6 py-3 bg-transparent"
              icon={<Download className="w-4 h-4" />}
            >
              Try Weave Now
            </GetStartedButton>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto mt-24 pt-12 border-t border-[#C85A5A]/20">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <WeaveIcon className="w-8 h-8" />
            <span className="text-xl font-semibold text-[#2B2B2B]">weave</span>
          </div>
          
          <div className="flex gap-8 text-[#6B6B6B]">
            <a href="#" className="hover:text-[#C85A5A] transition-colors">Privacy</a>
            <a href="#" className="hover:text-[#C85A5A] transition-colors">Terms</a>
            <a href="#" className="hover:text-[#C85A5A] transition-colors">Support</a>
          </div>
        </div>
        
        <div className="text-center mt-8 text-[#6B6B6B] text-sm">
          © 2024 Weave. Made with care for cultural explorers.
        </div>
      </footer>
    </section>
  );
}