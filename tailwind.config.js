/** @type {import('tailwindcss').Config} */

const colors = {
  primary: "#ef4444",
  'primary-focus': '#c22015',
  'primary-disabled': '#606060',
  secondary: '#faa460',
  black: '#475569',
  foreground: "#fff7ed",
  white: "#ffffff",
  grey: '#aaaaaa',
  'light-grey': '#cccccc',
  error: '#ff0000',
}

module.exports = {
  content: ["./app/**/*.{ts,tsx,jsx,js}"],
  theme: {
    screens: {
      xs: '350px',
      sm: '576px',
      md: '768px',
      lg: '976px',
      xl: '1180px',
      '2xl': '1440px',
      '3xl': '1680px',
    },
    fontFamily: {
      opensans: ['OpenSans', 'Arial', 'serif'],
    },
    fontSize: {
      '3xl': ['64px', '68px'],
      '2xl': ['46px', '50px'],
      xl: ['36px', '38px'],
      lg: ['30px', '36px'],
      md: ['24px', '32px'],
      sm: ['17px', '23px'],
      xs: ['14px', '18px'],
      xxs: ['11px', '13px'],
    },
    extend: {
      colors,
      transitionProperty: {
        height: 'max-height',
        'height-fade': 'max-height, opacity'
      },
      gridTemplateColumns: {
        '2-grow-left': 'minmax(0, 1fr) min-content',
      }
    },
  },
  daisyui: {
    themes: [
      {
        expensable: {
          ...colors,
          '.btn': {
            transition: '0.5s',
          },
          '.btn-primary': {
            color: '#ffffff'
          },
          '.btn-outline.btn-primary:hover': {
            color: '#ffffff'
          },
          '.btn-link': {
            'text-transform': 'none',
            'height': 'auto',
            'min-height': 'auto',
          },
          '.btn-link:hover': {
            'text-decoration-color': 'transparent',
          }
        }
      }
    ]
  },
  plugins: [require('daisyui')],
};
