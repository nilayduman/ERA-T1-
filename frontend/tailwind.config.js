/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        'eva-red': '#580F1B',
        intercom: {
          black: '#0D0D12',
          navy: '#1A1A2E',
          gray: {
            50: '#F7F8FA',
            100: '#EFF1F4',
            200: '#E8EBED',
            300: '#C5CAD3',
            400: '#8B95A5',
            500: '#677184',
            600: '#4A5568',
            700: '#2D3748',
          },
          blue: '#286EFA',
          'blue-hover': '#1E5AD4',
          purple: '#6B4FBB',
          mint: '#00D4AA',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        montserrat: ['Montserrat', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 3px rgba(13, 13, 18, 0.06), 0 4px 12px rgba(13, 13, 18, 0.04)',
        elevated: '0 8px 30px rgba(13, 13, 18, 0.08)',
      },
      borderRadius: {
        intercom: '12px',
      },
    },
  },
  plugins: [],
};
