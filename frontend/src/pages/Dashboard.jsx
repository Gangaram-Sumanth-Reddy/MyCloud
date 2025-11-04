import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import UploadArea from '../components/UploadArea';
import FileTable from '../components/FileTable';
import StorageBar from '../components/StorageBar';
import { api } from '../api/client';

const DEFAULT_STORAGE_LIMIT = 2 * 1024 * 1024 * 1024; // 2GB

export default function Dashboard() {
	const [files, setFiles] = useState([]);
	const [search, setSearch] = useState('');
	const [folder, setFolder] = useState('root');
	const [usage, setUsage] = useState({ usedStorageBytes: 0, storageLimitBytes: DEFAULT_STORAGE_LIMIT });
	const [sidebarOpen, setSidebarOpen] = useState(false);

	const fetchFiles = async () => {
		const res = await api.get('/files/list', { params: { search, folder } });
		setFiles(res.data.items);
		const u = res.data.usage || {};
		setUsage({
			usedStorageBytes: u.usedStorageBytes || 0,
			storageLimitBytes: u.storageLimitBytes && u.storageLimitBytes > 0 ? u.storageLimitBytes : DEFAULT_STORAGE_LIMIT,
		});
	};

	useEffect(() => {
		fetchFiles();
	}, [search, folder]);

	return (
		<div className="flex min-h-dvh flex-col bg-transparent transition-colors duration-300">
			<Navbar onSearch={setSearch} onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />
			<div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-8 lg:flex-row lg:gap-8">
				<div className="hidden lg:block lg:w-72">
					<Sidebar activeFolder={folder} onSelectFolder={setFolder} />
				</div>
				<main className="flex flex-1 flex-col gap-6 pb-8">
					<motion.div layout className="w-full">
						<StorageBar used={usage.usedStorageBytes} limit={usage.storageLimitBytes} />
					</motion.div>
					<motion.div layout className="w-full">
						<UploadArea activeFolder={folder} onUploaded={fetchFiles} />
					</motion.div>
					<motion.div layout className="w-full">
						<FileTable files={files} onRefresh={fetchFiles} />
					</motion.div>
				</main>
			</div>

			<AnimatePresence>
				{sidebarOpen && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className="fixed inset-0 z-40 flex lg:hidden"
					>
						<div className="absolute inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
						<motion.div
							initial={{ x: -260, opacity: 0 }}
							animate={{ x: 0, opacity: 1 }}
							exit={{ x: -260, opacity: 0 }}
							transition={{ type: 'spring', stiffness: 260, damping: 26 }}
							className="relative z-10 h-full w-72 max-w-full p-4"
						>
							<Sidebar activeFolder={folder} onSelectFolder={setFolder} onClose={() => setSidebarOpen(false)} />
						</motion.div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}


