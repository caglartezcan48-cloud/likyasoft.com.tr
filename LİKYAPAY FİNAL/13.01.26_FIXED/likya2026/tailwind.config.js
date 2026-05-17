/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./views/frontend/**/*.{js,ts,jsx,tsx}",
        "./views/home.php"
    ],
    theme: {
        extend: {
            fontFamily: { sans: ['Inter', 'sans-serif'] },
            colors: {
                brand: {
                    50: '#f0f9ff', 100: '#e0f2fe', 500: '#0ea5e9',
                    600: '#0284c7', 700: '#0369a1', 900: '#0c4a6e',
                },
                secondary: { 500: '#6366f1' }
            }
        }
    },
    plugins: [],
}
