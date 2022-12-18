/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.tsx', './src/*.tsx'],
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
      darkgray: "#404040",
      gray: "#808080",
      lightgray: "#C0C0C0",
      'darkgray-alpha': "rgb(0 0 0 / 60%)",
      'gray-alpha': "rgb(0 0 0 / 40%)",
      'lightgray-alpha': "rgb(0 0 0 / 10%)",
      white: '#FFF'
    },
    extend: {
      transitionProperty: {
        'outline': 'outline',
        'width': 'width',
        'height': 'height',
      },
      gridTemplateColumns: {
        'top-toolbar': '360px max-content min-content 1fr min-content'
      },
    },
  },
  plugins: [],
}
