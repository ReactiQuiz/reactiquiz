import React from 'react';
import {
    Box, Typography, Link, Stack,
} from '@mui/material';

const Footer: React.FC = () => {
    return (
        <Box component="footer" sx={{ bgcolor: 'background.paper', p: 2, borderTop: '1px solid rgba(255, 255, 255, 0.12)' }}>
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
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                © 2025 ReactiQuiz. All Rights Reserved.
            </Typography>
        </Box>
    );
};

export default Footer;