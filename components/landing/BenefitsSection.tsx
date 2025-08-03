import { Star } from "lucide-react";

export function BenefitsSection() {
  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Art Student",
      content: "Weave helped me understand the connections between different artistic movements I was studying. The AI insights are incredibly thoughtful.",
      rating: 5
    },
    {
      name: "Marcus Rodriguez",
      role: "Film Enthusiast",
      content: "I love how Weave tracks my evolving taste in cinema. It's like having a personal film critic who actually knows me.",
      rating: 5
    },
    {
      name: "Priya Patel",
      role: "Literature Professor",
      content: "As an educator, I use Weave to track cultural references across different texts. It's become indispensable for my research.",
      rating: 5
    }
  ];

  const stats = [
    { label: "Cultural Moments Captured", value: "50K+" },
    { label: "Active Users", value: "2,500+" },
    { label: "AI Insights Generated", value: "125K+" },
    { label: "Cultural Connections Made", value: "300K+" }
  ];

  return (
    <section className="relative py-24 px-6 bg-[#FAF8F5] overflow-hidden">
      {/* Curved top transition */}
      <div className="absolute top-0 left-0 w-full">
        <svg className="w-full h-20" viewBox="0 0 1440 100" preserveAspectRatio="none">
          <path
            d="M0,0 C480,40 960,60 1440,20 L1440,0 Z"
            fill="#F7F5F1"
          />
        </svg>
      </div>

      {/* Background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-0 w-96 h-96 bg-[#C85A5A]/3 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-0 w-80 h-80 bg-[#F7F5F1]/80 rounded-full blur-2xl"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto pt-16">
        <div className="text-center mb-20">
          <h2 className="text-4xl lg:text-5xl font-semibold text-[#2B2B2B] mb-6">
            Loved by Cultural Explorers
          </h2>
          <p className="text-xl text-[#6B6B6B] max-w-2xl mx-auto">
            Join thousands of people who are discovering deeper meaning in their cultural interests
          </p>
        </div>

        {/* Testimonials */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="group">
              <div className="relative bg-white/60 backdrop-blur-sm rounded-3xl p-8 h-full border border-white/40 hover:border-[#C85A5A]/20 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2">
                <div className="space-y-6">
                  {/* Rating */}
                  <div className="flex space-x-1">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-[#C85A5A] fill-current" />
                    ))}
                  </div>
                  
                  <blockquote className="text-[#6B6B6B] leading-relaxed">
                    "{testimonial.content}"
                  </blockquote>
                  
                  <div className="border-t border-[#C85A5A]/10 pt-6">
                    <div className="font-semibold text-[#2B2B2B]">{testimonial.name}</div>
                    <div className="text-sm text-[#6B6B6B]">{testimonial.role}</div>
                  </div>
                </div>

                {/* Card background decoration */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#C85A5A]/5 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="bg-gradient-to-br from-white/60 to-[#F7F5F1]/60 backdrop-blur-sm rounded-3xl border border-white/40 p-12">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            {stats.map((stat, index) => (
              <div key={index} className="space-y-2">
                <div className="text-3xl lg:text-4xl font-semibold text-[#C85A5A]">
                  {stat.value}
                </div>
                <div className="text-sm text-[#6B6B6B] font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}