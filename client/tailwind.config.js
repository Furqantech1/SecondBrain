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
                display: ['Inter', 'system-ui', 'sans-serif'], // For headers
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                'deep-space': 'radial-gradient(circle at 50% 0%, #1a1a40 0%, #050510 60%)',
            },
            boxShadow: {
                'neon': '0 0 20px rgba(0, 224, 255, 0.3)',
                'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
            }
        },
    },
    plugins: [],
}
