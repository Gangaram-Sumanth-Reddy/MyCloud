import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'react-toastify';
import { api } from '../api/client';

export default function UploadArea({ activeFolder, onUploaded }) {
	const [progress, setProgress] = useState(0);
	const onDrop = useCallback(async (acceptedFiles) => {
		for (const file of acceptedFiles) {
			const form = new FormData();
			form.append('file', file);
			form.append('folder', activeFolder || 'root');
			try {
				await api.post('/files/upload', form, {
					onUploadProgress: (e) => setProgress(Math.round((e.loaded * 100) / (e.total || 1))),
					headers: { 'Content-Type': 'multipart/form-data' },
				});
				toast.success(`Uploaded ${file.name}`);
				onUploaded?.();
			} catch (err) {
				toast.error(`Failed to upload ${file.name}`);
			}
		}
		setProgress(0);
	}, [activeFolder, onUploaded]);

	const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });
	return (
		<div
			{...getRootProps()}
			className={`group relative overflow-hidden rounded-[28px] border border-dashed p-8 text-center transition-all duration-300 ease-out ${
				isDragActive
					? 'border-indigo-400/80 bg-indigo-400/15 shadow-[0_22px_48px_rgba(99,102,241,0.22)] backdrop-blur-xl dark:border-indigo-300/80 dark:bg-indigo-300/15'
					: 'border-white/45 bg-white/70 shadow-[0_18px_40px_rgba(15,23,42,0.12)] backdrop-blur-xl hover:border-indigo-300/70 hover:shadow-[0_24px_55px_rgba(99,102,241,0.25)] dark:border-white/12 dark:bg-zinc-900/60 dark:hover:border-indigo-400/50'
			} cursor-pointer hover:scale-[1.01]`}
		>
			<input {...getInputProps()} />
			<p className="text-sm font-medium text-zinc-600 transition group-hover:text-zinc-800 dark:text-zinc-300 dark:group-hover:text-zinc-100">
				Drag & drop files here, or click to select
			</p>
			{progress > 0 && (
				<div className="mt-5 h-2 w-full rounded-full bg-zinc-200/70 dark:bg-zinc-800/80">
					<div className="h-2 rounded-full bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-orange-400" style={{ width: `${progress}%` }} />
				</div>
			)}
		</div>
	);
}


