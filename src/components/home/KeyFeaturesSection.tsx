// src/components/home/KeyFeaturesSection.tsx
import React from 'react';
import { Box, Typography, Container } from '@mui/material';

const features = [
	{ title: 'Smart Quizzes', desc: 'Adaptive questions and instant feedback to accelerate learning.' },
	{ title: 'Subject Dashboards', desc: 'Track progress across topics with elegant visualizations.' },
	{ title: 'Flashcards', desc: 'Spaced repetition and rapid review to retain more.' },
	{ title: 'AI Assistance', desc: 'Ask questions and analyze results with built-in AI.' },
];

const KeyFeaturesSection: React.FC = () => {
    return (
		<Box sx={{ py: { xs: 4, md: 8 } }}>
			<Container maxWidth="lg">
				<Typography variant="h4" align="center" sx={{ fontWeight: 'bold', mb: 4 }}>
					Everything you need to master your subjects
            </Typography>
				{/* Tailwind-based card grid with subtle 21st.dev-like motion */}
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
					{features.map((f, idx) => (
						<div
							key={idx}
							className="group rounded-xl border border-gray-200 dark:border-gray-800 bg-white/70 dark:bg-neutral-900/60 backdrop-blur p-5 shadow-sm hover:shadow-md transition-shadow duration-300"
						>
							<div className="h-10 w-10 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-500 opacity-90 group-hover:scale-110 transition-transform duration-300" />
							<h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
								{f.title}
							</h3>
							<p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
								{f.desc}
							</p>
							<div className="mt-4 h-1 w-0 group-hover:w-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500" />
						</div>
					))}
				</div>
      </Container>
    </Box>
  );
};

export default KeyFeaturesSection;