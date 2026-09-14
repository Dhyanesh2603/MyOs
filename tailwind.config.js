/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        surface: {
          canvas: 'rgb(var(--surface-canvas) / <alpha-value>)',
          panel: 'rgb(var(--surface-panel) / <alpha-value>)',
          overlay: 'rgb(var(--surface-overlay) / <alpha-value>)',
          glass: 'rgb(var(--surface-glass) / <alpha-value>)',
          subtle: 'rgb(var(--surface-subtle) / <alpha-value>)',
        },
        content: {
          primary: 'rgb(var(--content-primary) / <alpha-value>)',
          secondary: 'rgb(var(--content-secondary) / <alpha-value>)',
          tertiary: 'rgb(var(--content-tertiary) / <alpha-value>)',
          inverse: 'rgb(var(--content-inverse) / <alpha-value>)',
        },
        accent: {
          primary: 'rgb(var(--accent-primary) / <alpha-value>)',
          hover: 'rgb(var(--accent-hover) / <alpha-value>)',
          muted: 'rgb(var(--accent-muted) / <alpha-value>)',
        },
        border: {
          subtle: 'rgb(var(--border-subtle) / <alpha-value>)',
          strong: 'rgb(var(--border-strong) / <alpha-value>)',
        },
      },
      borderRadius: {
        window: 'var(--radius-window, 1rem)',
        dock: 'var(--radius-dock, 1.25rem)',
        control: 'var(--radius-control, 0.5rem)',
      },
      boxShadow: {
        window: 'var(--shadow-window)',
        dock: 'var(--shadow-dock)',
        glow: 'var(--shadow-glow)',
      },
      backdropBlur: {
        window: 'var(--blur-window, 16px)',
        dock: 'var(--blur-dock, 20px)',
      },
      fontFamily: {
        sans: [
          'InterVariable',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
        mono: [
          'JetBrains Mono',
          'Fira Code',
          'ui-monospace',
          'SFMono-Regular',
          'monospace',
        ],
      },
    },
  },
  plugins: [],
};
