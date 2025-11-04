import { formatBytes } from '../api/client';

const DEFAULT_STORAGE_LIMIT = 2 * 1024 * 1024 * 1024; // 2GB

export default function StorageBar({ used = 0, limit = DEFAULT_STORAGE_LIMIT }) {
	const safeLimit = limit && limit > 0 ? limit : DEFAULT_STORAGE_LIMIT;
	const safeUsed = Math.max(0, used);
	const pct = safeLimit ? Math.min(100, Math.round((safeUsed / safeLimit) * 100)) : 0;
	return (
		<div className="glass-card dark:glass-card-dark p-4">
			<div className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
				<span>Storage</span>
				<span>{formatBytes(safeUsed)} / {formatBytes(safeLimit)} ({pct}%)</span>
			</div>
			<div
				className="h-2 w-full rounded-full bg-zinc-200/70 dark:bg-zinc-800/70"
				role="progressbar"
				aria-valuenow={pct}
				aria-valuemin={0}
				aria-valuemax={100}
			>
				<div
					className="h-2 rounded-full bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-orange-400 transition-[width] duration-500 ease-out"
					style={{ width: `${pct}%` }}
				/>
			</div>
		</div>
	);
}


