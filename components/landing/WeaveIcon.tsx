interface WeaveIconProps {
  className?: string;
}

export function WeaveIcon({ className = "w-6 h-6" }: WeaveIconProps) {
  return (
    <svg 
      viewBox="0 0 32 32" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Background elements - layered geometric shapes */}
      <g>
        {/* Purple/Pink diagonal bars */}
        <rect 
          x="4" 
          y="8" 
          width="24" 
          height="4" 
          rx="2" 
          fill="#A855F7" 
          transform="rotate(45 16 16)"
        />
        <rect 
          x="4" 
          y="20" 
          width="24" 
          height="4" 
          rx="2" 
          fill="#D946EF" 
          transform="rotate(45 16 16)"
        />
        
        {/* Teal/Cyan diagonal bars */}
        <rect 
          x="8" 
          y="4" 
          width="4" 
          height="24" 
          rx="2" 
          fill="#06B6D4" 
          transform="rotate(45 16 16)"
        />
        <rect 
          x="20" 
          y="4" 
          width="4" 
          height="24" 
          rx="2" 
          fill="#0891B2" 
          transform="rotate(45 16 16)"
        />
        
        {/* Green accent elements */}
        <rect 
          x="12" 
          y="6" 
          width="8" 
          height="3" 
          rx="1.5" 
          fill="#10B981" 
          transform="rotate(-45 16 16)"
        />
        <rect 
          x="12" 
          y="23" 
          width="8" 
          height="3" 
          rx="1.5" 
          fill="#059669" 
          transform="rotate(-45 16 16)"
        />
        
        {/* Center intersection highlight */}
        <circle 
          cx="16" 
          cy="16" 
          r="3" 
          fill="#F59E0B" 
          opacity="0.8"
        />
        <circle 
          cx="16" 
          cy="16" 
          r="1.5" 
          fill="#FFFFFF" 
        />
      </g>
    </svg>
  );
}