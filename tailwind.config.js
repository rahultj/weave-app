/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#C85A5A',
          hover: '#B84848', 
          light: '#D67373',
        },
        neutral: {
          'bg-main': '#FAF8F5',
          'bg-card': '#F7F5F1',
          'bg-hover': '#F2EFE9',
          'border': '#E8E5E0',
          'text-primary': '#2A2A2A',
          'text-secondary': '#5A5A5A',
          'text-muted': '#888888',
        }
      },
      fontSize: {
        'display': ['28px', '32px'],
        'h1': ['24px', '28px'],
        'h2': ['20px', '24px'], 
        'h3': ['18px', '22px'],
        'body-large': ['16px', '24px'],
        'body': ['14px', '20px'],
        'caption': ['12px', '16px'],
      },
      spacing: {
        'xs': '4px',
        'sm': '8px', 
        'md': '16px',
        'lg': '24px',
        'xl': '32px',
        'xxl': '48px',
      },
      borderRadius: {
        'card': '12px',
        'input': '8px',
      },
      boxShadow: {
        'card': '0px 2px 8px rgba(0,0,0,0.04)',
        'card-hover': '0px 4px 16px rgba(0,0,0,0.08)',
      }
    },
  },
  plugins: [],
}

