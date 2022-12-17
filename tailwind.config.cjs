/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.tsx'],
  theme: {
    colors: {
      primary: {
        100:"#A4393C",
        200:"#FDACAE",
        300:"#D46D6F",
        400:"#82191B",
        500:"#570204",
      },
      secondary1: {
        100:"#236562",
        200:"#6A9D9B",
        300:"#438280",
        400:"#0F504D",
        500:"#013634",
      },
      secondary2: {
        100:"#7A9B36",
        200:"#D6EFA2",
        300:"#A9C867",
        400:"#5B7B17",
        500:"#385202",
      },
      complement: {
        100: "#33862E",
        200: "#90CF8D",
        300: "#5DAD59",
        400: "#186A14",
        500: "#054701",
      },
      lightgray: "rgb(0 0 0 / 10)",
      white: '#FFF'
    },
    spacing: {
      '1': '2px',
      '2': '4px',
      '3': '8px',
      '4': '16px',
      '5': '24px',
      '6': '32px',
      '7': '40px',
    },
    width: {
      '192': '192px'
    },
    transitionProperty: {
      'outline': 'outline'
      'width': 'width'
    },
    gridTemplateColumns: {
      'top-toolbar': '280px calc(10em + var(--space-base) * 2) calc(32px + var(--space-base) * 2) 1fr 48px'
    },
    extend: {},
  },
  plugins: [],
}
