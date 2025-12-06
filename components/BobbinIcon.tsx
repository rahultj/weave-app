interface BobbinIconProps {
  size?: number
  className?: string
}

export default function BobbinIcon({ size = 32, className = '' }: BobbinIconProps) {
  return (
    <svg 
      viewBox="0 0 80 80" 
      xmlns="http://www.w3.org/2000/svg" 
      fill="none"
      width={size}
      height={size}
      className={className}
    >
      {/* Ears */}
      <ellipse cx="32" cy="28" rx="6" ry="14" fill="#1E3A5F"/>
      <ellipse cx="48" cy="28" rx="6" ry="14" fill="#1E3A5F"/>
      {/* Inner ears */}
      <ellipse cx="32" cy="28" rx="3" ry="9" fill="#E8E5E0"/>
      <ellipse cx="48" cy="28" rx="3" ry="9" fill="#E8E5E0"/>
      {/* Head */}
      <circle cx="40" cy="50" r="16" fill="#1E3A5F"/>
      {/* Glasses */}
      <circle cx="35" cy="48" r="5" fill="none" stroke="#C9A227" strokeWidth="1.5"/>
      <circle cx="45" cy="48" r="5" fill="none" stroke="#C9A227" strokeWidth="1.5"/>
      <path d="M38 48 L42 48" stroke="#C9A227" strokeWidth="1"/>
      {/* Eyes */}
      <circle cx="35" cy="48" r="1.5" fill="white"/>
      <circle cx="45" cy="48" r="1.5" fill="white"/>
      {/* Nose */}
      <ellipse cx="40" cy="56" rx="2.5" ry="1.5" fill="#C9A227"/>
    </svg>
  )
}


