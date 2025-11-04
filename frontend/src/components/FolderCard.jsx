import { motion } from 'framer-motion';

const PencilIcon = (props) => (
	<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...props}>
		<path d="M12 20h9" />
		<path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z" />
	</svg>
);

const TrashIcon = (props) => (
	<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...props}>
		<polyline points="3 6 5 6 21 6" />
		<path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
		<path d="M10 11v6" />
		<path d="M14 11v6" />
		<path d="M10 6V4a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2v2" />
	</svg>
);

const CheckIcon = (props) => (
	<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
		<path d="m5 13 4 4L19 7" />
	</svg>
);

const XIcon = (props) => (
	<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
		<path d="M18 6 6 18" />
		<path d="M6 6l12 12" />
	</svg>
);

export default function FolderCard({
	folder,
	isActive,
	isEditing,
	editingValue,
	onEditingChange,
	onSelect,
	onStartRename,
	onConfirmRename,
	onCancelRename,
	onDelete,
}) {
	return (
		<motion.div
			whileHover={isEditing ? undefined : { scale: 1.015 }}
			className={`group flex cursor-pointer items-center gap-2 rounded-xl px-3 py-2 transition-all duration-200 ${
				isActive ? 'bg-indigo-500/20 text-indigo-600 dark:bg-indigo-400/25 dark:text-indigo-100' : 'text-zinc-600 hover:bg-white/70 dark:text-zinc-300 dark:hover:bg-zinc-800/70'
			}`}
			onDoubleClick={() => onStartRename(folder)}
		>
			{isEditing ? (
				<input
					value={editingValue}
					onChange={(e) => onEditingChange(e.target.value)}
					onKeyDown={(e) => {
						if (e.key === 'Enter') onConfirmRename(folder._id);
						if (e.key === 'Escape') onCancelRename();
					}}
					autoFocus={isEditing}
					className="flex-1 rounded-lg border border-indigo-300/70 bg-white/90 px-2 py-1 text-sm text-zinc-700 outline-none focus:ring-2 focus:ring-indigo-300 dark:border-indigo-400/50 dark:bg-zinc-900/80 dark:text-zinc-100"
				/>
			) : (
				<button
					onClick={() => onSelect(folder)}
					className={`flex-1 text-left text-sm capitalize transition ${isActive ? 'font-semibold' : ''}`}
				>
					{folder.name}
				</button>
			)}
			<div className="ml-auto flex items-center gap-1 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
				{isEditing ? (
					<>
						<button onClick={() => onConfirmRename(folder._id)} type="button" className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/90 text-white shadow-sm transition hover:brightness-110">
							<CheckIcon width={16} height={16} />
						</button>
						<button onClick={onCancelRename} type="button" className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-200 text-zinc-600 shadow-sm transition hover:bg-zinc-300 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700">
							<XIcon width={16} height={16} />
						</button>
					</>
				) : (
					<>
						<button onClick={() => onStartRename(folder)} type="button" className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-zinc-600 shadow-sm transition hover:bg-zinc-200 dark:bg-zinc-800/80 dark:text-zinc-200 dark:hover:bg-zinc-700">
							<PencilIcon width={16} height={16} />
						</button>
						<button onClick={() => onDelete(folder)} type="button" className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-rose-500 to-red-500 text-white shadow-sm transition hover:brightness-110">
							<TrashIcon width={16} height={16} />
						</button>
					</>
				)}
			</div>
		</motion.div>
	);
}


