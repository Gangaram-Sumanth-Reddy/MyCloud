import { useAuth } from '../context/AuthContext';
import ModeToggle from './ModeToggle';

export default function Navbar({ onSearch, onToggleSidebar }) {
	const { user, logout } = useAuth();
	return (
		<header className="sticky top-0 z-30 border-b border-transparent bg-white/60 shadow-sm backdrop-blur-lg transition dark:bg-black/50">
			<div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-4 sm:gap-5">
				<div className="flex items-center gap-3">
					<button
						type="button"
						onClick={onToggleSidebar}
						className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/40 bg-white/70 text-zinc-600 shadow-sm transition hover:bg-white/90 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-white/10 dark:bg-zinc-900/60 dark:text-zinc-200 dark:hover:bg-zinc-900/80 dark:focus:ring-indigo-500/40 lg:hidden"
						aria-label="Toggle navigation"
					>
						<span className="block h-0.5 w-5 rounded-full bg-current" />
						<span className="mt-1 block h-0.5 w-5 rounded-full bg-current" />
						<span className="mt-1 block h-0.5 w-5 rounded-full bg-current" />
					</button>
					<div className="flex items-center gap-2 lg:hidden">
						<span className="text-base font-semibold text-zinc-700 dark:text-zinc-200">Cloud Drive</span>
					</div>
					<div className="hidden items-center gap-3 lg:flex">
						<div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 via-fuchsia-500 to-orange-400 shadow-md" aria-hidden>
							<span className="text-lg font-bold text-white">CD</span>
						</div>
						<span className="bg-gradient-to-r from-indigo-400 via-fuchsia-500 to-orange-400 bg-clip-text text-xl font-semibold text-transparent">Cloud Drive</span>
					</div>
				</div>
				<div className="flex-1">
					<input onChange={(e) => onSearch?.(e.target.value)} placeholder="Search files..." className="w-full rounded-full border border-transparent bg-white/70 px-4 py-2 text-sm text-zinc-700 shadow-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 dark:bg-zinc-900/70 dark:text-zinc-100 dark:focus:ring-indigo-500/40" />
				</div>
				<div className="ml-auto flex items-center gap-3">
					<ModeToggle />
					{user && (
						<button onClick={logout} className="hidden rounded-full bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-orange-400 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:brightness-110 sm:block">
							Logout
						</button>
					)}
				</div>
			</div>
		</header>
	);
}


