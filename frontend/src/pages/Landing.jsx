import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Github, Linkedin, Instagram, Share2, ShieldCheck, Cloud, FolderGit2, Zap } from 'lucide-react';
import ModeToggle from '../components/ModeToggle';

const features = [
	{
		icon: Cloud,
		title: 'Glassmorphic Storage',
		description: 'Secure, responsive, and elegant cloud file management that shines on every device.',
	},
	{
		icon: FolderGit2,
		title: 'Organized Workflows',
		description: 'Create folders, preview files, and collaborate with shareable links in seconds.',
	},
	{
		icon: ShieldCheck,
		title: 'Protected Access',
		description: 'JWT-secured API, MongoDB metadata, and optimized uploads for peace of mind.',
	},
	{
		icon: Zap,
		title: 'Optimized Performance',
		description: 'Built with Vite, React, Tailwind, and Framer Motion for smooth, blazing-fast UX.',
	},
];

export default function Landing() {
	const handleShare = async () => {
		const shareUrl = window.location.href;
		try {
			if (navigator.share) {
				await navigator.share({
					title: 'CodeGai Cloud Drive',
					text: 'Check out this futuristic glassmorphism cloud storage experience!',
					url: shareUrl,
				});
				return;
			}
			await navigator.clipboard.writeText(shareUrl);
			toast.success('Link copied to clipboard!');
		} catch (error) {
			try {
				const temp = document.createElement('textarea');
				temp.value = shareUrl;
				temp.setAttribute('readonly', '');
				temp.style.position = 'absolute';
				temp.style.left = '-9999px';
				document.body.appendChild(temp);
				temp.select();
				document.execCommand('copy');
				document.body.removeChild(temp);
				toast.success('Link copied to clipboard!');
			} catch (err) {
				toast.error('Unable to share link');
			}
		}
	};

	return (
		<div className="relative min-h-dvh overflow-hidden bg-animated">
			<div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-white/10 dark:from-zinc-900/40 dark:via-transparent dark:to-black/40" />
			<div className="absolute left-10 top-20 h-72 w-72 rounded-full bg-indigo-500/20 blur-3xl" />
			<div className="absolute right-[-60px] bottom-[-80px] h-80 w-80 rounded-full bg-fuchsia-500/25 blur-3xl" />

			<header className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-8">
				<motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: 'easeOut' }} className="flex items-center gap-3">
					<div className="h-11 w-11 rounded-full bg-gradient-to-br from-indigo-500 via-fuchsia-500 to-cyan-400 p-[2px]">
						<div className="flex h-full w-full items-center justify-center rounded-full bg-white/80 text-sm font-semibold text-indigo-600 backdrop-blur-lg dark:bg-zinc-900/80 dark:text-indigo-300">
							CG
						</div>
					</div>
					<div>
						<p className="text-xs uppercase tracking-[0.4em] text-zinc-500 dark:text-zinc-400">CodeGai's</p>
						<h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Cloud Drive</h1>
					</div>
				</motion.div>
				<div className="flex items-center gap-3">
					<ModeToggle />
					<Link
						to="/login"
						className="rounded-full border border-white/60 bg-white/70 px-4 py-2 text-xs font-semibold text-zinc-600 backdrop-blur-lg transition hover:border-indigo-300 hover:text-indigo-500 dark:border-white/15 dark:bg-zinc-900/60 dark:text-zinc-200 dark:hover:text-indigo-300"
					>
						Sign In
					</Link>
					<Link
						to="/app"
						className="rounded-full bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-cyan-400 px-4 py-2 text-xs font-semibold text-white shadow-[0_12px_30px_rgba(99,102,241,0.32)] transition hover:scale-[1.02]"
					>
						Open App
					</Link>
				</div>
			</header>

			<main className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-16 px-6 pb-20">
				<section className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
					<motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: 'easeOut', delay: 0.1 }} className="glass-card dark:glass-card-dark border border-white/30 bg-white/65/70 p-8 text-left dark:border-white/10">
						<p className="text-sm uppercase tracking-[0.35em] text-indigo-500/80 dark:text-indigo-300/80">Futuristic Storage</p>
						<h2 className="mt-4 text-4xl font-semibold text-zinc-900 dark:text-white sm:text-5xl">
							Your glassmorphism cloud hub for creative teams
						</h2>
						<p className="mt-6 text-base leading-relaxed text-zinc-600 dark:text-zinc-300">
							Upload, organize, and preview files inside a polished interface crafted with glass panels, neon gradients, and seamless motion. Built for responsive workflows, ready for production deployments.
						</p>
						<div className="mt-8 flex flex-wrap items-center gap-3">
							<Link
								to="/signup"
								className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-cyan-400 px-6 py-2 text-sm font-semibold text-white shadow-[0_16px_35px_rgba(99,102,241,0.32)] transition hover:scale-[1.02]"
							>
								Get Started
							</Link>
							<button
								onClick={handleShare}
								className="inline-flex items-center gap-2 rounded-full border border-fuchsia-200/60 bg-white/80 px-6 py-2 text-sm font-semibold text-fuchsia-500 backdrop-blur-xl transition hover:border-fuchsia-400 hover:text-fuchsia-400 dark:border-fuchsia-400/40 dark:bg-zinc-900/70 dark:text-fuchsia-200"
							>
								<Share2 className="h-4 w-4" /> Share
							</button>
						</div>
					</motion.div>
					<motion.div
						className="glass-card dark:glass-card-dark border border-white/20 p-0 dark:border-white/10"
						initial={{ opacity: 0, scale: 0.94, rotateX: 8 }}
						animate={{ opacity: 1, scale: 1, rotateX: 0 }}
						transition={{ duration: 0.7, ease: 'easeOut', delay: 0.2 }}
					>
						<div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-white/60 to-white/20 p-8 dark:from-zinc-950/70 dark:to-zinc-900/60">
							<div className="absolute inset-0 rounded-[32px] border border-white/30 dark:border-white/10" />
							<div className="relative flex flex-col gap-6">
								<div className="rounded-2xl border border-white/40 bg-white/70 p-6 text-sm text-zinc-600 shadow-[0_14px_35px_rgba(79,70,229,0.12)] backdrop-blur-lg dark:border-white/15 dark:bg-zinc-900/60 dark:text-zinc-200">
									<span className="text-xs tracking-wide text-indigo-500/80 dark:text-indigo-300/80">Storage Usage</span>
									<p className="mt-2 text-lg font-semibold text-zinc-900 dark:text-white">0 B / 2 GB</p>
									<div className="mt-4 h-2 rounded-full bg-zinc-200/80 dark:bg-zinc-800/80">
										<div className="h-2 w-1/6 rounded-full bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-cyan-400" />
									</div>
								</div>
								<div className="rounded-2xl border border-white/30 bg-white/70 p-6 text-sm text-zinc-600 shadow-[0_14px_35px_rgba(45,212,191,0.12)] backdrop-blur-lg dark:border-white/15 dark:bg-zinc-900/60 dark:text-zinc-200">
									<span className="text-xs tracking-wide text-cyan-500/80 dark:text-cyan-300/80">Recent Activity</span>
									<ul className="mt-3 space-y-2">
										<li>✨ Uploaded <strong>brand-style-guide.pdf</strong></li>
										<li>📂 Created folder <strong>Marketing Shots</strong></li>
										<li>🔗 Shared <strong>promo-video.mp4</strong> with the team</li>
									</ul>
								</div>
							</div>
						</div>
					</motion.div>
				</section>

				<section>
					<motion.h3 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-center text-sm uppercase tracking-[0.4em] text-indigo-500/80 dark:text-indigo-300/80">
						Why Teams Choose CodeGai
					</motion.h3>
					<div className="mt-8 grid gap-6 sm:grid-cols-2">
						{features.map(({ icon: Icon, title, description }) => (
							<motion.div
								key={title}
								initial={{ opacity: 0, y: 18 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: true }}
								transition={{ duration: 0.5, ease: 'easeOut' }}
								className="glass-card dark:glass-card-dark border border-white/30 p-6 dark:border-white/10"
							>
								<Icon className="h-10 w-10 text-indigo-500 dark:text-indigo-300" />
								<h4 className="mt-4 text-lg font-semibold text-zinc-900 dark:text-white">{title}</h4>
								<p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">{description}</p>
							</motion.div>
						))}
					</div>
				</section>
			</main>

			<footer className="relative z-10 border-t border-white/40 bg-white/40 backdrop-blur-xl dark:border-white/10 dark:bg-zinc-950/40">
				<div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-6 py-6 sm:flex-row sm:items-center sm:justify-between">
					<p className="text-xs text-zinc-600 dark:text-zinc-400">© {new Date().getFullYear()} CodeGai's Cloud Drive. Crafted for modern creators.</p>
					<div className="flex items-center gap-4">
						<a href="https://github.com/Gangaram-Sumanth-Reddy" target="_blank" rel="noreferrer" className="rounded-full border border-white/40 bg-white/70 p-2 text-zinc-600 transition hover:border-indigo-300 hover:text-indigo-500 dark:border-white/15 dark:bg-zinc-900/70 dark:text-zinc-200 dark:hover:text-indigo-300">
							<Github className="h-4 w-4" />
						</a>
						<a href="https://www.linkedin.com/gangaramsumanth" target="_blank" rel="noreferrer" className="rounded-full border border-white/40 bg-white/70 p-2 text-zinc-600 transition hover:border-indigo-300 hover:text-indigo-500 dark:border-white/15 dark:bg-zinc-900/70 dark:text-zinc-200 dark:hover:text-indigo-300">
							<Linkedin className="h-4 w-4" />
						</a>
						<a href="https://www.instagram.com/codegai_tech?igsh=cW5jdms1M3NtaDJ3" target="_blank" rel="noreferrer" className="rounded-full border border-white/40 bg-white/70 p-2 text-zinc-600 transition hover:border-indigo-300 hover:text-indigo-500 dark:border-white/15 dark:bg-zinc-900/70 dark:text-zinc-200 dark:hover:text-indigo-300">
							<Instagram className="h-4 w-4" />
						</a>
					</div>
				</div>
		</footer>
		</div>
	);
}


