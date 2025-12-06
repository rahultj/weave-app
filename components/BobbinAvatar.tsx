'use client'

export type AnimationState = 'idle' | 'anticipation' | 'diving' | 'searching' | 'emerging'

interface BobbinAvatarProps {
  state?: AnimationState
  size?: number
  className?: string
}

export default function BobbinAvatar({ 
  state = 'idle', 
  size = 72,
  className = '' 
}: BobbinAvatarProps) {
  const containerSize = size
  const bobbinSize = size * 0.67
  const holeWidth = size * 0.75
  const holeHeight = size * 0.2
  const searchBottom = size * 0.05
  const peekBottom = size * 0.12
  const glintTop = size * 0.35
  const glintRight = size * 0.2

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        .bobbin-avatar-container {
          width: ${containerSize}px;
          height: ${containerSize}px;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .bobbin-avatar-bobbin {
          position: absolute;
          width: ${bobbinSize}px;
          height: ${bobbinSize}px;
          transition: transform 0.15s ease-out;
        }

        .bobbin-avatar-hole {
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: ${holeWidth}px;
          height: ${holeHeight}px;
          opacity: 0;
          transition: opacity 0.2s ease;
        }

        .bobbin-avatar-hole-outer { fill: #E8E5E0; }
        .bobbin-avatar-hole-inner { fill: #1E3A5F; }

        /* Idle */
        .bobbin-avatar-container.idle .bobbin-avatar-bobbin {
          animation: bobbin-idle-bob 3s ease-in-out infinite;
        }
        .bobbin-avatar-container.idle .bobbin-ear-left {
          animation: bobbin-ear-twitch-left 4s ease-in-out infinite;
        }
        .bobbin-avatar-container.idle .bobbin-ear-right {
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

        /* Anticipation */
        .bobbin-avatar-container.anticipation .bobbin-avatar-bobbin {
          animation: bobbin-anticipate 0.2s ease-out forwards;
        }
        .bobbin-avatar-container.anticipation .bobbin-avatar-hole { opacity: 1; }

        @keyframes bobbin-anticipate {
          0% { transform: translateY(0) scaleY(1); }
          100% { transform: translateY(8px) scaleY(0.85); }
        }

        /* Diving */
        .bobbin-avatar-container.diving .bobbin-avatar-bobbin {
          animation: bobbin-dive 0.5s ease-in forwards;
        }
        .bobbin-avatar-container.diving .bobbin-avatar-hole { opacity: 1; }

        @keyframes bobbin-dive {
          0% { transform: translateY(8px) scaleY(0.85); opacity: 1; }
          30% { transform: translateY(-20px) scaleY(1.15); opacity: 1; }
          100% { transform: translateY(60px) scaleY(0.9); opacity: 0; }
        }

        /* Searching */
        .bobbin-avatar-container.searching .bobbin-avatar-bobbin { opacity: 0; }
        .bobbin-avatar-container.searching .bobbin-avatar-hole { opacity: 1; }
        .bobbin-avatar-container.searching .bobbin-search-rings { opacity: 1; }
        .bobbin-avatar-container.searching .bobbin-peek-ears { opacity: 1; animation: bobbin-ears-peek 2s ease-in-out infinite; }

        .bobbin-search-rings {
          position: absolute;
          bottom: ${searchBottom}px;
          left: 50%;
          transform: translateX(-50%);
          opacity: 0;
          transition: opacity 0.2s ease;
        }
        .bobbin-search-rings ellipse { animation: bobbin-pulse-ring 1.5s ease-in-out infinite; }
        .bobbin-search-rings ellipse:nth-child(2) { animation-delay: 0.3s; }
        .bobbin-search-rings ellipse:nth-child(3) { animation-delay: 0.6s; }

        @keyframes bobbin-pulse-ring {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.05); }
        }

        .bobbin-peek-ears {
          position: absolute;
          bottom: ${peekBottom}px;
          left: 50%;
          transform: translateX(-50%);
          opacity: 0;
          transition: opacity 0.2s ease;
        }

        @keyframes bobbin-ears-peek {
          0%, 100% { transform: translateX(-50%) translateY(0); }
          25% { transform: translateX(-50%) translateY(-4px); }
          50% { transform: translateX(-50%) translateY(0); }
          75% { transform: translateX(-50%) translateY(-2px); }
        }

        /* Emerging */
        .bobbin-avatar-container.emerging .bobbin-avatar-bobbin {
          animation: bobbin-emerge 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        .bobbin-avatar-container.emerging .bobbin-avatar-hole {
          opacity: 1;
          animation: bobbin-hole-fade 0.4s ease-out 0.3s forwards;
        }
        .bobbin-avatar-container.emerging .bobbin-peek-ears { opacity: 0; }
        .bobbin-avatar-container.emerging .bobbin-search-rings { opacity: 0; }
        .bobbin-avatar-container.emerging .bobbin-glint {
          animation: bobbin-glint 0.3s ease-out 0.25s forwards;
        }

        @keyframes bobbin-emerge {
          0% { transform: translateY(60px) scaleY(0.9); opacity: 0; }
          50% { transform: translateY(-10px) scaleY(1.1); opacity: 1; }
          100% { transform: translateY(0) scaleY(1); opacity: 1; }
        }
        @keyframes bobbin-hole-fade { to { opacity: 0; } }

        .bobbin-glint {
          position: absolute;
          top: ${glintTop}px;
          right: ${glintRight}px;
          opacity: 0;
        }
        @keyframes bobbin-glint {
          0% { opacity: 0; transform: scale(0.5); }
          50% { opacity: 1; transform: scale(1.2); }
          100% { opacity: 0; transform: scale(1); }
        }
      `}} />
      <div className={`bobbin-avatar-container ${state} ${className}`}>
        <svg className="bobbin-avatar-bobbin" viewBox="0 0 80 80" fill="none">
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

        <svg className="bobbin-avatar-hole" viewBox="0 0 90 24" fill="none">
          <ellipse className="bobbin-avatar-hole-outer" cx="45" cy="14" rx="42" ry="10"/>
          <ellipse className="bobbin-avatar-hole-inner" cx="45" cy="12" rx="34" ry="7"/>
        </svg>

        <svg className="bobbin-search-rings" width="70" height="20" viewBox="0 0 70 20" fill="none">
          <ellipse cx="35" cy="10" rx="30" ry="6" fill="none" stroke="#C9A227" strokeWidth="1"/>
          <ellipse cx="35" cy="10" rx="22" ry="4" fill="none" stroke="#C9A227" strokeWidth="1"/>
          <ellipse cx="35" cy="10" rx="14" ry="3" fill="none" stroke="#C9A227" strokeWidth="1"/>
        </svg>

        <svg className="bobbin-peek-ears" width="40" height="24" viewBox="0 0 40 24" fill="none">
          <ellipse cx="12" cy="12" rx="5" ry="12" fill="#1E3A5F"/>
          <ellipse cx="12" cy="12" rx="2.5" ry="8" fill="#E8E5E0"/>
          <ellipse cx="28" cy="12" rx="5" ry="12" fill="#1E3A5F"/>
          <ellipse cx="28" cy="12" rx="2.5" ry="8" fill="#E8E5E0"/>
        </svg>

        <svg className="bobbin-glint" width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M6 0 L7 5 L12 6 L7 7 L6 12 L5 7 L0 6 L5 5 Z" fill="#C9A227"/>
        </svg>
      </div>
    </>
  )
}
