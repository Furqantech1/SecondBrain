/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'brain-dark': '#050510', // Obsidian
                'brain-panel': 'rgba(255, 255, 255, 0.03)', // Glass
                'brain-primary': '#00E0FF', // Electric Azure
                'brain-primary-dark': '#00B8CC',
                'brain-secondary': '#7B61FF', // Deep Purple integration
                'brain-text-secondary': '#E0E7FF', // Moonlight
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
                display: ['Inter', 'system-ui', 'sans-serif'],
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                'deep-space': 'radial-gradient(circle at 50% 0%, #1a1a40 0%, #050510 60%)',
            },
            boxShadow: {
                'neon': '0 0 20px rgba(0, 224, 255, 0.3)',
                'neon-soft': '0 0 12px rgba(0, 224, 255, 0.15)',
                'neon-strong': '0 0 30px rgba(0, 224, 255, 0.4), 0 0 60px rgba(0, 224, 255, 0.1)',
                'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
                'glass-lg': '0 12px 48px 0 rgba(0, 0, 0, 0.5)',
                'inner-glow': 'inset 0 1px 0 rgba(255,255,255,0.06)',
            },
            animation: {
                'fade-in': 'fadeIn 0.5s ease-out forwards',
                'slide-up': 'slideUp 0.5s ease-out forwards',
                'slide-in-left': 'slideInLeft 0.4s ease-out forwards',
                'slide-in-right': 'slideInRight 0.4s ease-out forwards',
                'bounce-slow': 'bounceSlow 2s ease-in-out infinite',
                'float': 'float 3s ease-in-out infinite',
                'pulse-ring': 'pulseRing 2s ease-out infinite',
                'shimmer': 'shimmer 2s linear infinite',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { opacity: '0', transform: 'translateY(12px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                slideInLeft: {
                    '0%': { opacity: '0', transform: 'translateX(-16px)' },
                    '100%': { opacity: '1', transform: 'translateX(0)' },
                },
                slideInRight: {
                    '0%': { opacity: '0', transform: 'translateX(16px)' },
                    '100%': { opacity: '1', transform: 'translateX(0)' },
                },
                bounceSlow: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-6px)' },
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-8px)' },
                },
                pulseRing: {
                    '0%': { transform: 'scale(1)', opacity: '0.6' },
                    '100%': { transform: 'scale(2.5)', opacity: '0' },
                },
                shimmer: {
                    '0%': { backgroundPosition: '-200% 0' },
                    '100%': { backgroundPosition: '200% 0' },
                },
            },
        },
    },
    plugins: [],
}
