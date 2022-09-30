const colors = require('tailwindcss/colors')

module.exports = {
    mode: 'jit',
    purge: [
        './**/*.html',
        './**/*.cshtml',
        './**/*.razor'
    ],
    darkMode: 'media',
    theme: {
        extend: {
            colors: {
                cyan: colors.cyan
            }
        },
    },
    variants: {
        textShadow: ['responsive', 'hover', 'focus'],
    },
    plugins: [
    ]
}