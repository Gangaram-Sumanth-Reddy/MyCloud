export default function AuthLoader() {
	return (
		<div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-transparent text-sm text-zinc-500 dark:text-zinc-400">
			<span className="inline-flex h-12 w-12 animate-spin items-center justify-center rounded-full border-2 border-indigo-400/60 border-t-transparent" aria-hidden="true" />
			<p className="text-sm font-medium">Securing your workspace…</p>
		</div>
	);
}

