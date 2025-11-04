import { useEffect, useState } from 'react';

function resolveInitialTheme() {
	if (typeof window === 'undefined') return 'light';
	const stored = localStorage.getItem('theme');
	if (stored === 'dark' || stored === 'light') return stored;
	return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export default function ModeToggle() {
	const [theme, setTheme] = useState(resolveInitialTheme);

	useEffect(() => {
		const root = window.document.documentElement;
		if (theme === 'dark') {
			root.classList.add('dark');
			localStorage.setItem('theme', 'dark');
		} else {
			root.classList.remove('dark');
			localStorage.setItem('theme', 'light');
		}
	}, [theme]);

	return (
		<div className="inline-flex items-center overflow-hidden rounded-full border border-white/70 bg-white/75 p-0.5 text-xs font-medium shadow-[0_12px_25px_rgba(150,140,255,0.2)] backdrop-blur-xl transition duration-500 dark:border-zinc-700 dark:bg-zinc-900/70">
			<button
				type="button"
				className={`rounded-full px-3 py-1 transition duration-500 ${
					theme === 'light'
						? 'bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-cyan-400 text-white shadow-[0_12px_22px_rgba(118,128,255,0.32)]'
						: 'text-zinc-500 dark:text-zinc-300'
				}`}
				onClick={() => setTheme('light')}
				aria-pressed={theme === 'light'}
			>
				Light
			</button>
			<button
				type="button"
				className={`rounded-full px-3 py-1 transition duration-500 ${
					theme === 'dark'
						? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow'
						: 'text-zinc-500 dark:text-zinc-300'
				}`}
				onClick={() => setTheme('dark')}
				aria-pressed={theme === 'dark'}
			>
				Dark
			</button>
		</div>
	);
}



