import { motion } from 'framer-motion';

const particles = [
	{ size: 240, top: '15%', left: '12%', color: 'rgba(99,102,241,0.35)', duration: 22 },
	{ size: 320, top: '68%', left: '18%', color: 'rgba(236,72,153,0.28)', duration: 28 },
	{ size: 260, top: '30%', left: '74%', color: 'rgba(45,212,191,0.32)', duration: 24 },
	{ size: 180, top: '70%', left: '68%', color: 'rgba(250,204,21,0.25)', duration: 30 },
	{ size: 280, top: '42%', left: '46%', color: 'rgba(56,189,248,0.25)', duration: 26 },
];

export default function AnimatedBackground() {
	return (
		<div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
			<motion.div
				className="absolute inset-0 bg-animated"
				animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
				transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
		/>

			<div className="absolute inset-0 bg-gradient-to-br from-white/45 via-transparent to-white/10 dark:from-zinc-800/40 dark:via-transparent dark:to-black/40" />

			{particles.map((bubble, index) => (
				<motion.div
					key={index}
					className="particle"
					style={{
						width: bubble.size,
						height: bubble.size,
						top: bubble.top,
						left: bubble.left,
						background: bubble.color,
					}}
					animate={{ y: [0, -30, 0], x: [0, 20, 0] }}
					transition={{ duration: bubble.duration, repeat: Infinity, ease: 'easeInOut' }}
				/>
			))}
		</div>
	);
}


