/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.tsx', './src/*.tsx', './src/**/*.ts'],
  theme: {
    colors: {
      transparent: 'transparent',
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
      darkgray: "#404040",
      gray: "#808080",
      lightgray: "#D0D0D0",
      'darkgray-alpha': "rgb(0 0 0 / 60%)",
      'gray-alpha': "rgb(0 0 0 / 40%)",
      'lightgray-alpha': "rgb(0 0 0 / 10%)",
      white: '#FFF'
    },
    overflow: {
      'overlay': 'overlay'
    },
    extend: {
      keyframes: {
        'fade-in': {
          '0%': {opacity: 0, visibility: 'hidden'},
          '50%': {opacity: 0.5, visibility: 'visible'},
          '100%': {opacity: 1, visibility: 'visible'},
        },
        'fade-out': {
          '0%': {opacity: 1, visibility: 'visible'},
          '50%': {opacity: 0.5, visibility: 'visible'},
          '100%': {opacity: 0, visibility: 'hidden'},
        }
      },
      animation: {
        'fade-in': 'fade-in 0.1s ease-in-out 1',
        'fade-out': 'fade-out 0.1s ease-in-out 1',
      },
      transitionProperty: {
        'outline': 'outline',
        'width': 'width',
        'height': 'height',
        'stroke': 'stroke, stroke-width',
        'fill': 'fill',
      },
      gridTemplateColumns: {
        'top-toolbar': 'min-content 1fr min-content min-content',
        'project-toolbar': '20rem 1px 10rem 3rem',
      },
    },
  },
  plugins: [],
}
