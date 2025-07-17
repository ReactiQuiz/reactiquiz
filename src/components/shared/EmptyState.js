// src/components/shared/EmptyState.js
import { Box, Paper, Typography, Button } from '@mui/material';

function EmptyState({ IconComponent, title, message, actionText, onActionClick }) {
    return (
        <Paper
            elevation={2}
            sx={{
                p: { xs: 3, sm: 4 },
                textAlign: 'center',
                mt: 4,
                mx: 'auto',
                maxWidth: '600px',
            }}
        >
            <IconComponent sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" gutterBottom>{title}</Typography>
            <Typography sx={{ mb: 3, color: 'text.secondary' }}>{message}</Typography>
            {onActionClick && actionText && (
                <Button variant="contained" onClick={onActionClick}>
                    {actionText}
                </Button>
            )}
        </Paper>
    );
}

export default EmptyState;