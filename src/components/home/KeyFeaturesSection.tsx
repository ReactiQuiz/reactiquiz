// src/components/home/KeyFeaturesSection.tsx
import React from 'react';
import { Box, Typography, Container } from '@mui/material';
import { motion } from 'framer-motion';
import QuizIcon from '@mui/icons-material/Quiz';
import DashboardIcon from '@mui/icons-material/Dashboard';
import StyleIcon from '@mui/icons-material/Style';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import SpeedIcon from '@mui/icons-material/Speed';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import PsychologyIcon from '@mui/icons-material/Psychology';

const features = [
	{ 
		title: 'Smart Quizzes', 
		desc: 'Adaptive questions and instant feedback to accelerate learning.',
		icon: QuizIcon,
		gradient: 'from-blue-500 to-cyan-500',
		bgGradient: 'from-blue-500/20 to-cyan-500/20'
	},
	{ 
		title: 'Subject Dashboards', 
		desc: 'Track progress across topics with elegant visualizations.',
		icon: DashboardIcon,
		gradient: 'from-purple-500 to-pink-500',
		bgGradient: 'from-purple-500/20 to-pink-500/20'
	},
	{ 
		title: 'Flashcards', 
		desc: 'Spaced repetition and rapid review to retain more.',
		icon: StyleIcon,
		gradient: 'from-green-500 to-emerald-500',
		bgGradient: 'from-green-500/20 to-emerald-500/20'
	},
	{ 
		title: 'AI Assistance', 
		desc: 'Ask questions and analyze results with built-in AI.',
		icon: SmartToyIcon,
		gradient: 'from-orange-500 to-red-500',
		bgGradient: 'from-orange-500/20 to-red-500/20'
	},
];

const KeyFeaturesSection: React.FC = () => {
    return (
		<Box 
			sx={{ 
				py: { xs: 8, md: 12 },
				position: 'relative',
				'&::before': {
					content: '""',
					position: 'absolute',
					inset: 0,
					background: 'radial-gradient(ellipse at 50% 0%, rgba(147, 51, 234, 0.1) 0%, transparent 50%)',
					pointerEvents: 'none',
				}
			}}
		>
			<Container maxWidth="lg">
				{/* Section Header */}
				<motion.div
					initial={{ opacity: 0, y: 30 }}
					whileInView={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.8 }}
					viewport={{ once: true }}
					className="text-center mb-16"
				>
					<div className="flex justify-center mb-6">
						<div className="flex items-center space-x-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30">
							<TrendingUpIcon sx={{ fontSize: 20, color: '#8b5cf6' }} />
							<span className="text-purple-300 text-sm font-medium">Features</span>
						</div>
					</div>
					
					<Typography 
						variant="h2" 
						component="h2"
						sx={{
							fontSize: { xs: '2.5rem', sm: '3rem', md: '3.5rem' },
							fontWeight: 800,
							background: 'linear-gradient(135deg, #ffffff 0%, #8b5cf6 50%, #3b82f6 100%)',
							backgroundClip: 'text',
							WebkitBackgroundClip: 'text',
							WebkitTextFillColor: 'transparent',
							mb: 3,
							letterSpacing: '-0.02em',
						}}
					>
						Everything you need to master your subjects
					</Typography>
					
					<Typography
						variant="h6"
						sx={{
							color: 'rgba(255, 255, 255, 0.7)',
							maxWidth: '600px',
							mx: 'auto',
							fontSize: { xs: '1rem', sm: '1.125rem' },
							lineHeight: 1.6,
						}}
					>
						Powerful tools designed to enhance your learning experience and help you achieve your goals
					</Typography>
				</motion.div>

				{/* Features Grid */}
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
					{features.map((feature, idx) => (
						<motion.div
							key={idx}
							initial={{ opacity: 0, y: 30 }}
							whileInView={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6, delay: idx * 0.1 }}
							viewport={{ once: true }}
							whileHover={{ y: -8, scale: 1.02 }}
							className="group relative"
						>
							<div className={`relative rounded-2xl bg-gradient-to-br ${feature.bgGradient} backdrop-blur-sm border border-white/10 p-6 h-full transition-all duration-300 hover:border-white/20 hover:shadow-2xl hover:shadow-purple-500/20`}>
								{/* Background glow effect */}
								<div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
								
								{/* Icon */}
								<motion.div
									whileHover={{ rotate: 10, scale: 1.1 }}
									transition={{ type: "spring", stiffness: 300 }}
									className="relative z-10"
								>
									<div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 shadow-lg`}>
										<feature.icon sx={{ fontSize: 28, color: 'white' }} />
									</div>
								</motion.div>
								
								{/* Content */}
								<div className="relative z-10">
									<h3 className="text-xl font-bold text-white mb-3 group-hover:text-white transition-colors">
										{feature.title}
									</h3>
									<p className="text-gray-300 text-sm leading-relaxed group-hover:text-gray-200 transition-colors">
										{feature.desc}
									</p>
								</div>
								
								{/* Animated progress bar */}
								<motion.div
									className={`absolute bottom-0 left-0 h-1 bg-gradient-to-r ${feature.gradient} rounded-b-2xl`}
									initial={{ width: 0 }}
									whileInView={{ width: "100%" }}
									transition={{ duration: 1, delay: idx * 0.2 }}
									viewport={{ once: true }}
								/>
								
								{/* Corner decoration */}
								<div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
									<AutoAwesomeIcon sx={{ fontSize: 16, color: '#8b5cf6' }} />
								</div>
							</div>
						</motion.div>
					))}
				</div>
				
				{/* Bottom decoration */}
				<motion.div
					initial={{ opacity: 0, scale: 0.8 }}
					whileInView={{ opacity: 1, scale: 1 }}
					transition={{ duration: 0.8, delay: 0.5 }}
					viewport={{ once: true }}
					className="flex justify-center mt-12"
				>
					<div className="flex items-center space-x-4 px-6 py-3 rounded-full bg-white/5 backdrop-blur border border-white/10">
						<SpeedIcon sx={{ fontSize: 20, color: '#3b82f6' }} />
						<span className="text-white/80 text-sm font-medium">Accelerate Your Learning Journey</span>
						<PsychologyIcon sx={{ fontSize: 20, color: '#8b5cf6' }} />
					</div>
				</motion.div>
			</Container>
		</Box>
	);
};

export default KeyFeaturesSection;