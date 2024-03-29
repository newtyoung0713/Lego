/** @type {import('tailwindcss').Config} */
module.exports = {
  mode: 'jit',
  content: [`./views/**/*.ejs`],
  theme: {
    extend: {},
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('daisyui'),
  ],
}

