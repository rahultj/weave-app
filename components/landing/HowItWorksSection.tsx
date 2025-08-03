import { Plus, Network } from "lucide-react";
import { WeaveIcon } from "./WeaveIcon";
import { OptimizedImage } from "./OptimizedImage";

export function HowItWorksSection() {
  const steps = [
    {
      number: "01",
      title: "Save a cultural moment",
      description: "Capture anything that resonates - a powerful quote, an inspiring artwork, or a meaningful cultural artifact.",
      icon: Plus,
      screenshot: "/landing/weave-cultural-feed.png",
      screenshotAlt: "Weave app feed showing Native American cultural artifacts and diverse cultural discoveries",
      comingSoon: false
    },
    {
      number: "02", 
      title: "Ask Bobbin anything",
      description: "Our AI companion helps you explore deeper meanings, make connections, and understand your cultural interests.",
      icon: WeaveIcon,
      screenshot: "/landing/weave-bobbin-chat.png",
      screenshotAlt: "Chat with Bobbin AI exploring the history of American Indian foods and their global cultural impact",
      comingSoon: false
    },
    {
      number: "03",
      title: "Discover your patterns",
      description: "See how your cultural moments connect and evolve over time through beautiful thread visualizations.",
      icon: Network,
      comingSoon: true
    }
  ];

  return (
    <section className="relative py-24 px-6 bg-[#FAF8F5] overflow-hidden">
      {/* Curved top transition */}
      <div className="absolute top-0 left-0 w-full">
        <svg className="w-full h-16" viewBox="0 0 1440 80" preserveAspectRatio="none">
          <path
            d="M0,0 C720,60 720,20 1440,80 L1440,0 Z"
            fill="#F7F5F1"
          />
        </svg>
      </div>

      {/* Background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-0 w-72 h-72 bg-[#C85A5A]/3 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-[#F7F5F1]/80 rounded-full blur-2xl"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto pt-16">
        <div className="text-center mb-16 sm:mb-20">
          <div className="flex items-center justify-center gap-3 mb-4 sm:mb-6">
            <WeaveIcon className="w-8 sm:w-10 h-8 sm:h-10" />
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-[#2B2B2B]">
              How It Works
            </h2>
          </div>
          <p className="text-lg sm:text-xl text-[#6B6B6B] max-w-2xl mx-auto px-4">
            Transform your cultural discoveries into meaningful insights with three simple steps
          </p>
        </div>

        <div className="space-y-20 sm:space-y-32">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              {/* Connection line */}
              {index < steps.length - 1 && (
                <div className="absolute left-1/2 bottom-0 transform -translate-x-1/2 translate-y-16 w-px h-16 bg-gradient-to-b from-[#C85A5A]/30 to-transparent hidden lg:block"></div>
              )}

              <div className={`grid lg:grid-cols-2 gap-16 items-center ${index % 2 === 1 ? 'lg:grid-flow-col-dense' : ''}`}>
                {/* Content */}
                <div className={`space-y-8 ${index % 2 === 1 ? 'lg:col-start-2' : ''}`}>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-12 h-12 bg-[#C85A5A] text-white rounded-2xl font-semibold">
                      {step.number}
                    </div>
                    {step.comingSoon && (
                      <span className="text-sm font-medium text-[#6B6B6B] bg-[#6B6B6B]/10 px-3 py-1 rounded-full">
                        Coming Soon
                      </span>
                    )}
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-[#2B2B2B]">
                      {step.title}
                    </h3>
                    <p className="text-base sm:text-lg text-[#6B6B6B] leading-relaxed max-w-lg">
                      {step.description}
                    </p>
                  </div>
                </div>

                {/* Visual */}
                <div className={`${index % 2 === 1 ? 'lg:col-start-1 lg:row-start-1' : ''}`}>
                  <div className="relative group">
                    <div className="relative bg-gradient-to-br from-white/80 to-[#F7F5F1]/60 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/30 group-hover:shadow-3xl transition-all duration-500">
                      {step.screenshot ? (
                        <OptimizedImage 
                          src={step.screenshot}
                          alt={step.screenshotAlt}
                          width={300}
                          height={600}
                          className="w-full max-w-sm mx-auto rounded-2xl shadow-lg"
                        />
                      ) : (
                        <div className="w-full max-w-sm mx-auto h-80 rounded-2xl bg-gradient-to-br from-[#F7F5F1] to-[#F0EDE8] flex flex-col items-center justify-center space-y-6 border-2 border-dashed border-[#C85A5A]/20">
                          <div className="w-20 h-20 bg-[#C85A5A]/10 rounded-3xl flex items-center justify-center">
                            <step.icon className="w-10 h-10 text-[#C85A5A]/60" />
                          </div>
                          <div className="text-center space-y-3">
                            <p className="text-xl font-semibold text-[#2B2B2B]">Step {step.number}</p>
                            <p className="text-sm text-[#6B6B6B] max-w-xs">
                              Coming Soon
                            </p>
                          </div>
                        </div>
                      )}
                      
                      {/* Floating UI accent */}
                      <div className="absolute -top-4 -right-4 w-8 h-8 bg-[#C85A5A] rounded-full opacity-60 group-hover:opacity-100 transition-opacity"></div>
                      <div className="absolute -bottom-6 -left-6 w-12 h-12 bg-white rounded-2xl shadow-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                        <step.icon className="w-5 h-5 text-[#C85A5A]" />
                      </div>
                    </div>
                    
                    {/* Background decoration layers */}
                    <div className="absolute -z-10 top-4 left-4 w-full h-full bg-[#C85A5A]/5 rounded-3xl group-hover:translate-x-2 group-hover:translate-y-2 transition-transform duration-500"></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom curve transition */}
      <div className="absolute bottom-0 left-0 w-full">
        <svg className="w-full h-20" viewBox="0 0 1440 100" preserveAspectRatio="none">
          <path
            d="M0,100 C480,40 960,60 1440,20 L1440,100 Z"
            fill="#F7F5F1"
          />
        </svg>
      </div>
    </section>
  );
}