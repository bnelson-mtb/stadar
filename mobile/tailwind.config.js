const { colors, fonts } = require('./src/theme.js')

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx}', '../packages/shared/**/*.js'],
  presets: [require('nativewind/preset')],
  // The app is always dark (app.json userInterfaceStyle). 'class' stops
  // NativeWind on web from fighting that over the OS colour scheme.
  darkMode: 'class',
  theme: {
    extend: {
      colors,
      fontFamily: Object.fromEntries(Object.entries(fonts).map(([k, v]) => [k, [v]])),
    },
  },
  plugins: [],
}
