import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.jsx',
    ],

    theme: {
        extend: {
            colors: {
                paper: '#FAF5EC',
                'paper-deep': '#F3ECDC',
                ink: '#221D18',
                'ink-soft': '#57504A',
                sienna: '#E97451',
                'sienna-deep': '#B84A2B',
                line: 'rgba(34, 29, 24, 0.12)',
                night: '#1B1611',
                'night-deep': '#241D16',
                'night-card': '#2A231C',
                cream: '#F3ECDC',
                'cream-soft': '#CFC6B4',
                'line-dark': 'rgba(250, 245, 236, 0.14)',
                'pearls-white': '#FAF9F6',
                'nacre-cream': '#F5EFE6',
                'abyssal-gold': '#D4AF37',
                'signal-orange': '#FF6B2B',
                'abyssal-black': '#0D0E11',
                'abyssal-card': '#14161C',
                'abyssal-line': 'rgba(212, 175, 55, 0.15)',
            },
            fontFamily: {
                display: ['"Bricolage Grotesque"', 'Georgia', 'serif'],
                serif: ['"Newsreader"', 'Georgia', 'serif'],
                mono: [
                    'ui-monospace',
                    'SFMono-Regular',
                    'Menlo',
                    'Monaco',
                    'Consolas',
                    '"Liberation Mono"',
                    '"Courier New"',
                    'monospace',
                ],
            },
        },
    },

    plugins: [forms],
};
