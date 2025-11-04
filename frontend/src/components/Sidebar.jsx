import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { api } from '../api/client';
import FolderCard from './FolderCard';

export default function Sidebar({ activeFolder, onSelectFolder, onClose }) {
	const [folders, setFolders] = useState([]);
	const [name, setName] = useState('');
	const [editingId, setEditingId] = useState(null);
	const [editingName, setEditingName] = useState('');

	const fetchFolders = useCallback(async (focusId) => {
		const res = await api.get('/folders/list');
		setFolders(res.data.items);
		if (focusId) {
			const target = res.data.items.find((f) => f._id === focusId);
			if (target) {
				setEditingId(target._id);
				setEditingName(target.name);
			}
		}
	}, []);

	useEffect(() => {
		fetchFolders();
	}, [fetchFolders]);

	const createFolder = async (e) => {
		e.preventDefault();
		if (!name.trim()) return;
		try {
			const { data } = await api.post('/folders/create', { name });
			setName('');
			await fetchFolders(data._id);
			onSelectFolder(data.name);
			onClose?.();
			toast.success('Folder created');
		} catch (err) {
			toast.error(err?.response?.data?.message || 'Could not create folder');
		}
	};

	const startRename = (folder) => {
		setEditingId(folder._id);
		setEditingName(folder.name);
	};

	const cancelRename = () => {
		setEditingId(null);
		setEditingName('');
	};

	const commitRename = async (id) => {
		const target = folders.find((f) => f._id === id);
		if (!target) return;
		const trimmed = editingName.trim();
		if (!trimmed || trimmed === target.name) {
			cancelRename();
			return;
		}
		try {
			await api.patch(`/folders/${id}`, { name: trimmed });
			await fetchFolders();
			if (activeFolder === target.name) onSelectFolder(trimmed);
			toast.success('Folder renamed');
		} catch (err) {
			toast.error(err?.response?.data?.message || 'Could not rename folder');
		}
		cancelRename();
	};

	const removeFolder = async (folder) => {
		if (!window.confirm(`Delete folder "${folder.name}"? Files must be removed first.`)) return;
		try {
			await api.delete(`/folders/${folder._id}`);
			await fetchFolders();
			cancelRename();
			if (activeFolder === folder.name) {
				onSelectFolder('root');
				onClose?.();
			}
			toast.success('Folder deleted');
		} catch (err) {
			toast.error(err?.response?.data?.message || 'Could not delete folder');
		}
	};

	return (
		<aside className="w-full shrink-0 rounded-3xl border border-white/40 bg-white/60 p-6 shadow-lg backdrop-blur-md transition-colors duration-300 dark:border-white/10 dark:bg-zinc-950/60 md:w-72">
			<h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">Folders</h2>
			<ul className="space-y-2">
				<li>
					<button
						onClick={() => {
							onSelectFolder('root');
							onClose?.();
						}}
						className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200 ${
							activeFolder === 'root'
								? 'bg-indigo-500/20 text-indigo-600 shadow-sm dark:bg-indigo-400/25 dark:text-indigo-100'
								: 'text-zinc-600 hover:bg-white/70 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800/70'
						}`}
					>
						Root
					</button>
				</li>
				{folders.map((folder) => {
					const isEditing = editingId === folder._id;
					return (
						<li key={folder._id}>
							<FolderCard
								folder={folder}
								isActive={activeFolder === folder.name}
								isEditing={isEditing}
								editingValue={isEditing ? editingName : folder.name}
								onEditingChange={setEditingName}
								onSelect={(target) => {
									onSelectFolder(target.name);
									onClose?.();
								}}
								onStartRename={startRename}
								onConfirmRename={commitRename}
								onCancelRename={cancelRename}
								onDelete={removeFolder}
							/>
						</li>
					);
				})}
			</ul>
			<form onSubmit={createFolder} className="mt-6 flex flex-col gap-3">
				<input
					value={name}
					onChange={(e) => setName(e.target.value)}
					placeholder="Create new folder"
					className="w-full rounded-2xl border border-white/40 bg-white/85 px-4 py-2 text-sm text-zinc-600 shadow-[0_20px_40px_rgba(15,23,42,0.12)] outline-none transition focus:border-indigo-300 focus:ring-4 focus:ring-indigo-200/60 dark:border-white/15 dark:bg-zinc-900/70 dark:text-zinc-100 dark:focus:ring-indigo-500/30"
				/>
				<button
					type="submit"
					className="relative isolate self-center overflow-hidden rounded-2xl border border-white/50 bg-gradient-to-r from-indigo-500/90 via-fuchsia-500/85 to-cyan-400/90 px-8 py-2 text-sm font-semibold text-white shadow-[0_24px_48px_rgba(99,102,241,0.28)] backdrop-blur-xl transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_30px_55px_rgba(99,102,241,0.32)] dark:border-white/20"
				>
					Add
				</button>
			</form>
		</aside>
	);
}


