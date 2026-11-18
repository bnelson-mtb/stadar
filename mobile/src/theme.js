// Colour and font tokens. The web client defines the same colours in
// client/src/index.css (@theme); keep the two in step.
const colors = {
  night: { 950: '#07090e', 900: '#0d1219', 800: '#101620', 700: '#12171f' },
  radar: { 300: '#7ae6fb', 400: '#2ed3f2', 500: '#14b8d9' },
  ink: { 50: '#ffffff', 100: '#e6ebf2', 200: '#cdd6e0', 400: '#8b96a5', 500: '#5d6b7d', 600: '#3b4756' },
  rose: { 400: '#fb7185', 500: '#f43f5e', 600: '#e11d48' },
}

// One family per weight: Android ignores fontWeight on custom fonts.
const fonts = {
  display: 'Anton_400Regular',
  sans: 'Sora_400Regular',
  'sans-medium': 'Sora_500Medium',
  'sans-semibold': 'Sora_600SemiBold',
  'sans-bold': 'Sora_700Bold',
  'sans-extrabold': 'Sora_800ExtraBold',
}

module.exports = { colors, fonts }
