/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './ContentBlocks/**/*.html',
        './Resources/Private/**/*.html',
        './Resources/Public/Assets/Src/**/*.js',
        './Classes/**/*.php',
        './Configuration/**/*.typoscript',
        './Configuration/**/*.yaml',
    ],
    safelist: [
        'link-fixed',
    ],
    theme: {
        extend: {
            fontFamily: {
                // Adobe Fonts kit icw4udj, loaded via page.includeCSSLibs.
                sans: ['adelle-sans', 'Helvetica Neue', 'Arial', 'sans-serif'],
            },
            colors: {
                lilac: '#b3a6da',
                badge: '#a82d74',
                ink: '#1a1a1a',
                'spitex-green': '#009e5c',
                'spitex-blue': '#0091d0',
            },
        },
    },
    plugins: [],
};