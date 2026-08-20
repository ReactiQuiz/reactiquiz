/**
 * Tailwind CSS Configuration
 * 
 * Configures Tailwind CSS for the ReactiQuiz application.
 * Defines content paths for Tailwind's JIT compiler to scan for class names.
 * Customizes theme extensions and plugins.
 * 
 * @type {import('tailwindcss').Config}
 */
module.exports = {
	content: [
		'./public/index.html',
		'./src/**/*.{js,jsx,ts,tsx}',
		'./src/**/**/*.{js,jsx,ts,tsx}',
	],
	theme: {
		extend: {},
	},
	plugins: [],
};
