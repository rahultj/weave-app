import { Brain, Palette, Users } from "lucide-react";

export function WhatIsWeaveSection() {
  const features = [
    {
      icon: Brain,
      title: "Aesthetic Intelligence",
      description: "AI analysis reveals the deeper patterns in what captivates you—from color palettes to narrative structures to philosophical themes."
    },
    {
      icon: Palette,
      title: "Cultural Threads",
      description: "See how your love for Tarkovsky connects to your fascination with Japanese pottery. Weave finds the aesthetic threads that bind your interests."
    },
    {
      icon: Users,
      title: "Curated Discovery",
      description: "Get recommendations that honor your existing sensibility while gently expanding your cultural horizons."
    }
  ];

  return (
    <section className="relative py-24 px-6 bg-[#F7F5F1] overflow-hidden">
      {/* Background organic shapes */}
      <div className="absolute inset-0">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#C85A5A]/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#FAF8F5]/60 rounded-full blur-2xl"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="text-center mb-16 sm:mb-20">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-[#2B2B2B] mb-4 sm:mb-6">
            What is Weave?
          </h2>
          <p className="text-lg sm:text-xl text-[#6B6B6B] max-w-2xl mx-auto px-4">
            Weave is a personal cultural journal that helps you understand why certain books, films, art, and ideas resonate with you—and discover what to explore next.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="group">
              <div className="relative bg-white/60 backdrop-blur-sm rounded-3xl p-8 h-full border border-white/40 hover:border-[#C85A5A]/20 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2">
                <div className="space-y-6">
                  <div className="relative">
                    <div className="w-16 h-16 bg-gradient-to-br from-[#C85A5A]/10 to-[#C85A5A]/5 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <feature.icon className="w-8 h-8 text-[#C85A5A]" />
                    </div>
                    {/* Floating accent */}
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-[#C85A5A]/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                  
                  <h3 className="text-xl font-semibold text-[#2B2B2B]">
                    {feature.title}
                  </h3>
                  
                  <p className="text-[#6B6B6B] leading-relaxed">
                    {feature.description}
                  </p>
                </div>

                {/* Card background decoration */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#C85A5A]/5 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section transition curve */}
      <div className="absolute bottom-0 left-0 w-full">
        <svg className="w-full h-16" viewBox="0 0 1440 80" preserveAspectRatio="none">
          <path
            d="M0,80 C720,20 720,60 1440,0 L1440,80 Z"
            fill="#FAF8F5"
          />
        </svg>
      </div>
    </section>
  );
}