/** @type {import('tailwindcss').Config} */

const colors = {
  primary: "#ef4444",
  'primary-focus': '#c22015',
  'primary-disabled': '#b0b0b0',
  secondary: '#faa460',
  black: '#475569',
  foreground: "#fff7ed",
  white: "#ffffff",
  grey: '#aaaaaa',
  'light-grey': '#cccccc',
  error: '#ff0000',
  confirmation: '#7fa449',
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
        'transaction-expense-table': 'repeat(4, minmax(0, 1fr)) min-content 128px',
        'subgrid': 'subgrid',
        '4-shrink': 'repeat(4, min-content)',
      },
      gridTemplateRows: {
        'subgrid': 'subgrid',
      },
      aspectRatio: {
        '4/1': '4 / 1',
        '1/4': '1 / 4',
      },
    },
  },
  daisyui: {
    themes: [
      {
        expensable: {
          ...colors,
          '.btn': {
            transition: '0.5s',
            'text-transform': 'uppercase',
          },
          '.btn-primary': {
            color: colors.white,
            '&:disabled': {
              backgroundColor: colors['primary-disabled'],
              color: colors.white,
            }
          },
          '.btn-outline.btn-primary:disabled': {
            color: colors['primary-disabled'],
            backgroundColor: 'inherit',
          },
          '.btn-outline.btn-primary:hover': {
            color: colors.white
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
