/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background:  '#111317',
        surface:     '#1e2024',
        'surface-low': '#1a1c20',
        'surface-high': '#282a2e',
        'surface-highest': '#333539',
        border:      '#424655',
        'border-dim': 'rgba(255,255,255,0.08)',
        primary:     '#b3c5ff',
        'primary-container': '#5e8bff',
        'on-primary': '#002b75',
        gain:        '#13ff43',
        'gain-dim':  'rgba(19,255,67,0.15)',
        loss:        '#ff5352',
        'loss-dim':  'rgba(255,83,82,0.15)',
        'on-surface': '#e2e2e8',
        'on-surface-muted': '#c2c6d8',
        outline:     '#8c90a1',
      },
      fontFamily: {
        headline: ['Hanken Grotesk', 'sans-serif'],
        body:     ['Inter', 'sans-serif'],
        mono:     ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        sm:  '0.125rem',
        DEFAULT: '0.25rem',
        md:  '0.375rem',
        lg:  '0.5rem',
        xl:  '0.75rem',
      },
    },
  },
  plugins: [],
};
