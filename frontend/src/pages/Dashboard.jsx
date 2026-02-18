import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import {
	ChevronRight,
	FileText,
	Folder as FolderIcon,
	Image as ImageIcon,
	LayoutGrid,
	List,
	MoreVertical,
	Plus,
	Search,
	Video,
} from 'lucide-react';
import useFileSystem from '../store/fileSystem';

const getFileIcon = (type = '') => {
	const normalized = type.toLowerCase();
	if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(normalized)) return ImageIcon;
	if (['mp4', 'mov', 'avi', 'webm'].includes(normalized)) return Video;
	return FileText;
};

const formatDate = (value) => format(new Date(value), 'MMM d, yyyy');

const createClientId = (prefix) =>
	crypto.randomUUID?.() || `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

export default function Dashboard() {
	const [viewMode, setViewMode] = useState('list');
	const [activeTab, setActiveTab] = useState('suggested');
	const [searchTerm, setSearchTerm] = useState('');
	const [isDragging, setIsDragging] = useState(false);
	const [fabOpen, setFabOpen] = useState(false);
	const [createModalOpen, setCreateModalOpen] = useState(false);
	const [uploadModalOpen, setUploadModalOpen] = useState(false);
	const [renameTarget, setRenameTarget] = useState(null);
	const [deleteTarget, setDeleteTarget] = useState(null);
	const [contextMenu, setContextMenu] = useState(null);
	const [newFolderName, setNewFolderName] = useState('');
	const [selectedFiles, setSelectedFiles] = useState([]);
	const [renameValue, setRenameValue] = useState('');

	const breadcrumbs = useFileSystem((state) => state.getBreadcrumbs());
	const folders = useFileSystem((state) => state.getCurrentFolders());
	const files = useFileSystem((state) => state.getCurrentFiles());
	const currentFolderId = useFileSystem((state) => state.currentFolderId);
	const openFolder = useFileSystem((state) => state.setCurrentFolder);
	const createFolder = useFileSystem((state) => state.createFolder);
	const createFiles = useFileSystem((state) => state.createFiles);
	const renameItem = useFileSystem((state) => state.renameItem);
	const deleteItem = useFileSystem((state) => state.deleteItem);
	const usage = useFileSystem((state) => state.getUsage());
	const uploads = useFileSystem((state) => state.uploads);
	const addUpload = useFileSystem((state) => state.addUpload);
	const updateUpload = useFileSystem((state) => state.updateUpload);
	const removeUpload = useFileSystem((state) => state.removeUpload);
	const addActivity = useFileSystem((state) => state.addActivity);
	const activities = useFileSystem((state) => state.activities);

	const filteredFolders = useMemo(() => {
		if (!searchTerm) return folders;
		const term = searchTerm.toLowerCase();
		return folders.filter((folder) => folder.name.toLowerCase().includes(term));
	}, [folders, searchTerm]);

	const filteredFiles = useMemo(() => {
		if (!searchTerm) return files;
		const term = searchTerm.toLowerCase();
		return files.filter((file) => file.name.toLowerCase().includes(term));
	}, [files, searchTerm]);

	const fileInputRef = useRef(null);
	const uploadTimersRef = useRef({});

	useEffect(() => {
		const handleCloseMenu = () => setContextMenu(null);
		if (contextMenu) {
			document.addEventListener('click', handleCloseMenu);
		}
		return () => document.removeEventListener('click', handleCloseMenu);
	}, [contextMenu]);

	useEffect(
		() => () => {
			Object.values(uploadTimersRef.current).forEach((timer) => clearInterval(timer));
			uploadTimersRef.current = {};
		},
		[]
	);

	const runUpload = (meta) => {
		const uploadId = createClientId('upl');
		addUpload({ id: uploadId, name: meta.name, type: meta.type, progress: 0 });
		let progress = 0;
		const tick = () => {
			progress = Math.min(progress + Math.random() * 25 + 15, 100);
			updateUpload(uploadId, Math.round(progress));
			if (progress >= 100) {
				clearInterval(uploadTimersRef.current[uploadId]);
				delete uploadTimersRef.current[uploadId];
			removeUpload(uploadId);
			createFiles([meta]);
			addActivity({ type: 'Uploaded file', name: meta.name });
			toast.success(`Upload complete: ${meta.name}`);
			}
		};
		const timer = setInterval(tick, 260);
		uploadTimersRef.current[uploadId] = timer;
		tick();
	};

	const handleShare = async (item) => {
		const link = `https://nimbus-cloud.app/share/${item.id}`;
		try {
			await navigator.clipboard.writeText(link);
			toast.success('Link copied to clipboard');
			addActivity({ type: 'Shared', name: item.name });
		} catch (error) {
			toast.error('Unable to copy link');
		}
	};

	const handleCreateFolder = (event) => {
		event.preventDefault();
		if (!newFolderName.trim()) return;
		createFolder(newFolderName.trim(), currentFolderId);
		addActivity({ type: 'Created folder', name: newFolderName.trim() });
		toast.success('Folder created');
		setNewFolderName('');
		setCreateModalOpen(false);
	};

	const handleFilesSelected = (event) => {
		const filesToUpload = Array.from(event.target.files || []);
		const mapped = filesToUpload.map((file) => ({
			name: file.name,
			type: file.name.split('.').pop() || file.type,
			size: file.size,
			createdAt: new Date().toISOString(),
			url: URL.createObjectURL(file),
		}));
		setSelectedFiles((previous) => {
			if (typeof URL !== 'undefined') {
				previous.forEach((item) => URL.revokeObjectURL(item.url));
			}
			return mapped;
		});
	};

	const handleUploadConfirm = () => {
		if (selectedFiles.length === 0) return;
		selectedFiles.forEach(runUpload);
		setSelectedFiles([]);
		if (fileInputRef.current) fileInputRef.current.value = '';
		setUploadModalOpen(false);
	};

	const handleRenameConfirm = () => {
		if (!renameTarget || !renameValue.trim()) return;
		const previous = renameItem(renameTarget.id, renameTarget.type, renameValue.trim());
		addActivity({ type: 'Renamed', name: renameValue.trim(), previous });
		toast.success('Name updated');
		setRenameTarget(null);
	};

	const handleDeleteConfirm = () => {
		if (!deleteTarget) return;
		const removed = deleteItem(deleteTarget.id, deleteTarget.type);
		addActivity({ type: 'Deleted', name: removed?.name || deleteTarget.name });
		toast.success('Moved to trash');
		setDeleteTarget(null);
	};

	const openContext = (event, item, type) => {
		event.stopPropagation();
		event.preventDefault();
		const rect = event.currentTarget.getBoundingClientRect();
		setContextMenu({
			id: item.id,
			type,
			name: item.name,
			x: rect.right,
			y: rect.bottom,
		});
		setRenameValue(item.name);
	};

	const handleDragOver = (event) => {
		event.preventDefault();
		if (event.dataTransfer?.items?.length) setIsDragging(true);
	};

	const handleDragLeave = (event) => {
		if (event.currentTarget.contains(event.relatedTarget)) return;
		setIsDragging(false);
	};

	const handleDrop = (event) => {
		event.preventDefault();
		setIsDragging(false);
		const dropped = Array.from(event.dataTransfer.files || []);
		if (!dropped.length) return;
		dropped.forEach((file) => {
			const meta = {
				name: file.name,
				type: file.name.split('.').pop() || file.type,
				size: file.size,
				createdAt: new Date().toISOString(),
				url: URL.createObjectURL(file),
			};
			runUpload(meta);
		});
	};

	return (
		<div className="relative min-h-dvh px-4 pb-24 pt-6 sm:px-6 lg:px-10">
			<header className="space-y-6">
				<div className="glass-panel-light flex items-center gap-3 px-5 py-3">
					<Search className="h-5 w-5 text-indigo-400" strokeWidth={1.5} />
					<input
						type="search"
						value={searchTerm}
						onChange={(event) => setSearchTerm(event.target.value)}
						placeholder="Search files & folders"
						className="flex-1 border-none bg-transparent text-sm text-zinc-700 placeholder:text-zinc-400 focus:outline-none"
					/>
				</div>

				<nav className="flex flex-wrap items-center gap-2 text-xs font-medium text-zinc-500">
					{breadcrumbs.map((crumb, index) => (
						<div key={crumb.id} className="flex items-center gap-2">
							{index !== 0 && <ChevronRight className="h-4 w-4 text-zinc-400" strokeWidth={1.5} />}
							<button
								onClick={() => openFolder(crumb.id)}
								className={`transition hover:text-indigo-500 ${crumb.id === currentFolderId ? 'text-indigo-500' : ''}`}
							>
								{crumb.name}
							</button>
						</div>
					))}
				</nav>

				<div className="flex flex-wrap items-center justify-between gap-3">
					<div className="glass-panel-light inline-flex items-center gap-2 border border-white/60 px-1.5 py-1">
						{['suggested', 'activity'].map((tab) => (
							<button
								key={tab}
								className={`rounded-full px-4 py-1 text-xs font-semibold capitalize transition ${
									tab === activeTab ? 'bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-cyan-400 text-white shadow-[0_12px_24px_rgba(118,128,255,0.22)]' : 'text-zinc-500'
								}`}
								onClick={() => setActiveTab(tab)}
							>
								{tab}
							</button>
						))}
					</div>
					<div className="glass-panel-light inline-flex items-center gap-2 border border-white/60 px-1.5 py-1">
						<button
							onClick={() => setViewMode('list')}
							className={`rounded-full px-4 py-1 text-xs font-semibold transition ${
								viewMode === 'list' ? 'bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-cyan-400 text-white shadow-[0_12px_24px_rgba(118,128,255,0.22)]' : 'text-zinc-500'
							}`}
						>
							<List className="mr-2 inline h-4 w-4" strokeWidth={1.5} /> List
						</button>
						<button
							onClick={() => setViewMode('grid')}
							className={`rounded-full px-4 py-1 text-xs font-semibold transition ${
								viewMode === 'grid' ? 'bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-cyan-400 text-white shadow-[0_12px_24px_rgba(118,128,255,0.22)]' : 'text-zinc-500'
							}`}
						>
							<LayoutGrid className="mr-2 inline h-4 w-4" strokeWidth={1.5} /> Grid
						</button>
					</div>
				</div>
			</header>

			<section
				className={`mt-10 space-y-6 rounded-[32px] transition ${
					isDragging ? 'ring-2 ring-indigo-400/60 ring-offset-2 ring-offset-white/40 dark:ring-offset-zinc-900/40' : ''
				}`}
				onDragOver={handleDragOver}
				onDragEnter={handleDragOver}
				onDragLeave={handleDragLeave}
				onDrop={handleDrop}
			>
				<div className="glass-panel-light border border-white/60 px-6 py-5">
					<div className="flex flex-wrap items-center justify-between gap-4">
						<div>
							<p className="text-xs uppercase tracking-[0.3em] text-indigo-500/80">Storage</p>
							<h2 className="mt-2 text-lg font-semibold text-zinc-800">
								{(usage.usedStorageBytes / 1024 / 1024).toFixed(1)} MB / {(usage.storageLimitBytes / 1024 / 1024 / 1024).toFixed(1)} GB
							</h2>
							<p className="text-xs text-zinc-500">Plan includes premium 2 GB glass storage.</p>
						</div>
						<div className="h-2 w-full rounded-full bg-white/60 sm:w-52">
							<div
								className="h-2 rounded-full bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-cyan-400 transition-[width] duration-500 ease-out"
								style={{ width: `${Math.min(100, Math.round((usage.usedStorageBytes / usage.storageLimitBytes) * 100))}%` }}
							/>
						</div>
					</div>
				</div>

				{activeTab === 'activity' ? (
					<div className="space-y-3">
						{activities.length === 0 && (
							<div className="glass-panel-light border border-white/60 px-5 py-4 text-sm text-zinc-500">
								No activity yet.
							</div>
						)}
						{activities.map((entry) => (
							<div key={entry.id} className="glass-panel-light border border-white/60 px-5 py-4 text-sm text-zinc-600">
								<p className="font-semibold capitalize text-zinc-700">{entry.type}</p>
								<p className="text-xs text-zinc-500">{entry.name}</p>
								<p className="mt-1 text-xs text-zinc-400">{formatDate(entry.timestamp)}</p>
							</div>
						))}
					</div>
				) : viewMode === 'list' ? (
					<div className="space-y-4">
						{filteredFolders.map((folder) => (
							<motion.button
								key={folder.id}
								whileHover={{ scale: 1.01 }}
								onClick={() => openFolder(folder.id)}
								className="glass-panel-light flex w-full items-center justify-between border border-white/60 px-5 py-4 text-left hover:border-indigo-300/70 hover:shadow-[0_20px_36px_rgba(118,128,255,0.18)]"
							>
								<div className="flex items-center gap-4">
									<div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/70 bg-white/55 text-indigo-500 shadow-[0_16px_30px_rgba(118,128,255,0.2)]">
										<FolderIcon className="h-5 w-5" strokeWidth={1.5} />
									</div>
									<div>
										<p className="text-sm font-semibold text-zinc-800">{folder.name}</p>
										<p className="text-xs text-zinc-500">Opened • {formatDate(folder.createdAt)}</p>
									</div>
								</div>
								<button
									onClick={(event) => openContext(event, folder, 'folder')}
									className="rounded-full border border-white/60 bg-white/70 p-2 text-zinc-500 transition hover:border-indigo-300 hover:text-indigo-500"
								>
									<MoreVertical className="h-4 w-4" strokeWidth={1.5} />
								</button>
							</motion.button>
						))}
						{filteredFiles.map((file) => {
							const Icon = getFileIcon(file.type);
							return (
								<motion.div
									key={file.id}
									className="glass-panel-light flex items-center justify-between border border-white/60 px-5 py-4 hover:border-indigo-300/70 hover:shadow-[0_20px_36px_rgba(118,128,255,0.18)]"
								>
									<div className="flex items-center gap-4">
										<div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/70 bg-white/55 text-indigo-500 shadow-[0_16px_30px_rgba(118,128,255,0.2)]">
											<Icon className="h-5 w-5" strokeWidth={1.5} />
										</div>
										<div>
											<p className="text-sm font-semibold text-zinc-800">{file.name}</p>
											<p className="text-xs text-zinc-500">Uploaded • {formatDate(file.createdAt)}</p>
										</div>
									</div>
									<button
										onClick={(event) => openContext(event, file, 'file')}
										className="rounded-full border border-white/60 bg-white/70 p-2 text-zinc-500 transition hover:border-indigo-300 hover:text-indigo-500"
									>
										<MoreVertical className="h-4 w-4" strokeWidth={1.5} />
									</button>
								</motion.div>
							);
						})}
						{filteredFolders.length === 0 && filteredFiles.length === 0 && (
							<div className="glass-panel-light border border-white/60 px-5 py-6 text-center text-sm text-zinc-500">
								No items match “{searchTerm}”.
							</div>
						)}
					</div>
				) : (
					<div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
						{filteredFolders.map((folder) => (
							<motion.button
								key={folder.id}
								whileHover={{ scale: 1.02 }}
								onClick={() => openFolder(folder.id)}
								className="glass-panel-light flex flex-col gap-3 border border-white/60 px-5 py-6 text-left hover:border-indigo-300/70 hover:shadow-[0_20px_36px_rgba(118,128,255,0.18)]"
							>
								<div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/70 bg-white/55 text-indigo-500 shadow-[0_16px_30px_rgba(118,128,255,0.2)]">
									<FolderIcon className="h-5 w-5" strokeWidth={1.5} />
								</div>
								<div>
									<p className="text-sm font-semibold text-zinc-800">{folder.name}</p>
									<p className="text-xs text-zinc-500">Opened • {formatDate(folder.createdAt)}</p>
								</div>
							</motion.button>
						))}
						{filteredFiles.map((file) => {
							const Icon = getFileIcon(file.type);
							return (
								<motion.div
									key={file.id}
									className="glass-panel-light flex flex-col gap-3 border border-white/60 px-5 py-6 hover:border-indigo-300/70 hover:shadow-[0_20px_36px_rgba(118,128,255,0.18)]"
								>
									<div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/70 bg-white/55 text-indigo-500 shadow-[0_16px_30px_rgba(118,128,255,0.2)]">
										<Icon className="h-5 w-5" strokeWidth={1.5} />
									</div>
									<div>
										<p className="text-sm font-semibold text-zinc-800">{file.name}</p>
										<p className="text-xs text-zinc-500">Uploaded • {formatDate(file.createdAt)}</p>
									</div>
								</motion.div>
							);
						})}
						{filteredFolders.length === 0 && filteredFiles.length === 0 && (
							<div className="glass-panel-light border border-white/60 px-5 py-6 text-center text-sm text-zinc-500">
								No items match “{searchTerm}”.
							</div>
						)}
					</div>
				)}
			</section>

			{/* Floating Action Button */}
			<div className="fixed bottom-24 right-6 z-40">
				<AnimatePresence>
					{fabOpen && (
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: 20 }}
							transition={{ duration: 0.2 }}
							className="mb-4 space-y-2"
						>
							<button
								onClick={() => {
									setUploadModalOpen(true);
									setFabOpen(false);
								}}
								className="glass-panel-light block w-48 border border-white/60 px-5 py-2 text-left text-sm font-semibold text-zinc-700 shadow-[0_18px_32px_rgba(118,128,255,0.18)]"
							>
								Upload File
							</button>
							<button
								onClick={() => {
									setCreateModalOpen(true);
									setFabOpen(false);
								}}
								className="glass-panel-light block w-48 border border-white/60 px-5 py-2 text-left text-sm font-semibold text-zinc-700 shadow-[0_18px_32px_rgba(118,128,255,0.18)]"
							>
								Create Folder
							</button>
							<button
								onClick={() => {
									toast.info('Camera import coming soon');
									setFabOpen(false);
								}}
								className="glass-panel-light block w-48 border border-white/60 px-5 py-2 text-left text-sm font-semibold text-zinc-700 shadow-[0_18px_32px_rgba(118,128,255,0.18)]"
							>
								Import from Camera
							</button>
						</motion.div>
					)}
				</AnimatePresence>
				<button
					onClick={() => setFabOpen((prev) => !prev)}
					className="glass-panel-light flex h-14 w-14 items-center justify-center rounded-full border border-white/60 bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-cyan-400 text-white shadow-[0_24px_50px_rgba(99,102,241,0.32)]"
				>
					<Plus className="h-6 w-6" />
				</button>
			</div>

			{/* Context Menu */}
			{contextMenu && (
				<div
					className="glass-panel-light fixed z-50 w-40 border border-white/60 text-sm shadow-[0_18px_32px_rgba(118,128,255,0.18)]"
					style={{ top: contextMenu.y + 8, left: contextMenu.x - 160 }}
				>
					<button
						onClick={() => {
							setRenameTarget({ id: contextMenu.id, type: contextMenu.type });
							setRenameValue(contextMenu.name);
							setContextMenu(null);
						}}
						className="block w-full px-4 py-2 text-left text-zinc-600 transition hover:text-indigo-500"
					>
						Rename
					</button>
					<button
						onClick={() => {
							setDeleteTarget({ id: contextMenu.id, type: contextMenu.type, name: contextMenu.name });
							setContextMenu(null);
						}}
						className="block w-full px-4 py-2 text-left text-zinc-600 transition hover:text-indigo-500"
					>
						Delete
					</button>
					<button
						onClick={() => {
							handleShare({ id: contextMenu.id, name: contextMenu.name });
							setContextMenu(null);
						}}
						className="block w-full px-4 py-2 text-left text-zinc-600 transition hover:text-indigo-500"
					>
						Share
					</button>
				</div>
			)}

			{/* Upload Progress Overlay */}
			{uploads.length > 0 && (
				<div className="fixed bottom-24 left-6 z-40 w-72 space-y-3">
					{uploads.map((upload) => {
						const Icon = getFileIcon(upload.type);
						return (
							<div key={upload.id} className="glass-panel-light border border-white/60 px-4 py-3 shadow-[0_18px_32px_rgba(118,128,255,0.18)]">
								<div className="flex items-center gap-3">
									<div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/60 bg-white/70 text-indigo-500">
										<Icon className="h-4 w-4" strokeWidth={1.5} />
									</div>
									<div className="flex-1">
										<p className="truncate text-xs font-semibold text-zinc-700">{upload.name}</p>
										<div className="mt-2 h-1.5 w-full rounded-full bg-white/70">
											<div
												className="h-1.5 rounded-full bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-cyan-400 transition-[width] duration-300 ease-out"
												style={{ width: `${upload.progress}%` }}
											/>
										</div>
									</div>
									<span className="text-xs font-medium text-zinc-500">{upload.progress}%</span>
								</div>
							</div>
						);
					})}
				</div>
			)}

			{/* Create Folder Modal */}
			<AnimatePresence>
				{createModalOpen && (
					<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 grid place-items-center bg-black/40 px-4">
						<motion.form
							onSubmit={handleCreateFolder}
							initial={{ scale: 0.95, opacity: 0 }}
							animate={{ scale: 1, opacity: 1 }}
							exit={{ scale: 0.95, opacity: 0 }}
							className="glass-panel-light w-full max-w-sm border border-white/60 px-6 py-6 shadow-[0_24px_45px_rgba(118,128,255,0.22)]"
						>
							<h3 className="text-base font-semibold text-zinc-800">Create folder</h3>
							<input
								autoFocus
								value={newFolderName}
								onChange={(event) => setNewFolderName(event.target.value)}
								placeholder="Folder name"
								className="mt-4 w-full rounded-xl border border-white/60 bg-white/70 px-4 py-2 text-sm text-zinc-700 focus:border-indigo-300 focus:outline-none"
								required
							/>
							<div className="mt-6 flex justify-end gap-2 text-sm">
								<button type="button" onClick={() => setCreateModalOpen(false)} className="rounded-full border border-white/60 px-4 py-2 text-zinc-500 transition hover:border-zinc-400">
									Cancel
								</button>
								<button type="submit" className="rounded-full bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-cyan-400 px-4 py-2 font-semibold text-white shadow-[0_14px_35px_rgba(118,128,255,0.26)]">
									Create
								</button>
							</div>
						</motion.form>
					</motion.div>
				)}
			</AnimatePresence>

			{/* Upload Modal */}
			<AnimatePresence>
				{uploadModalOpen && (
					<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 grid place-items-center bg-black/40 px-4">
						<motion.div
							initial={{ scale: 0.95, opacity: 0 }}
							animate={{ scale: 1, opacity: 1 }}
							exit={{ scale: 0.95, opacity: 0 }}
							className="glass-panel-light w-full max-w-lg border border-white/60 px-6 py-6 shadow-[0_24px_45px_rgba(118,128,255,0.22)]"
						>
							<h3 className="text-base font-semibold text-zinc-800">Upload files</h3>
							<p className="mt-2 text-sm text-zinc-500">Select one or more files to upload into this folder.</p>
							<div className="mt-4 rounded-2xl border border-dashed border-white/60 bg-white/60 p-6 text-center text-sm text-zinc-500">
								<p>Drag & drop files here, or</p>
								<button
									onClick={() => fileInputRef.current?.click()}
									type="button"
									className="mt-2 rounded-full border border-white/60 px-4 py-1 text-indigo-500"
								>
									Browse files
								</button>
								<input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleFilesSelected} />
							</div>
							{selectedFiles.length > 0 && (
								<ul className="mt-4 space-y-2 text-sm text-zinc-600">
									{selectedFiles.map((file) => (
										<li key={file.name} className="flex items-center justify-between rounded-xl border border-white/60 bg-white/70 px-4 py-2">
											<span>{file.name}</span>
											<span className="text-xs text-zinc-400">{Math.round(file.size / 1024)} KB</span>
										</li>
									))}
								</ul>
							)}
							<div className="mt-6 flex justify-end gap-2 text-sm">
								<button
									type="button"
									onClick={() => {
										if (typeof URL !== 'undefined') {
											selectedFiles.forEach((item) => URL.revokeObjectURL(item.url));
										}
										setSelectedFiles([]);
										if (fileInputRef.current) fileInputRef.current.value = '';
										setUploadModalOpen(false);
									}}
									className="rounded-full border border-white/60 px-4 py-2 text-zinc-500 transition hover:border-zinc-400"
								>
									Cancel
								</button>
								<button disabled={selectedFiles.length === 0} onClick={handleUploadConfirm} className="rounded-full bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-cyan-400 px-4 py-2 font-semibold text-white shadow-[0_14px_35px_rgba(118,128,255,0.26)] disabled:opacity-50">
									Upload
								</button>
							</div>
						</motion.div>
					</motion.div>
				)}
			</AnimatePresence>

			{/* Rename Modal */}
			<AnimatePresence>
				{renameTarget && (
					<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 grid place-items-center bg-black/40 px-4">
						<motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="glass-panel-light w-full max-w-sm border border-white/60 px-6 py-6 shadow-[0_24px_45px_rgba(118,128,255,0.22)]">
							<h3 className="text-base font-semibold text-zinc-800">Rename</h3>
							<input
								autoFocus
								value={renameValue}
								onChange={(event) => setRenameValue(event.target.value)}
								className="mt-4 w-full rounded-xl border border-white/60 bg-white/70 px-4 py-2 text-sm text-zinc-700 focus:border-indigo-300 focus:outline-none"
							/>
							<div className="mt-6 flex justify-end gap-2 text-sm">
								<button type="button" onClick={() => setRenameTarget(null)} className="rounded-full border border-white/60 px-4 py-2 text-zinc-500 transition hover:border-zinc-400">
									Cancel
								</button>
								<button type="button" onClick={handleRenameConfirm} className="rounded-full bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-cyan-400 px-4 py-2 font-semibold text-white shadow-[0_14px_35px_rgba(118,128,255,0.26)]">
									Save
								</button>
							</div>
						</motion.div>
					</motion.div>
				)}
			</AnimatePresence>

			{/* Delete Confirm */}
			<AnimatePresence>
				{deleteTarget && (
					<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 grid place-items-center bg-black/40 px-4">
						<motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="glass-panel-light w-full max-w-sm border border-white/60 px-6 py-6 shadow-[0_24px_45px_rgba(118,128,255,0.22)]">
							<h3 className="text-base font-semibold text-zinc-800">Delete item</h3>
							<p className="mt-2 text-sm text-zinc-500">Are you sure you want to delete “{deleteTarget.name}”?</p>
							<div className="mt-6 flex justify-end gap-2 text-sm">
								<button type="button" onClick={() => setDeleteTarget(null)} className="rounded-full border border-white/60 px-4 py-2 text-zinc-500 transition hover:border-zinc-400">
									Cancel
								</button>
								<button type="button" onClick={handleDeleteConfirm} className="rounded-full bg-gradient-to-r from-rose-500 to-red-500 px-4 py-2 font-semibold text-white shadow-[0_14px_35px_rgba(244,63,94,0.26)]">
									Delete
								</button>
							</div>
						</motion.div>
					</motion.div>
				)}
			</AnimatePresence>

		</div>
	);
}


