'use client'

interface BobbinAnimatedProps {
  size?: number
  className?: string
}

export default function BobbinAnimated({ 
  size = 72,
  className = '' 
}: BobbinAnimatedProps) {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        .bobbin-animated-container {
          width: ${size}px;
          height: ${size}px;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .bobbin-animated-bobbin {
          width: ${size}px;
          height: ${size}px;
          animation: bobbin-idle-bob 3s ease-in-out infinite;
        }

        .bobbin-ear-left {
          animation: bobbin-ear-twitch-left 4s ease-in-out infinite;
        }

        .bobbin-ear-right {
          animation: bobbin-ear-twitch-right 4s ease-in-out infinite 0.5s;
        }

        @keyframes bobbin-idle-bob {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }

        @keyframes bobbin-ear-twitch-left {
          0%, 90%, 100% { transform: rotate(0deg); }
          93% { transform: rotate(-3deg); }
          96% { transform: rotate(2deg); }
        }

        @keyframes bobbin-ear-twitch-right {
          0%, 85%, 100% { transform: rotate(0deg); }
          88% { transform: rotate(4deg); }
          91% { transform: rotate(-2deg); }
        }
      `}} />
      <div className={`bobbin-animated-container ${className}`}>
        <svg className="bobbin-animated-bobbin" viewBox="0 0 80 80" fill="none">
          <ellipse className="bobbin-ear-left" cx="32" cy="28" rx="6" ry="14" fill="#1E3A5F" style={{ transformOrigin: '32px 42px' }} />
          <ellipse cx="32" cy="28" rx="3" ry="9" fill="#E8E5E0"/>
          <ellipse className="bobbin-ear-right" cx="48" cy="28" rx="6" ry="14" fill="#1E3A5F" style={{ transformOrigin: '48px 42px' }} />
          <ellipse cx="48" cy="28" rx="3" ry="9" fill="#E8E5E0"/>
          <circle cx="40" cy="50" r="16" fill="#1E3A5F"/>
          <circle cx="35" cy="48" r="5" fill="none" stroke="#C9A227" strokeWidth="1.5"/>
          <circle cx="45" cy="48" r="5" fill="none" stroke="#C9A227" strokeWidth="1.5"/>
          <path d="M38 48 L42 48" stroke="#C9A227" strokeWidth="1"/>
          <circle cx="35" cy="48" r="1.5" fill="white"/>
          <circle cx="45" cy="48" r="1.5" fill="white"/>
          <ellipse cx="40" cy="56" rx="2.5" ry="1.5" fill="#C9A227"/>
        </svg>
      </div>
    </>
  )
}

