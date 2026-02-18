import { create } from 'zustand';

const now = () => new Date().toISOString();
const generateId = (prefix) => `${prefix}-${Math.random().toString(36).slice(2, 9)}`;

const initialFolders = {
	root: {
		id: 'root',
		name: 'Home',
		createdAt: now(),
		parentId: null,
		folderIds: ['fld-brand', 'fld-assets', 'fld-clients'],
		fileIds: ['file-overview', 'file-roadmap'],
	},
	'fld-brand': {
		id: 'fld-brand',
		name: 'Brand Library',
		createdAt: now(),
		parentId: 'root',
		folderIds: ['fld-guidelines'],
		fileIds: ['file-logo', 'file-color-palette'],
	},
	'fld-assets': {
		id: 'fld-assets',
		name: 'Marketing Assets',
		createdAt: now(),
		parentId: 'root',
		folderIds: ['fld-photos', 'fld-video'],
		fileIds: ['file-press'],
	},
	'fld-clients': {
		id: 'fld-clients',
		name: 'Client Handoffs',
		createdAt: now(),
		parentId: 'root',
		folderIds: [],
		fileIds: ['file-contract', 'file-invoice'],
	},
	'fld-guidelines': {
		id: 'fld-guidelines',
		name: 'Guidelines',
		createdAt: now(),
		parentId: 'fld-brand',
		folderIds: [],
		fileIds: ['file-brand-book'],
	},
	'fld-photos': {
		id: 'fld-photos',
		name: 'Photography',
		createdAt: now(),
		parentId: 'fld-assets',
		folderIds: [],
		fileIds: ['file-hero', 'file-team'],
	},
	'fld-video': {
		id: 'fld-video',
		name: 'Video',
		createdAt: now(),
		parentId: 'fld-assets',
		folderIds: [],
		fileIds: ['file-launch-teaser'],
	},
};

const initialFiles = {
	'file-overview': {
		id: 'file-overview',
		name: 'Project Overview.pdf',
		type: 'pdf',
		size: 524288,
		createdAt: now(),
		parentId: 'root',
		url: '#',
	},
	'file-roadmap': {
		id: 'file-roadmap',
		name: 'Roadmap 2025.fig',
		type: 'figma',
		size: 786432,
		createdAt: now(),
		parentId: 'root',
		url: '#',
	},
	'file-logo': {
		id: 'file-logo',
		name: 'Primary Logo.svg',
		type: 'svg',
		size: 45875,
		createdAt: now(),
		parentId: 'fld-brand',
		url: '#',
	},
	'file-color-palette': {
		id: 'file-color-palette',
		name: 'Color Palette.ase',
		type: 'ase',
		size: 23658,
		createdAt: now(),
		parentId: 'fld-brand',
		url: '#',
	},
	'file-brand-book': {
		id: 'file-brand-book',
		name: 'Brand Book.pdf',
		type: 'pdf',
		size: 1052672,
		createdAt: now(),
		parentId: 'fld-guidelines',
		url: '#',
	},
	'file-press': {
		id: 'file-press',
		name: 'Press Kit.zip',
		type: 'zip',
		size: 2051278,
		createdAt: now(),
		parentId: 'fld-assets',
		url: '#',
	},
	'file-hero': {
		id: 'file-hero',
		name: 'Hero Image.jpg',
		type: 'jpg',
		size: 356371,
		createdAt: now(),
		parentId: 'fld-photos',
		url: '#',
	},
	'file-team': {
		id: 'file-team',
		name: 'Team Portrait.png',
		type: 'png',
		size: 489325,
		createdAt: now(),
		parentId: 'fld-photos',
		url: '#',
	},
	'file-launch-teaser': {
		id: 'file-launch-teaser',
		name: 'Launch Teaser.mp4',
		type: 'mp4',
		size: 7340032,
		createdAt: now(),
		parentId: 'fld-video',
		url: '#',
	},
	'file-contract': {
		id: 'file-contract',
		name: 'Client Contract.docx',
		type: 'docx',
		size: 182355,
		createdAt: now(),
		parentId: 'fld-clients',
		url: '#',
	},
	'file-invoice': {
		id: 'file-invoice',
		name: 'Invoice_Q3.xlsx',
		type: 'xlsx',
		size: 143257,
		createdAt: now(),
		parentId: 'fld-clients',
		url: '#',
	},
};

const DEFAULT_STORAGE_LIMIT = 2 * 1024 * 1024 * 1024;

const useFileSystem = create((set, get) => ({
	folders: initialFolders,
	files: initialFiles,
	currentFolderId: 'root',
	activities: [],
	uploads: [],
	setCurrentFolder: (id) => {
		const { folders } = get();
		if (!folders[id]) return;
		set({ currentFolderId: id });
	},
	goToParent: () => {
		const { folders, currentFolderId } = get();
		const parentId = folders[currentFolderId]?.parentId;
		if (parentId) set({ currentFolderId: parentId });
	},
	getBreadcrumbs: () => {
		const { folders, currentFolderId } = get();
		const path = [];
		let id = currentFolderId;
		while (id) {
			const folder = folders[id];
			if (!folder) break;
			path.unshift(folder);
			id = folder.parentId;
		}
		return path;
	},
	getCurrentFolders: () => {
		const { folders, currentFolderId } = get();
		const folder = folders[currentFolderId];
		if (!folder) return [];
		return folder.folderIds.map((id) => folders[id]).filter(Boolean);
	},
	getCurrentFiles: () => {
		const { folders, files, currentFolderId } = get();
		const folder = folders[currentFolderId];
		if (!folder) return [];
		return folder.fileIds.map((id) => files[id]).filter(Boolean);
	},
	getUsage: () => {
		const { files } = get();
		const usedStorageBytes = Object.values(files).reduce((sum, file) => sum + (file.size || 0), 0);
		return { usedStorageBytes, storageLimitBytes: DEFAULT_STORAGE_LIMIT };
	},
	createFolder: (name, parentId) => {
		const parent = parentId || get().currentFolderId;
		let createdId = '';
		set((state) => {
			const parentFolder = state.folders[parent];
			if (!parentFolder) return state;
			const id = generateId('fld');
			createdId = id;
			const folders = {
				...state.folders,
				[id]: {
					id,
					name,
					createdAt: now(),
					parentId: parent,
					folderIds: [],
					fileIds: [],
				},
				[parent]: {
					...parentFolder,
					folderIds: [...parentFolder.folderIds, id],
				},
			};
			return { folders };
		});
		return createdId;
	},
	createFiles: (fileMetas, parentId) => {
		const parent = parentId || get().currentFolderId;
		const createdIds = [];
		set((state) => {
			const parentFolder = state.folders[parent];
			if (!parentFolder) return state;
			const folders = { ...state.folders, [parent]: { ...parentFolder, fileIds: [...parentFolder.fileIds] } };
			const files = { ...state.files };
			fileMetas.forEach((meta) => {
				const id = generateId('file');
				createdIds.push(id);
				files[id] = {
					id,
					name: meta.name,
					type: meta.type,
					size: meta.size,
					createdAt: meta.createdAt || now(),
					parentId: parent,
					url: meta.url || '#',
				};
				folders[parent].fileIds.push(id);
			});
			return { folders, files };
		});
		return createdIds;
	},
	renameItem: (id, kind, newName) => {
		let previousName = null;
		set((state) => {
			if (kind === 'folder') {
				const folder = state.folders[id];
				if (!folder) return state;
				previousName = folder.name;
				return {
					folders: {
						...state.folders,
						[id]: { ...folder, name: newName },
					},
				};
			}
			const file = state.files[id];
			if (!file) return state;
			previousName = file.name;
			return {
				files: {
					...state.files,
					[id]: { ...file, name: newName },
				},
			};
		});
		return previousName;
	},
	deleteItem: (id, kind) => {
		const removeFolderRecursive = (folderId, folders, files) => {
			const folder = folders[folderId];
			if (!folder) return;
		folder.folderIds.forEach((childId) => removeFolderRecursive(childId, folders, files));
		folder.fileIds.forEach((fileId) => {
			const file = files[fileId];
			if (file?.url?.startsWith('blob:') && typeof URL !== 'undefined') {
				URL.revokeObjectURL(file.url);
			}
			delete files[fileId];
		});
			delete folders[folderId];
		};

		let removed = null;
		set((state) => {
			if (kind === 'folder') {
				const folder = state.folders[id];
				if (!folder) return state;
				const folders = { ...state.folders };
				const files = { ...state.files };
				const parentId = folder.parentId;
				removed = { id, type: 'folder', name: folder.name };
				if (parentId && folders[parentId]) {
					folders[parentId] = {
						...folders[parentId],
						folderIds: folders[parentId].folderIds.filter((child) => child !== id),
					};
				}
				removeFolderRecursive(id, folders, files);
				const newState = { folders, files };
				if (state.currentFolderId === id && parentId) {
					newState.currentFolderId = parentId;
				}
				return newState;
			}
			const file = state.files[id];
			if (!file) return state;
			removed = { id, type: 'file', name: file.name };
		if (file.url?.startsWith('blob:') && typeof URL !== 'undefined') {
				URL.revokeObjectURL(file.url);
			}
			const parentFolder = state.folders[file.parentId];
			const files = { ...state.files };
			delete files[id];
			const folders = {
				...state.folders,
				[file.parentId]: {
					...parentFolder,
					fileIds: parentFolder.fileIds.filter((fileId) => fileId !== id),
				},
			};
			return { folders, files };
		});
		return removed;
	},
	addActivity: ({ type, name }) => {
		const entry = {
			id: generateId('act'),
			type,
			name,
			timestamp: now(),
		};
		set((state) => ({ activities: [entry, ...state.activities].slice(0, 100) }));
	},
	addUpload: (upload) => {
		set((state) => ({ uploads: [...state.uploads, upload] }));
	},
	updateUpload: (id, progress) => {
		set((state) => ({
			uploads: state.uploads.map((upload) => (upload.id === id ? { ...upload, progress } : upload)),
		}));
	},
	removeUpload: (id) => {
		set((state) => ({ uploads: state.uploads.filter((upload) => upload.id !== id) }));
	},
}));

export default useFileSystem;

