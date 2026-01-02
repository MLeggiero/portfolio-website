/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                background: '#0F172A', // Slate 900
                surface: '#1E293B',    // Slate 800
                primary: '#2c4de4ff',    // Red 500
                text: '#F1F5F9',       // Slate 100
                'text-muted': '#94A3B8', // Slate 400
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
                heading: ['Montserrat', 'system-ui', 'sans-serif'],
            },
        },
    },
    plugins: [],
}
