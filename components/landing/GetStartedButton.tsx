'use client';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ArrowRight } from 'lucide-react';

interface GetStartedButtonProps {
  variant?: 'primary' | 'secondary';
  children: React.ReactNode;
  className?: string;
  size?: 'small' | 'medium' | 'large';
  icon?: React.ReactNode;
}

export function GetStartedButton({ 
  variant = 'primary', 
  children, 
  className = '',
  size = 'medium',
  icon
}: GetStartedButtonProps) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);

  const handleGetStarted = async () => {
    setIsNavigating(true);
    
    try {
      // Always redirect to /app - it will handle auth state appropriately
      // If user is logged in, they'll see the main app
      // If not logged in, they'll see the sign-in screen
      router.push('/app');
    } catch (error) {
      console.error('Error navigating to app:', error);
      setIsNavigating(false);
    }
  };

  const isLoading = authLoading || isNavigating;

  // Base classes for different variants
  const variantClasses = {
    primary: "bg-[#C85A5A] hover:bg-[#B64A4A] text-white shadow-lg hover:shadow-xl",
    secondary: "bg-white/80 backdrop-blur-sm border border-[#C85A5A]/20 text-[#2B2B2B] hover:bg-white hover:shadow-lg"
  };

  // Size classes
  const sizeClasses = {
    small: "px-6 py-2.5 text-sm",
    medium: "px-8 py-4",
    large: "px-8 py-4 text-lg"
  };

  return (
    <button
      onClick={handleGetStarted}
      disabled={isLoading}
      className={`
        group rounded-2xl transition-all duration-300 
        flex items-center justify-center gap-2 
        transform hover:-translate-y-1 font-medium
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${className}
        ${isLoading ? 'opacity-75 cursor-not-allowed transform-none' : ''}
      `}
    >
      {icon && !isLoading && icon}
      <span>
        {isLoading 
          ? (user ? 'Opening App...' : 'Getting Started...') 
          : children
        }
      </span>
      {!isLoading && !icon && (
        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
      )}
    </button>
  );
}