import React from 'react';
import {
    Box, Typography,
} from '@mui/material';

const Footer: React.FC = () => {
    return (
        <Box component="footer" sx={{ bgcolor: 'background.paper', p: 2, textAlign: 'center', borderTop: '1px solid rgba(255, 255, 255, 0.12)' }}>
            <Typography variant="body2" color="text.secondary">
                © 2025 ReactiQuiz. All Rights Reserved.
            </Typography>
        </Box>
    );
};

export default Footer;