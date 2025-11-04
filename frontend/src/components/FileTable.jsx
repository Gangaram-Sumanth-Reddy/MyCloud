import { format } from 'date-fns';
import { api, formatBytes } from '../api/client';
import { toast } from 'react-toastify';

async function fetchFileBlob(path, fileName) {
	const response = await api.get(path, { responseType: 'blob' });
	const blobUrl = window.URL.createObjectURL(response.data);
	return { url: blobUrl, blob: response.data, fileName };
}

export default function FileTable({ files, onRefresh }) {
	const download = async (file) => {
		try {
			const { url } = await fetchFileBlob(`/files/download/${file._id}`, file.originalName);
			const anchor = document.createElement('a');
			anchor.href = url;
			anchor.download = file.originalName;
			document.body.appendChild(anchor);
			anchor.click();
			document.body.removeChild(anchor);
			window.URL.revokeObjectURL(url);
		} catch (err) {
			toast.error('Download failed');
		}
	};

	const preview = async (file) => {
		try {
			const { url } = await fetchFileBlob(`/files/preview/${file._id}`, file.originalName);
			const win = window.open(url, '_blank');
			if (!win) toast.info('Allow pop-ups to preview files.');
			setTimeout(() => window.URL.revokeObjectURL(url), 60_000);
		} catch (err) {
			toast.error('Preview failed');
		}
	};

	const remove = async (id) => {
		await api.delete(`/files/${id}`);
		toast.success('Deleted');
		onRefresh?.();
	};
	const rename = async (id) => {
		const name = window.prompt('New name');
		if (!name) return;
		await api.patch(`/files/rename/${id}`, { name });
		toast.success('Renamed');
		onRefresh?.();
	};

	const share = async (file) => {
		const shareUrl = `${window.location.origin}/share/${file._id}`;
		try {
			if (navigator.clipboard?.writeText) {
				await navigator.clipboard.writeText(shareUrl);
			} else {
				const temp = document.createElement('textarea');
				temp.value = shareUrl;
				temp.setAttribute('readonly', '');
				temp.style.position = 'absolute';
				temp.style.left = '-9999px';
				document.body.appendChild(temp);
				temp.select();
				document.execCommand('copy');
				document.body.removeChild(temp);
			}
			toast.success('Link copied to clipboard!');
		} catch (err) {
			toast.error('Could not copy link');
		}
	};

	const buttonBase = 'inline-flex items-center justify-center rounded-full border border-transparent px-4 py-1.5 text-xs font-semibold transition focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-500/50 shadow-sm';
	const neutralBtn = `${buttonBase} bg-white/85 text-zinc-600 hover:bg-white dark:bg-zinc-800/70 dark:text-zinc-100 dark:hover:bg-zinc-700`;
	const primaryBtn = `${buttonBase} bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-orange-400 text-white hover:brightness-110`;
	const outlineBtn = `${buttonBase} bg-white/70 text-indigo-600 hover:bg-white dark:bg-zinc-900/70 dark:text-indigo-200 dark:hover:bg-zinc-800`;
	const dangerBtn = `${buttonBase} bg-gradient-to-r from-rose-500 to-red-500 text-white hover:brightness-110`;
	const shareBtn = `${buttonBase} border border-fuchsia-200/60 bg-white/80 text-fuchsia-500 hover:border-fuchsia-400 hover:bg-white dark:border-fuchsia-400/40 dark:bg-zinc-900/70 dark:text-fuchsia-200 dark:hover:bg-zinc-800`;

	return (
		<div className="overflow-hidden rounded-3xl border border-white/40 bg-white/60 shadow-2xl backdrop-blur-md transition-colors duration-300 dark:border-white/10 dark:bg-zinc-950/60">
			<div className="overflow-x-auto">
				<table className="min-w-full text-sm">
					<thead className="bg-white/70 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:bg-zinc-900/70 dark:text-zinc-400">
						<tr>
							<th className="px-4 py-3">Name</th>
							<th className="px-4 py-3">Size</th>
							<th className="px-4 py-3">Uploaded</th>
							<th className="px-4 py-3">Actions</th>
						</tr>
					</thead>
					<tbody>
						{files.length === 0 ? (
							<tr>
								<td className="px-4 py-10 text-center text-sm text-zinc-500 dark:text-zinc-400" colSpan={4}>
									No files yet - drag and drop to upload your first file.
								</td>
							</tr>
						) : (
							files.map((f) => (
								<tr key={f._id} className="border-b border-white/30 transition hover:bg-white/70 dark:border-zinc-800 dark:hover:bg-zinc-900/70">
									<td className="max-w-xs truncate px-4 py-3 text-zinc-700 dark:text-zinc-200" title={f.originalName}>
										{f.originalName}
									</td>
									<td className="px-4 py-3 text-zinc-500 dark:text-zinc-400">{formatBytes(f.sizeBytes)}</td>
									<td className="px-4 py-3 text-zinc-500 dark:text-zinc-400">{format(new Date(f.createdAt), 'PP p')}</td>
									<td className="px-4 py-3">
										<div className="flex flex-wrap gap-2">
											<button onClick={() => preview(f)} className={neutralBtn}>
												Preview
											</button>
											<button onClick={() => share(f)} className={shareBtn}>
												Share
											</button>
											<button onClick={() => download(f)} className={primaryBtn}>
												Download
											</button>
											<button onClick={() => rename(f._id)} className={outlineBtn}>
												Rename
											</button>
											<button onClick={() => remove(f._id)} className={dangerBtn}>
												Delete
											</button>
										</div>
									</td>
								</tr>
							))
						)}
					</tbody>
				</table>
			</div>
		</div>
	);
}


