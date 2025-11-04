/** @type {import('tailwindcss').Config} */
export default {
	darkMode: 'class',
	content: [
		'./index.html',
		'./src/**/*.{js,jsx,ts,tsx}',
	],
	theme: {
		extend: {
			fontFamily: {
				sans: ['Inter', 'system-ui', 'sans-serif'],
			},
			colors: {
				primary: {
					DEFAULT: '#6366f1',
					foreground: '#ffffff',
				},
				glass: {
					light: 'rgba(255, 255, 255, 0.68)',
					dark: 'rgba(17, 17, 27, 0.72)',
				},
			},
			boxShadow: {
				soft: '0 25px 45px rgba(15, 23, 42, 0.12)',
				neon: '0 0 30px rgba(129, 140, 248, 0.45)',
			},
			animation: {
				'gradient-move': 'gradient-move 12s ease infinite',
				'float-slow': 'float 20s ease-in-out infinite',
				'float-medium': 'float 26s ease-in-out infinite',
				'float-fast': 'float 32s ease-in-out infinite',
			},
			keyframes: {
				'gradient-move': {
					'0%': { backgroundPosition: '0% 50%' },
					'50%': { backgroundPosition: '100% 50%' },
					'100%': { backgroundPosition: '0% 50%' },
				},
				float: {
					'0%, 100%': { transform: 'translateY(0px) translateX(0px)' },
					'50%': { transform: 'translateY(-18px) translateX(12px)' },
				},
			},
		},
	},
	plugins: [],
}


