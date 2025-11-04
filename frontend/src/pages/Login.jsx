import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import ModeToggle from '../components/ModeToggle';

export default function Login() {
	const { login } = useAuth();
	const nav = useNavigate();
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [loading, setLoading] = useState(false);

	const onSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		try {
			await login(email, password);
			toast.success('Welcome back!');
			nav('/app');
		} catch (err) {
			toast.error(err?.response?.data?.message || 'Login failed');
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-6 py-12 sm:px-10">
			<div className="absolute right-6 top-6 z-20">
				<ModeToggle />
			</div>

			<motion.div
				initial={{ opacity: 0, scale: 0.92, y: 20 }}
				animate={{ opacity: 1, scale: 1, y: 0 }}
				transition={{ duration: 0.6, ease: 'easeOut' }}
				className="relative z-10 w-full max-w-md perspective"
			>
				<div className="glass-card dark:glass-card-dark border border-white/30 p-8 dark:border-white/10">
					<div className="mb-6 text-center">
						<h1 className="text-3xl font-semibold text-zinc-900 dark:text-white">Welcome back</h1>
						<p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">Sign in to continue to your cloud vault</p>
					</div>
					<form onSubmit={onSubmit} className="space-y-4">
						<label className="block">
							<span className="mb-1 block text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Email</span>
							<input
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								type="email"
								placeholder="name@example.com"
								className="w-full rounded-2xl border border-white/40 bg-white/70 px-4 py-3 text-sm text-zinc-700 shadow-inner outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-300/40 dark:border-white/10 dark:bg-zinc-900/70 dark:text-zinc-100 dark:focus:ring-indigo-500/30"
								required
							/>
						</label>
						<label className="block">
							<span className="mb-1 block text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Password</span>
							<input
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								type="password"
								placeholder="••••••••"
								className="w-full rounded-2xl border border-white/40 bg-white/70 px-4 py-3 text-sm text-zinc-700 shadow-inner outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-300/40 dark:border-white/10 dark:bg-zinc-900/70 dark:text-zinc-100 dark:focus:ring-indigo-500/30"
								required
							/>
						</label>
						<motion.button
							type="submit"
							disabled={loading}
							whileTap={{ scale: 0.98 }}
							className="w-full rounded-2xl bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-orange-400 px-4 py-3 text-sm font-semibold text-white shadow-neon transition hover:brightness-110 disabled:opacity-60"
						>
							{loading ? 'Signing in…' : 'Sign In'}
						</motion.button>
					</form>
				</div>
				<p className="mt-6 text-center text-sm text-zinc-600 dark:text-zinc-400">
					No account? <Link to="/signup" className="font-medium text-indigo-500 hover:text-indigo-400">Create one</Link>
				</p>
			</motion.div>
		</div>
	);
}


