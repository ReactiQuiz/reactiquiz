// src/components/core/Footer.tsx
/**
 * Footer Component
 * 
 * This component renders the application footer with links to important
 * pages (Privacy Policy, Terms of Service, Contact, About) and copyright
 * information.
 */
import React from 'react';
import {
    Box, Typography, Link, Stack,
} from '@mui/material';

/**
 * Footer Component
 * 
 * Renders the footer section at the bottom of the application.
 * Includes navigation links to legal and informational pages,
 * and displays copyright information.
 * 
 * @returns {JSX.Element} Footer component with links and copyright
 */
const Footer: React.FC = () => {
    return (
        <Box 
            component="footer" 
            sx={{ 
                bgcolor: 'background.paper', // Background color from theme
                p: 2, // Padding
                borderTop: '1px solid',
                borderColor: 'divider',
            }}
        >
            {/* Footer Navigation Links */}
            <Stack direction="row" justifyContent="center" spacing={3} sx={{ mb: 2 }}>
                <Link href="/privacy-policy" color="text.secondary" underline="hover">
                    Privacy Policy
                </Link>
                <Link href="/terms-of-service" color="text.secondary" underline="hover">
                    Terms of Service
                </Link>
                <Link href="/contact" color="text.secondary" underline="hover">
                    Contact Us
                </Link>
                <Link href="/about-guest" color="text.secondary" underline="hover">
                    About
                </Link>
            </Stack>
            
            {/* Copyright Information */}
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                © 2026 ReactiQuiz. All Rights Reserved.
            </Typography>
        </Box>
    );
};

export default Footer;