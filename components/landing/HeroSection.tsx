import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { GetStartedButton } from "./GetStartedButton";
import { OptimizedImage } from "./OptimizedImage";

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background with organic shapes */}
      <div className="absolute inset-0 bg-[#FAF8F5]">
        {/* Large curved background shape */}
        <div className="absolute top-0 left-0 w-full h-full">
          <svg className="absolute top-0 left-0 w-full h-full" viewBox="0 0 1440 800" preserveAspectRatio="none">
            <path
              d="M0,0 C480,100 960,50 1440,80 L1440,400 C960,350 480,400 0,320 Z"
              fill="#F7F5F1"
              opacity="0.6"
            />
          </svg>
        </div>
        
        {/* Floating elements */}
        <div className="absolute top-20 left-10 w-16 h-16 bg-[#C85A5A]/10 rounded-full blur-xl"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-[#C85A5A]/5 rounded-full blur-2xl"></div>
        <div className="absolute bottom-40 left-1/4 w-20 h-20 bg-[#F7F5F1] rounded-full blur-lg"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-20">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Content */}
          <div className="space-y-8">
            <div className="space-y-6">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold text-[#2B2B2B] leading-tight">
                Your Personal Cultural Journal
              </h1>
              
              <p className="text-lg sm:text-xl text-[#6B6B6B] max-w-lg leading-relaxed">
                Capture, explore, and understand the cultural moments that shape your world with AI-powered insights.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <GetStartedButton variant="primary">
                Start Your Cultural Journey
              </GetStartedButton>
              
              <a href="#features">
                <button className="group bg-white/80 backdrop-blur-sm border border-[#C85A5A]/20 text-[#2B2B2B] px-8 py-4 rounded-2xl transition-all duration-300 hover:bg-white hover:shadow-lg transform hover:-translate-y-1 flex items-center justify-center gap-2">
                  <span className="font-medium">Learn More</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </a>
            </div>
          </div>

          {/* App Preview */}
          <div className="relative">
            <div className="relative bg-gradient-to-br from-white/60 to-[#F7F5F1]/60 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/20">
              <OptimizedImage 
                src="/landing/weave-cultural-feed.png" 
                alt="Weave app showing cultural discoveries including Native American children's clothing and American Indian foods"
                width={400}
                height={600}
                className="w-full max-w-sm mx-auto rounded-2xl shadow-lg"
                priority
              />
              
              {/* Floating UI elements */}
              <div className="absolute -top-6 -left-6 bg-white rounded-2xl p-4 shadow-xl border border-[#C85A5A]/10">
                <div className="w-8 h-8 bg-[#C85A5A]/10 rounded-lg flex items-center justify-center">
                  <div className="w-4 h-4 bg-[#C85A5A] rounded-sm"></div>
                </div>
              </div>
              
              <div className="absolute -bottom-4 -right-4 bg-[#C85A5A] text-white rounded-2xl p-4 shadow-xl">
                <div className="text-sm font-medium">AI Powered</div>
              </div>
            </div>
            
            {/* Background decorative elements */}
            <div className="absolute -z-10 top-4 left-4 w-full h-full bg-[#C85A5A]/5 rounded-3xl"></div>
            <div className="absolute -z-20 top-8 left-8 w-full h-full bg-[#C85A5A]/3 rounded-3xl"></div>
          </div>
        </div>
      </div>

      {/* Bottom curve transition */}
      <div className="absolute bottom-0 left-0 w-full">
        <svg className="w-full h-24" viewBox="0 0 1440 120" preserveAspectRatio="none">
          <path
            d="M0,120 C480,60 960,80 1440,40 L1440,120 Z"
            fill="#F7F5F1"
          />
        </svg>
      </div>
    </section>
  );
}