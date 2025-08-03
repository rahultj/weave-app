import { Calendar, Share2, TrendingUp, Zap, Lock, Smartphone } from "lucide-react";

export function KeyFeaturesSection() {
  const features = [
    {
      icon: Calendar,
      title: "Taste Evolution Timeline",
      description: "See your cultural journey unfold chronologically and track how your aesthetic sensibility develops over time."
    },
    {
      icon: Share2,
      title: "Aesthetic Pattern Detection",
      description: "AI automatically finds connections between your cultural discoveries, revealing the deeper patterns in your taste."
    },
    {
      icon: TrendingUp,
      title: "Cultural Sophistication Metrics",
      description: "Monitor how your cultural interests evolve and expand as you develop more refined aesthetic intelligence."
    },
    {
      icon: Zap,
      title: "Aesthetic Moment Capture",
      description: "Save cultural discoveries instantly when something strikes you—from museum visits to film screenings to book passages."
    },
    {
      icon: Lock,
      title: "Personal Taste Sanctuary",
      description: "Your cultural discoveries and taste development journey are completely private and secure by design."
    },
    {
      icon: Smartphone,
      title: "Seamless Cultural Curation",
      description: "Access your cultural journal and continue developing your taste on any device, anywhere, anytime."
    }
  ];

  return (
    <section className="relative py-24 px-6 bg-[#F7F5F1] overflow-hidden">
      {/* Curved top transition */}
      <div className="absolute top-0 left-0 w-full">
        <svg className="w-full h-20" viewBox="0 0 1440 100" preserveAspectRatio="none">
          <path
            d="M0,0 C480,60 960,40 1440,80 L1440,0 Z"
            fill="#FAF8F5"
          />
        </svg>
      </div>

      {/* Background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-[#C85A5A]/4 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/3 left-1/4 w-80 h-80 bg-[#FAF8F5]/60 rounded-full blur-2xl"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto pt-16">
        <div className="text-center mb-20">
          <h2 className="text-4xl lg:text-5xl font-semibold text-[#2B2B2B] mb-6">
            Key Features
          </h2>
          <p className="text-xl text-[#6B6B6B] max-w-2xl mx-auto">
            Everything you need to build your personal cultural archive and discover meaningful insights
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
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

      {/* Bottom curve transition */}
      <div className="absolute bottom-0 left-0 w-full">
        <svg className="w-full h-16" viewBox="0 0 1440 80" preserveAspectRatio="none">
          <path
            d="M0,80 C720,40 720,60 1440,20 L1440,80 Z"
            fill="#FAF8F5"
          />
        </svg>
      </div>
    </section>
  );
}