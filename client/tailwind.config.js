/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Geist Sans', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['Geist Mono', 'ui-monospace', 'monospace'],
      },
      colors: {
        surface: {
          base:    'var(--surface-base)',
          raised:  'var(--surface-raised)',
          overlay: 'var(--surface-overlay)',
          sunken:  'var(--surface-sunken)',
        },
        border: {
          subtle:   'var(--border-subtle)',
          default:  'var(--border-default)',
          emphasis: 'var(--border-emphasis)',
        },
        text: {
          primary:   'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          tertiary:  'var(--text-tertiary)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          hover:   'var(--accent-hover)',
          text:    'var(--accent-text)',
        },
        status: {
          active:  'var(--status-active)',
          pending: 'var(--status-pending)',
          error:   'var(--status-error)',
          idle:    'var(--status-idle)',
        },
      },
      borderWidth: { DEFAULT: '1px' },
      borderRadius: {
        sm: '4px',
        DEFAULT: '6px',
        md: '8px',
      },
    },
  },
  plugins: [],
};
